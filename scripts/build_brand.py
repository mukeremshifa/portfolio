"""Generate every brand asset from the Halimun display face.

WHY THIS IS A SCRIPT AND NOT A DEPENDENCY
-----------------------------------------
Halimun is *not* vendored into this repo, and must not be. Two reasons, in order of
weight:

1. **Licence.** The file this was drawn from is Creatype Studio's demo release, which is
   personal-use only. `docs/DECISIONS.md` (2026-08-30) records the commercial licence as
   an open obligation before launch. Committing the binary would redistribute it.
2. **Weight.** The site needs eight fixed strings of this face, not the face. Outlines
   cost a few KB in total; a webfont plus a fourth `next/font` family costs far more and
   buys nothing, because none of these strings is authored content -- they are artwork
   that happens to be lettering.

So the font is converted to outlines *here*, once, and the outlines are committed. Every
consumer downstream -- favicon, OG card, hero signature -- is a plain path or a PNG with
no runtime font dependency at all.

RUNNING IT
----------
Only needed if a mark changes. Requires `fonttools` and `pillow`, neither of which is a
project dependency; this is not part of `pnpm build`:

    pip install fonttools pillow
    python scripts/build_brand.py --font /path/to/Halimun.otf

The geometry constants below are the design. Each was chosen against a rendered contact
sheet rather than picked; the reasoning is inline, and the summary is in
`docs/DECISIONS.md`.
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import NamedTuple

from fontTools.misc.transform import Transform
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

UPEM = 1000

# --- Palette ------------------------------------------------------------------------
# Literals, deliberately. These are the §6.2/§6.3 values, and like `lib/og.ts` this file
# cannot see `globals.css`. If the emerald moves there, it moves here too.
BRAND = "#184e38"  # --brand-solid, identical in both themes
CREAM = "#f3ece2"  # --canvas light / --text dark

# --- Geometry -----------------------------------------------------------------------
# Monogram: S set 30% into M's ink width. Below ~25% the two letters read as a spaced
# pair rather than one mark; at 35% and beyond, M's right stem and S's stem converge
# into a single X and the S stops being an S. 30% interlocks with both letters intact.
MONO_OVERLAP = 0.30
MONO_RISE = 0.0  # S stays on the baseline. Raising it detaches the bowl and it floats.

# Wordmark: -70/1000em. Halimun already connects, so negative tracking closes the joins
# instead of opening gaps. Past -120 the final `m` of Mukerem and the `S` of Shifa
# collide in a way that reads as a mistake rather than as a ligature.
WORD_TRACKING = -70.0
WORD_GAP = 55.0  # ink gap held between words, solved for independently of tracking

# The header mark is set at roughly a quarter the hero's size, and tracking does not
# scale with it: -70 is a display value, and at a 26px cap it closes the joins until the
# word is one shape. -20 keeps the hand-written character while the letters stay separate.
HEADER_TRACKING = -20.0

# Small sizes: this is a ~29/1000em monoline, which is under one pixel at 32px. Every
# raster at or below 64px is dilated by stroking each outline in its own colour. The
# fractions are of the icon edge, tuned on a 16/32/48 contact sheet.
DILATE_BY_PX = {16: 0.020, 32: 0.014, 48: 0.010, 64: 0.008}


def hexrgb(value: str, alpha: int = 255) -> tuple[int, int, int, int]:
    value = value.lstrip("#")
    return (int(value[0:2], 16), int(value[2:4], 16), int(value[4:6], 16), alpha)


class Dot(NamedTuple):
    """A drawn period, in Y-up font units.

    Halimun has no punctuation at all -- its 71 glyphs are the Latin alphabet, the
    digits, and `!$?@`. There is no `.` to set, so the period in "Mukerem." is geometry
    rather than type: a circle at the pen's own weight, sitting on the baseline. That is
    the whole of the letterform work in this file, and it is confined to this shape.

    A placement list may hold these alongside `(char, x, y)` glyph entries.
    """

    cx: float
    cy: float
    r: float


# The period. DOT_R is a shade over half the face's ~29-unit monoline so the dot reads as
# a deliberate mark rather than a blob of the stroke; DOT_GAP is measured from the last
# glyph's ink, not its advance, because a script's advances overlap.
DOT_R = 34.0
DOT_GAP = 120.0


def dot_path_d(dot: Dot) -> str:
    """A circle as SVG path data, flipped to Y-down like the glyph outlines."""
    cx, cy, r = dot.cx, -dot.cy, dot.r
    return (
        f"M{cx - r:.1f} {cy:.1f}"
        f"A{r:.1f} {r:.1f} 0 1 0 {cx + r:.1f} {cy:.1f}"
        f"A{r:.1f} {r:.1f} 0 1 0 {cx - r:.1f} {cy:.1f}Z"
    )


class Face:
    """Thin wrapper over the OTF. Everything stays in font units, Y-up, until output."""

    def __init__(self, path: Path):
        self.path = path
        self.font = TTFont(str(path))
        self.glyphs = self.font.getGlyphSet()
        self.cmap = self.font.getBestCmap()

    def _name(self, ch: str) -> str:
        return self.cmap[ord(ch)]

    def bounds(self, ch: str):
        pen = BoundsPen(self.glyphs)
        self.glyphs[self._name(ch)].draw(pen)
        return pen.bounds

    def advance(self, ch: str) -> float:
        return self.glyphs[self._name(ch)].width

    def path_d(self, ch: str, dx: float = 0.0, dy: float = 0.0) -> str:
        """SVG path data for one glyph, flipped to Y-down and translated into place."""
        pen = SVGPathPen(
            self.glyphs, ntos=lambda v: f"{v:.1f}".rstrip("0").rstrip(".") or "0"
        )
        self.glyphs[self._name(ch)].draw(
            TransformPen(pen, Transform().translate(dx, -dy).scale(1, -1))
        )
        return pen.getCommands()

    def ink_box(self, placed):
        """Union ink box, Y-up, over `(char, pen_x, pen_y)` entries and `Dot`s."""
        boxes = []
        for item in placed:
            if isinstance(item, Dot):
                boxes.append(
                    (item.cx - item.r, item.cy - item.r, item.cx + item.r, item.cy + item.r)
                )
                continue
            ch, px, py = item
            x0, y0, x1, y1 = self.bounds(ch)
            boxes.append((x0 + px, y0 + py, x1 + px, y1 + py))
        return (
            min(b[0] for b in boxes),
            min(b[1] for b in boxes),
            max(b[2] for b in boxes),
            max(b[3] for b in boxes),
        )

    # --- Placements -----------------------------------------------------------------

    def monogram(self, overlap: float = MONO_OVERLAP, rise: float = MONO_RISE):
        """M with S driven `overlap` of the way into M's ink width."""
        mx0, _, mx1, _ = self.bounds("M")
        sx0 = self.bounds("S")[0]
        target = mx0 + (mx1 - mx0) * (1.0 - overlap)
        return [("M", 0.0, 0.0), ("S", target - sx0, rise)]

    def letter_m(self):
        return [("M", 0.0, 0.0)]

    def wordmark(self, text: str = "Mukerem Shifa", tracking: float = WORD_TRACKING):
        """Sequential advances plus `tracking`, with the word gap set by ink, not advance.

        Tracking a connected script squeezes the inter-word space as hard as it squeezes
        the joins, so the space is solved for afterwards: whatever pen delta leaves
        exactly WORD_GAP units of clear air between the last ink of one word and the
        first ink of the next.
        """
        placed: list[tuple[str, float, float]] = []
        pen = 0.0
        pending_space = False
        for ch in text:
            if ch == " ":
                pending_space = True
                continue
            if pending_space and placed:
                prev_ch, prev_x, _ = placed[-1]
                prev_ink_end = prev_x + self.bounds(prev_ch)[2]
                pen = prev_ink_end + WORD_GAP - self.bounds(ch)[0]
                pending_space = False
            placed.append((ch, pen, 0.0))
            pen += self.advance(ch) + tracking
        return placed

    def wordmark_first(self):
        """"Mukerem." -- the header lockup, one word and a drawn period.

        Two things differ from the hero signature deliberately. The tracking is looser,
        because the hero's -70 is set for type two inches tall: at the ~26px cap the
        header runs, that tracking welds the letters into a single blurred shape (it is
        what made the full name unusable up there in the first place). And it is one
        word, so it never meets WORD_GAP.

        The period is not decoration. It closes a mark that would otherwise read as a
        truncated first name, and it is the reason this is a lockup rather than a crop
        of the signature.
        """
        placed = list(self.wordmark("Mukerem", tracking=HEADER_TRACKING))
        last_ch, last_x, _ = placed[-1]
        cx = last_x + self.bounds(last_ch)[2] + DOT_GAP
        placed.append(Dot(cx, DOT_R, DOT_R))
        return placed


