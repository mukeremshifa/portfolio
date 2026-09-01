"use client";

import { useState } from "react";

import { Fade } from "@/components/motion/Fade";
import { ProjectFilter, type FilterValue } from "@/components/projects/ProjectFilter";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import type { CategoryFilter } from "@/lib/content";
import type { Project } from "@/lib/schemas";

type ProjectExplorerProps = {
  projects: Project[];
  filters: CategoryFilter[];
};

/**
 * §8.2's index, and the one client island on `/projects/`.
 *
 * The page stays a server component: it reads `getAllProjects()` and
 * `getCategoryFilters()` and passes both down as plain data (§9 rule 1, §4.1). Nothing
 * here touches `lib/content.ts`, which is what keeps `node:fs` out of the browser bundle
 * and the counts derived in exactly one place.
 *
 * **The live region is rendered unconditionally and its text changes.** A region that
 * appears at the same moment as its message is not reliably announced — assistive
 * technology has to be observing the node before the mutation happens. `CopyButton`
 * solved this the same way in Phase 2; this is that pattern, not a second one.
 *
 * No URL search params. §8.2 defers them past roughly twelve projects and there are six,
 * so pre-building for it would be carrying the back-button semantics of a feature nobody
 * has asked for yet.
 */
export function ProjectExplorer({ projects, filters }: ProjectExplorerProps) {
  const [value, setValue] = useState<FilterValue>("all");

  const visible =
    value === "all" ? projects : projects.filter((project) => project.category === value);

  return (
    <div className="flex flex-col gap-heading">
      <ProjectFilter categories={filters} value={value} onChange={setValue} />

      <p
        role="status"
        aria-live="polite"
        className="font-sans text-body-sm text-text-muted"
      >
        Showing {visible.length} of {projects.length} project
        {projects.length === 1 ? "" : "s"}
        {value === "all" ? "" : ` in ${value}`}.
      </p>

      {visible.length > 0 ? (
        // **`key={value}` is the whole filter animation.** Changing the key tears down
        // the grid and mounts a fresh one, so every card runs its normal entrance stagger
        // — the same motion the page shows on first load — instead of the survivors
        // sliding to new positions while newcomers fade in around them.
        //
        // That reposition-and-fade is what this replaced. It was three motions at once
        // for one click and gave the eye nothing stable to track; a filter reads far
        // better as "here is the new list" than as "watch the old list rearrange".
        //
        // The cost, stated plainly: cards common to both filters are thrown away and
        // rebuilt rather than tracked across the change. That is exactly what makes the
        // effect work, and at seven cards of static content it is free.
        <ProjectGrid key={value} projects={visible} headingLevel="h2" />
      ) : (
        // Reachable only if a category has no projects, which the stub set does not
        // produce but `getCategoryFilters` deliberately allows: it emits every category,
        // including one with a count of zero. An empty grid with no sentence in it would
        // read as a broken page rather than as an honest answer.
        //
        // `Fade` rather than `Reveal`, and keyed like the grid above: this replaces a
        // grid that just disappeared, so it has to arrive on mount rather than wait for a
        // viewport trigger it has already satisfied. A short distance because it is one
        // line of text taking the place of something much larger, and a long travel would
        // draw more attention to the absence than to the sentence explaining it.
        <Fade key={value} delay={0.05} distance={10}>
          <p className="max-w-measure font-sans text-body text-text-muted">
            Nothing in this category yet.
          </p>
        </Fade>
      )}
    </div>
  );
}
