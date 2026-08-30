import { WORDMARK_FIRST } from "@/lib/brand-marks";

type WordmarkProps = {
  /** Rendered height in px. Width follows the mark's own aspect ratio. */
  height?: number;
  className?: string;
};

/**
 * "Mukerem." — the compact header lockup.
 *
 * It exists because neither of the other two marks works in a 64px bar. The `MS`
 * monogram is 61px wide and reads as incidental beside the nav; the full signature, set
 * at a 26px cap, welds "m Shifa" into one unreadable shape, because its -70 tracking is
 * a display value and tracking does not scale down with the type. So the header gets one
 * word at looser tracking, closed with a period — see `wordmark_first` in
 * `scripts/build_brand.py`, which also has to *draw* that period, the face having no
 * punctuation at all.
 *
 * Flat `currentColor`, not the hero's gradient: at this size a fade across 160px would
 * be noise, and the header link needs a single colour it can shift on hover.
 *
 * No accessible name of its own. `SiteHeader` pairs it with the full name in a `sr-only`
 * span, because "Mukerem." is not what the home link should be called.
 */
export function Wordmark({ height = 30, className }: WordmarkProps) {
  return (
    <svg
      className={className}
      viewBox={WORDMARK_FIRST.viewBox}
      height={height}
      width={Math.round((height * WORDMARK_FIRST.width) / WORDMARK_FIRST.height)}
      fill="currentColor"
      aria-hidden="true"
    >
      {WORDMARK_FIRST.paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