def geometry(face: Face, placed, pad: float = 40.0, square: bool = False):
    """The viewBox and path list for a placement -- the shared core of every vector out.

    Both the standalone `.svg` files and the generated TypeScript module come through
    here, so a mark cannot drift between the two.
    """
    x0, y0, x1, y1 = face.ink_box(placed)
    # ink_box is Y-up; paths are emitted Y-down, so the box flips with them.
    bx0, by0 = x0 - pad, -y1 - pad
    bw, bh = (x1 - x0) + pad * 2, (y1 - y0) + pad * 2
    if square:
        side = max(bw, bh)
        bx0 -= (side - bw) / 2
        by0 -= (side - bh) / 2
        bw = bh = side
    view_box = f"{bx0:.1f} {by0:.1f} {bw:.1f} {bh:.1f}"
    paths = [
        dot_path_d(item) if isinstance(item, Dot) else face.path_d(*item)
        for item in placed
    ]
    return view_box, paths


def svg(
    face: Face,
    placed,
    *,
    colour: str = "currentColor",
    pad: float = 40.0,
    dilate: float = 0.0,
    tile: str | None = None,
    title: str | None = None,
    square: bool = False,
) -> str:
    """One `<svg>` document for a placement.

    `dilate` widens the monoline by stroking each outline in its own colour, the same
    trick the rasters use, expressed in font units.

    `tile` fills the viewBox behind the mark. Its corners are square because §6.7 puts
    every radius token at 0px, and the logo should not be the one thing on the site
    carrying a curve.
    """
    view_box, paths = geometry(face, placed, pad, square)
    bx0, by0, bw, bh = (float(v) for v in view_box.split())

    # A mark with a name is an image; a mark without one is decoration sitting beside
    # text that already says the same thing. Never both.
    label = f' role="img" aria-label="{title}"' if title else ' aria-hidden="true"'
    out = [
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="{view_box}" fill="none"{label}>'
    ]
    if tile:
        out.append(
            f'<rect x="{bx0:.1f}" y="{by0:.1f}" width="{bw:.1f}" height="{bh:.1f}" '
            f'fill="{tile}"/>'
        )
    stroke = ""
    if dilate:
        stroke = (
            f' stroke="{colour}" stroke-width="{dilate * 2:.1f}"'
            ' stroke-linejoin="round" stroke-linecap="round"'
        )
    for d in paths:
        out.append(f'<path fill="{colour}"{stroke} d="{d}"/>')
    out.append("</svg>")
    return "\n".join(out) + "\n"


