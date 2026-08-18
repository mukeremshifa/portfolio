import Link from "next/link";

import type { ProjectRef } from "@/lib/schemas";

type CaseStudyNavigationProps = {
  prev?: ProjectRef;
  next?: ProjectRef;
};

/**
 * §8.3's previous/next row, and §9.3's contract.
 *
 * Held back from Phase 2 on purpose: with one project it rendered two dead ends, which is
 * worse than rendering nothing. `getAdjacentProjects()` was written and unit-tested then
 * and has had no consumer until now — this is the wiring, not the logic.
 *
 * **An end of the list renders one side, not a disabled stub.** A greyed-out "Next
 * project" is an affordance that announces itself and then refuses, which costs a
 * keyboard user a tab stop to discover something that was never there. The surviving link
 * keeps its own side of the row through `justify-between` plus an empty spacer, so the
 * "next" link stays on the right whether or not a "previous" exists.
 */
export function CaseStudyNavigation({ prev, next }: CaseStudyNavigationProps) {
  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Project navigation"
      className="flex flex-wrap justify-between gap-6 border-t border-border-subtle pt-8"
    >
      {prev ? (
        <Link
          href={`/projects/${prev.slug}`}
          className="group flex max-w-full flex-col gap-1"
        >
          <span className="font-mono text-eyebrow text-text-muted uppercase">
            <span aria-hidden="true">&larr;</span> Previous project
          </span>
          <span className="font-sans text-heading-2 font-semibold text-text underline-offset-[3px] group-hover:text-brand group-hover:underline group-focus-visible:underline">
            {prev.title}
          </span>
        </Link>
      ) : (
        // An empty cell rather than a disabled control: it holds the column so the
        // remaining link stays on its own side of the row, and it is invisible to
        // assistive technology because there is nothing in it.
        <span />
      )}

      {next ? (
        <Link
          href={`/projects/${next.slug}`}
          className="group flex max-w-full flex-col gap-1 text-right sm:items-end"
        >
          <span className="font-mono text-eyebrow text-text-muted uppercase">
            Next project <span aria-hidden="true">&rarr;</span>
          </span>
          <span className="font-sans text-heading-2 font-semibold text-text underline-offset-[3px] group-hover:text-brand group-hover:underline group-focus-visible:underline">
            {next.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
