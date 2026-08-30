import { MONOGRAM_M, MONOGRAM_MS, type BrandMark } from "@/lib/brand-marks";

type MonogramProps = {
  /**
   * `ms` is the full interlocked monogram, and it is what every current caller wants.
   *
   * `m` is the single-letter reduction, for anywhere the mark has to go small: below
   * about 48px the two-letter version stops being legible, because the face is a
   * ~29/1000em monoline and the S collapses into the M's right stem. Nothing in the
   * app renders it today — the places that need it (`app/favicon.ico`, `app/icon.svg`,
   * the maskable icon) are static files `scripts/build_brand.py` writes directly, since
   * a favicon never passes through React. It stays here so the reduction is available
   * in the markup if a small in-page use ever appears, and so the rule lives next to
   * the mark it constrains.
   */
  variant?: "ms" | "m";
  /** Rendered height in px. Width follows the mark's own aspect ratio. */
  height?: number;
  /**
   * Omit to render decoration. Pass a label only where the mark is the sole carrier of
   * the meaning — a link with no visible text, say. Beside text that already says
   * "Mukerem Shifa", a second accessible name is noise, not help.
   */
  label?: string;
  className?: string;
};

const MARKS: Record<"ms" | "m", BrandMark> = { ms: MONOGRAM_MS, m: MONOGRAM_M };

/**
 * The MS monogram, drawn as outlines rather than set as type.
 *
 * The paths come from `lib/brand-marks.ts`, which is generated — see
 * `scripts/build_brand.py` for the geometry and for why the source face is not a
 * dependency of this repo.
 *
 * It is inline SVG, not an `<img src="/brand/monogram.svg">`, because inline is the only
 * form where `fill="currentColor"` resolves: the mark then inherits whatever colour its
 * context sets and needs no per-theme variant.
 */
export function Monogram({
  variant = "ms",
  height = 28,
  label,
  className,
}: MonogramProps) {
  const mark = MARKS[variant];

  return (
    <svg
      className={className}
      viewBox={mark.viewBox}
      height={height}
      // Rounded because the alternative ships `width="50.86656441717791"` into the
      // markup on every page. Sub-pixel width on a mark this size is not a difference
      // anyone can see.
      width={Math.round((height * mark.width) / mark.height)}
      fill="currentColor"
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      {mark.paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