def emit_ts(marks: dict[str, tuple[str, list[str], str]]) -> str:
    """Emit the marks as a TypeScript module for the React components to consume.

    The standalone `.svg` files cannot serve the site itself. Referenced through `<img>`
    or `background-image` an SVG is an opaque document: `currentColor` resolves against
    nothing, and B5's hero gradient -- whose stops are `--hero-from` / `--hero-to` --
    cannot reach inside it. Inline SVG is in the DOM, so both work normally. Hence the
    path data lands here as well, from the same `geometry()` call.
    """
    lines = [
        "// GENERATED FILE -- do not edit by hand.",
        "// Rebuilt by `python scripts/build_brand.py --font <Halimun.otf>`, which is",
        "// also where the geometry behind these outlines is explained.",
        "//",
        "// These are outlines, not text: the face they were drawn from is not vendored",
        "// (licence, and weight -- see the script's docstring). Nothing here is authored",
        "// content, so nothing here needs to stay editable.",
        "",
        "export type BrandMark = {",
        "  /** Font units, Y-down, already flipped out of the source's Y-up space. */",
        "  viewBox: string;",
        "  /** viewBox width and height again, as numbers, so consumers computing an */",
        "  /** aspect ratio do not have to parse the string and prove the parse worked. */",
        "  width: number;",
        "  height: number;",
        "  /** One entry per glyph. They overlap; paint them in order. */",
        "  paths: readonly string[];",
        "  /** The text this artwork stands in for, for the accessible name. */",
        "  text: string;",
        "};",
        "",
    ]
    for name, (view_box, paths, text) in marks.items():
        _, _, width, height = (float(v) for v in view_box.split())
        body = ",\n".join(f'    "{d}"' for d in paths)
        lines += [
            f"export const {name}: BrandMark = {{",
            f'  viewBox: "{view_box}",',
            f"  width: {width:g},",
            f"  height: {height:g},",
            "  paths: [",
            body,
            "  ],",
            f'  text: "{text}",',
            "};",
            "",
        ]
    return "\n".join(lines)


