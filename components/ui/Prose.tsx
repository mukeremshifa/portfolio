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
        "[&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6",
        "[&_li+li]:mt-2",
        "[&_strong]:font-semibold",
        "[&_code]:rounded-sm [&_code]:bg-code-bg [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-code",
        // §6.8: prose links are underlined at rest and thicken on hover.
        "[&_a]:text-brand [&_a]:underline [&_a]:decoration-1 [&_a]:underline-offset-[3px] [&_a:hover]:text-brand-hover [&_a:hover]:decoration-2",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
