import type { ReactNode } from "react";

type ProseProps = { children: ReactNode };

/**
 * The running-text wrapper. Its one non-negotiable job is §6.6's measure cap: 68
 * characters, held by `max-w-measure`. Everything else here is rhythm — vertical spacing
 * and the §6.8 link treatment — applied through descendant selectors so the caller can
 * pass plain semantic HTML (or, from Phase 2, rendered content) without decorating every
 * element by hand.
 */
export function Prose({ children }: ProseProps) {
  return (
    <div
      className={[
        "max-w-measure font-sans text-body text-text",
        "[&>*+*]:mt-4",
        "[&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-heading-1 [&_h2]:font-semibold",
        "[&_h3]:mt-8 [&_h3]:text-heading-2 [&_h3]:font-semibold",
        // `ol` keeps its native marker — a numeral has no radius to be wrong about. `ul`
        // cannot: §6.7 gives every marker in the system square edges, and `list-disc` is
        // a circle. `BulletList` draws its marker as an element, which is not available
        // here because `Prose` styles markup it does not author, so this is the same 6px
        // `border-strong` square as a `::before`. `calc(0.5lh - 0.1875rem)` is half a
        // line box minus half the square, which centres it on the first line at any step
        // of §6.6's scale — the pseudo-element form of `BulletList`'s `h-lh` box.
        "[&_ol]:list-decimal [&_ol]:pl-6",
        "[&_ul]:list-none [&_ul]:pl-0",
        "[&_ul>li]:relative [&_ul>li]:pl-6",
        "[&_ul>li]:before:absolute [&_ul>li]:before:top-[calc(0.5lh-0.1875rem)] [&_ul>li]:before:left-0 [&_ul>li]:before:size-1.5 [&_ul>li]:before:bg-border-strong [&_ul>li]:before:content-['']",
        "[&_li+li]:mt-2",
        "[&_strong]:font-semibold",
        "[&_code]:rounded-none [&_code]:bg-code-bg [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-code",
        // §6.8: prose links are underlined at rest and thicken on hover.
        "[&_a]:text-brand [&_a]:underline [&_a]:decoration-1 [&_a]:underline-offset-[3px] [&_a:hover]:text-brand-hover [&_a:hover]:decoration-2",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