def write_ico(path: Path, frames: list[Image.Image]) -> None:
    """Write a multi-resolution .ico with one PNG payload per frame.

    Pillow's own ICO writer is no good here. It rasterises every requested size from the
    single image it is handed and silently drops any size larger than that image, so a
    16/32/48 set built from a 16px source comes out as 16 alone -- and one built from the
    48px source is three downscales of one drawing, which throws away the per-size
    dilation in DILATE_BY_PX that is the entire reason these are drawn separately.

    The container is trivial to write directly: a 6-byte ICONDIR, a 16-byte entry per
    frame, then the payloads. PNG-in-ICO is understood by every browser in use and by
    Windows Vista onwards.
    """
    import struct
    from io import BytesIO

    blobs = []
    for frame in frames:
        buf = BytesIO()
        frame.save(buf, format="PNG", optimize=True)
        blobs.append(buf.getvalue())

    offset = 6 + 16 * len(blobs)
    header = struct.pack("<HHH", 0, 1, len(blobs))
    entries, payload = b"", b""
    for frame, blob in zip(frames, blobs):
        w, h = frame.size
        entries += struct.pack(
            "<BBBBHHII",
            0 if w >= 256 else w,
            0 if h >= 256 else h,
            0,  # palette size: 0 for truecolour
            0,  # reserved
            1,  # colour planes
            32,  # bits per pixel
            len(blob),
            offset,
        )
        payload += blob
        offset += len(blob)
    path.write_bytes(header + entries + payload)


def raster(
    face: Face,
    placed,
    size: int,
    *,
    fg,
    bg=None,
    pad_frac: float = 0.10,
    supersample: int = 8,
) -> Image.Image:
    """Render a placement to a square PIL image, supersampled then box-filtered.

    Pillow rasterises straight from the OTF rather than from the SVG this script also
    emits, because there is no SVG rasteriser in the toolchain. Driving both outputs
    from the same font with the same placement numbers keeps them identical anyway.
    """
    edge = size * supersample
    img = Image.new("RGBA", (edge, edge), bg if bg else (0, 0, 0, 0))

    x0, y0, x1, y1 = face.ink_box(placed)
    bw, bh = x1 - x0, y1 - y0
    scale = min(edge * (1 - 2 * pad_frac) / bw, edge * (1 - 2 * pad_frac) / bh)
    origin_x = (edge - bw * scale) / 2 - x0 * scale
    origin_y = (edge - bh * scale) / 2 + y1 * scale

    dilate = 0
    for cap in sorted(DILATE_BY_PX):
        if size <= cap:
            dilate = int(round(DILATE_BY_PX[cap] * edge))
            break

    draw = ImageDraw.Draw(img)
    font = ImageFont.truetype(str(face.path), int(scale * UPEM))
    for item in placed:
        if isinstance(item, Dot):
            cx = origin_x + item.cx * scale
            cy = origin_y - item.cy * scale
            r = item.r * scale + dilate
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=fg)
            continue
        ch, px, py = item
        xy = (origin_x + px * scale, origin_y - py * scale)
        if dilate:
            draw.text(
                xy, ch, font=font, fill=fg, anchor="ls",
                stroke_width=dilate, stroke_fill=fg,
            )
        else:
            draw.text(xy, ch, font=font, fill=fg, anchor="ls")
    return img.resize((size, size), Image.LANCZOS)


