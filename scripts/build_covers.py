"""Build the committed project cover derivatives from full-resolution renders.

WHY THIS IS A SCRIPT AND NOT A BUILD STEP
-----------------------------------------
`next.config.ts` sets `images: { unoptimized: true }` (spec §12.2): Next does no
resizing and no format negotiation, so whatever sits in `public/` is what every
device downloads, byte for byte. That makes the delivery decision a property of the
*committed files* rather than of a runtime pipeline, and it is why `sizes` on
`<Figure>` is currently inert -- with no `srcset` generated there is nothing for it
to select from.

The sources are 8K renders (7680x4320, ConverseKit 8000x4500) totalling ~28 MB.
Covers render at 1200px max (`--container-content`), so the source carries roughly
130x more pixels than any display can use. Encoded here they come to ~500 KB for
all eight, verified against 1:1 crops as visually identical to the source.

This follows `build_brand.py`: the heavy originals stay *outside* the repo, the
derivatives are committed, and nothing in `pnpm build` depends on either. It is not
the `sharp` pipeline §12.2 rules out -- there is no build-time image processing, just
an occasional authoring step whose output is checked in.

RUNNING IT
----------
Only needed when a render changes. Requires `pillow`, which is not a project
dependency:

    pip install pillow
    python scripts/build_covers.py --src /path/to/renders

ENCODING CHOICES
----------------
- **2400px wide.** Twice the 1200px container, so it stays sharp on a 2x display.
  1600px measured ~30% smaller but is soft at 2x.
- **AVIF q65.** Measured against WebP q80 (~25% larger) and JPEG q82 (~2.5x larger)
  at matched appearance. Every evergreen browser and Safari 16+ decode it; with the
  optimizer off there is no automatic fallback, which is the accepted trade.
- **4:4:4 chroma.** Costs ~5% over 4:2:0 and keeps coloured text and UI edges from
  bleeding -- these are interface renders, not photographs, so the chroma detail is
  the subject rather than incidental.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image

# Source basename stem -> project slug. The renders are named for the product; the
# repo is keyed by slug (`content/projects/<slug>.json`), and the two only coincide
# for SynapseDeck. Written out rather than inferred, because a wrong guess here
# silently attaches one project's screenshot to another.
COVERS = {
    "conversekit": "conversekit-ai-chatbot",
    "synapsedeck": "synapsedeck-ai-flashcards",
    "surveyquest": "gamified-survey-prototype",
    "lms": "multitenant-lms-platform",
}

VARIANTS = ("light", "dark")

TARGET_WIDTH = 2400
QUALITY = 65
SUBSAMPLING = "4:4:4"
# Pillow's AVIF speed knob runs 0 (slowest, smallest) to 10. 4 is the point where
# further patience stopped paying: 0 saved under 2% and took several minutes a file.
SPEED = 4


def build(src_dir: Path, out_dir: Path) -> int:
    out_dir.mkdir(parents=True, exist_ok=True)
    total = 0

    for stem, slug in COVERS.items():
        for variant in VARIANTS:
            src = src_dir / f"{stem}-{variant}.png"
            if not src.exists():
                print(f"  MISSING  {src}", file=sys.stderr)
                return -1

            with Image.open(src) as im:
                im = im.convert("RGB")
                height = round(im.height * TARGET_WIDTH / im.width)
                resized = im.resize((TARGET_WIDTH, height), Image.LANCZOS)

            # `-16x9` matches the existing convention (`<slug>-cover-16x9.jpeg`); the
            # ratio stays in the name because §5.3 images run 21:9 to 9:16 and the
            # shape is worth reading off the filename.
            dest = out_dir / f"{slug}-cover-16x9-{variant}.avif"
            resized.save(
                dest,
                "AVIF",
                quality=QUALITY,
                subsampling=SUBSAMPLING,
                speed=SPEED,
            )

            kb = dest.stat().st_size / 1024
            total += dest.stat().st_size
            print(f"  {dest.name:<52} {resized.width}x{resized.height}  {kb:6.0f} KB")

    print(f"\n  {len(COVERS) * len(VARIANTS)} files, {total / 1024:.0f} KB total")
    return 0


def main() -> None:
    ap = argparse.ArgumentParser(description="Build project cover derivatives.")
    ap.add_argument("--src", required=True, type=Path, help="directory of full-res renders")
    ap.add_argument("--root", default=Path("."), type=Path, help="repo root")
    args = ap.parse_args()

    rc = build(args.src, args.root / "public" / "images" / "projects")
    raise SystemExit(rc if rc else 0)


if __name__ == "__main__":
    main()
