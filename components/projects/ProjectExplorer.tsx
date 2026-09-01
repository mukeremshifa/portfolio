"use client";

import { useState } from "react";

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
        // `filterable` is what selects the reposition-and-fade animation over the
        // stagger. This is the caller that filters, so it is the caller that opts in.
        <ProjectGrid projects={visible} headingLevel="h2" filterable />
      ) : (
        // Reachable only if a category has no projects, which the stub set does not
        // produce but `getCategoryFilters` deliberately allows: it emits every category,
        // including one with a count of zero. An empty grid with no sentence in it would
        // read as a broken page rather than as an honest answer.
        <p className="max-w-measure font-sans text-body text-text-muted">
          Nothing in this category yet.
        </p>
      )}
    </div>
  );
}