def main() -> None:
    ap = argparse.ArgumentParser(description="Build brand assets from Halimun.")
    ap.add_argument("--font", required=True, type=Path, help="path to Halimun.otf")
    ap.add_argument("--root", default=Path("."), type=Path, help="repo root")
    args = ap.parse_args()

    face = Face(args.font)
    root: Path = args.root
    brand = root / "public" / "brand"
    icons = root / "public" / "icons"
    app = root / "app"
    for directory in (brand, icons):
        directory.mkdir(parents=True, exist_ok=True)

    mono = face.monogram()
    m_only = face.letter_m()
    word = face.wordmark()
    first = face.wordmark_first()

    written: list[tuple[str, str]] = []

    def write_text(path: Path, body: str, note: str) -> None:
        path.write_text(body, encoding="utf-8", newline="\n")
        written.append((str(path.relative_to(root)).replace("\\", "/"), note))

    def write_img(path: Path, img: Image.Image, note: str) -> None:
        img.save(path)
        written.append((str(path.relative_to(root)).replace("\\", "/"), note))

    # 1. Vector marks, transparent, currentColor. These are what the site itself uses,
    #    which is why they carry no colour of their own -- one file serves both themes.
    write_text(
        brand / "monogram.svg",
        svg(face, mono, title="Mukerem Shifa monogram"),
        "MS monogram, inherits colour",
    )
    write_text(
        brand / "monogram-m.svg",
        svg(face, m_only, title="Mukerem Shifa mark"),
        "M mark, the small-size fallback",
    )
    write_text(
        brand / "wordmark.svg",
        svg(face, word, pad=30, title="Mukerem Shifa"),
        "signature wordmark",
    )
    write_text(
        brand / "wordmark-first.svg",
        svg(face, first, pad=30, title="Mukerem Shifa"),
        "'Mukerem.' header lockup",
    )

    # 2. The mark with its own ground, for contexts that supply no colour.
    write_text(
        brand / "monogram-tile.svg",
        svg(face, mono, colour=CREAM, tile=BRAND, pad=190, square=True),
        "MS reversed out of emerald, square",
    )

    # 2b. The same three marks as inline-able path data. See emit_ts for why the .svg
    #     files above cannot do this job.
    write_text(
        root / "lib" / "brand-marks.ts",
        emit_ts(
            {
                "MONOGRAM_MS": (*geometry(face, mono), "Mukerem Shifa"),
                "MONOGRAM_M": (*geometry(face, m_only), "Mukerem Shifa"),
                "SIGNATURE": (*geometry(face, word, pad=30), "Mukerem Shifa"),
                # `text` is the full name, not "Mukerem." — it is what the mark stands
                # for, and it is what the header link must be called.
                "WORDMARK_FIRST": (*geometry(face, first, pad=30), "Mukerem Shifa"),
            }
        ),
        "path data for the React components",
    )

    # 3. Favicons. `icon.svg` carries the M alone: at tab size the two-letter monogram
    #    collapses into a smudge, and a mark that is not legible is not a mark.
    write_text(
        app / "icon.svg",
        svg(face, m_only, colour=CREAM, tile=BRAND, pad=210, square=True, dilate=14),
        "SVG favicon -- M, dilated for tab size",
    )

    write_ico(
        app / "favicon.ico",
        [
            raster(face, m_only, s, fg=hexrgb(CREAM), bg=hexrgb(BRAND), pad_frac=0.14)
            .convert("RGBA")
            for s in (16, 32, 48)
        ],
    )
    written.append(("app/favicon.ico", "16/32/48, each rendered at its own size"))

    # 4. Home-screen icons. Above roughly 120px the full monogram holds, so it gets them.
    write_img(
        app / "apple-icon.png",
        raster(face, mono, 180, fg=hexrgb(CREAM), bg=hexrgb(BRAND), pad_frac=0.16)
        .convert("RGB"),
        "180x180 apple-touch",
    )
    for size in (192, 512):
        write_img(
            icons / f"icon-{size}.png",
            raster(face, mono, size, fg=hexrgb(CREAM), bg=hexrgb(BRAND), pad_frac=0.16)
            .convert("RGB"),
            f"{size}x{size} manifest icon",
        )
    # Maskable art is cropped to an arbitrary shape by the launcher, so everything has to
    # sit inside the middle 80%. That is too little room for two letters: this one is M.
    write_img(
        icons / "maskable-512.png",
        raster(face, m_only, 512, fg=hexrgb(CREAM), bg=hexrgb(BRAND), pad_frac=0.28)
        .convert("RGB"),
        "512x512 maskable, 28% safe zone",
    )

    # 5. Social avatar, and the monogram the OG cards composite (Satori cannot reach
    #    an SVG's `currentColor`, so that one is baked emerald on transparent).
    write_img(
        brand / "avatar-1024.png",
        raster(face, mono, 1024, fg=hexrgb(CREAM), bg=hexrgb(BRAND), pad_frac=0.17)
        .convert("RGB"),
        "1024x1024 GitHub/LinkedIn avatar",
    )
    write_img(
        brand / "og-monogram.png",
        raster(face, mono, 512, fg=hexrgb(BRAND), pad_frac=0.02),
        "emerald monogram on transparent, composited by lib/og.ts",
    )

    print(f"Built from {args.font}\n")
    for path, note in written:
        print(f"  {path:<32} {note}")
    print(
        "\nThe font is not copied into the repo. That is deliberate -- see the module "
        "docstring."
    )


if __name__ == "__main__":
    main()
