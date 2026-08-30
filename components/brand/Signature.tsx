import { SIGNATURE } from "@/lib/brand-marks";

type SignatureProps = {
  /**
   * Distinguishes the gradient's `<defs>` id when more than one signature is on a page.
   * Ids in SVG are document-global, so two instances sharing one would have the second
   * silently repaint the first. Deliberately not the same string as the `signature-ink`
   * class below it — they live in different namespaces, and naming them alike invites
   * someone to "fix" a collision that was never there.
   */
  id?: string;
  className?: string;
};

/**
 * "Mukerem Shifa" as the drawn signature, for the hero's `display-1` slot.
 *
 * **This is artwork, not text.** It carries no accessible name of its own: `Hero` wraps
 * it in the `<h1>` alongside a `sr-only` copy of the name, so the heading is real text
 * for assistive technology, for search, and for anyone who copies it — the outlines are
 * purely what sighted users see. Giving the SVG a label as well would put the name in
 * the accessibility tree twice.
 *
 * B5 makes the hero heading the system's one gradient, and that survives the change from
 * text to outlines — but through `--signature-from` / `--signature-to`, not B5's
 * `--hero-*` pair. The typeset fallback in `Hero` still uses B5's stops unchanged; these
 * exist because the fade has to be tuned by eye per theme rather than by contrast ratio,
 * and `globals.css` carries the full reasoning next to the values. Either way both themes
 * come from §6.2/§6.3 rather than from a literal copied into this file.
 *
 * Custom properties cascade into inline SVG, which is the other reason this is not an
 * `<img>` — inside an external SVG document those tokens resolve against nothing.
 */
export function Signature({ id = "signature-gradient", className }: SignatureProps) {
  return (
    <svg
      className={className}
      viewBox={SIGNATURE.viewBox}
      // No width/height: the hero sizes this with CSS so it can track the fluid
      // display-1 scale rather than sitting at one pixel size across every breakpoint.
      preserveAspectRatio="xMinYMid meet"
      aria-hidden="true"
      style={{ aspectRatio: `${SIGNATURE.width} / ${SIGNATURE.height}` }}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" style={{ stopColor: "var(--signature-from)" }} />
          <stop offset="100%" style={{ stopColor: "var(--signature-to)" }} />
        </linearGradient>
      </defs>
      {/* `signature-ink` (globals.css) swaps this fill for a flat one under
          forced-colors and print, where a gradient is discarded or does not print. */}
      <g className="signature-ink" fill={`url(#${id})`}>
        {SIGNATURE.paths.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}
