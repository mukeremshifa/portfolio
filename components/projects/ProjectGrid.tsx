import { LayoutItem } from "@/components/motion/LayoutItem";
import { Presence } from "@/components/motion/Presence";
import { Stagger } from "@/components/motion/Stagger";
import { ProjectCard } from "@/components/projects/ProjectCard";
import type { Project } from "@/lib/schemas";
import type { HeadingLevel } from "@/lib/utils";

type ProjectGridProps = {
  projects: Project[];
  headingLevel?: HeadingLevel;
  /**
   * Whether the caller filters this grid. It selects which of §10.2's two animations the
   * cards get, and the two are mutually exclusive — see the note on the component.
   *
   * `/projects` passes `true` (the `ProjectExplorer` filters); the home page leaves it
   * `false`, because a grid of six fixed cards has nothing to reposition.
   */
  filterable?: boolean;
};

/**
 * §9.3's contract, and §6.7's grid rule: two up at `md` and above, one column below.
 *
 * A real grid rather than the CSS columns `ScreenshotGallery` uses. Cards are uniform by
 * construction and `h-full` makes them match their row, which is the case a grid is
 * actually for; screenshots run from 21:9 to 9:16 and are the case it is not.
 *
 * `LayoutItem` wraps each card so §10.2's filter animation has somewhere to live without
 * this file importing `motion/react` (§9.4). The grid is otherwise a server component and
 * stays one — only the wrappers are client islands.
 *
 * `Presence` is the other half of that row, and it was missing until 2026-09-01. Without
 * it `LayoutItem`'s `exit` never runs: React unmounts a filtered-out card immediately, so
 * the surviving cards glided around neighbours that vanished and appeared instantly. See
 * `components/motion/Presence.tsx`.
 *
 * **The two animations here are mutually exclusive, and `filterable` picks one.** This is
 * the one place applying §10.2 turned up a real conflict rather than a choice.
 *
 * A stagger is an entrance: it runs once, on first scroll-in. The filter animation runs on
 * every filter click, for as long as the reader keeps clicking. On `/projects` those are
 * the same cards, so having both means a filter click re-runs a 60ms-per-card cascade on
 * top of the reposition and the fade — three animations on one element for one click, and
 * the cascade is describing an entrance that already happened. On the home page there is
 * no filter at all, so the reposition and exit machinery is inert and the entrance is the
 * only thing worth having.
 *
 * So: filtered grids reposition and fade, unfiltered grids stagger. Never both.
 */
export function ProjectGrid({
  projects,
  headingLevel = "h3",
  filterable = false,
}: ProjectGridProps) {
  return (
    <ul className="grid gap-6 md:grid-cols-2">
      {filterable ? (
        <Presence>
          {projects.map((project) => (
            // The key is the slug rather than the index, and that is load-bearing rather
            // than habitual: `layout` tracks an element across renders by key and
            // `AnimatePresence` decides what is leaving the same way, so an index key
            // would make every card think it had become a different card the moment the
            // filter changed — and the exit would run on the wrong ones.
            <LayoutItem key={project.slug} as="li" animatePresence>
              <ProjectCard project={project} headingLevel={headingLevel} />
            </LayoutItem>
          ))}
        </Presence>
      ) : (
        <Stagger as="li">
          {projects.map((project) => (
            <ProjectCard
              key={project.slug}
              project={project}
              headingLevel={headingLevel}
            />
          ))}
        </Stagger>
      )}
    </ul>
  );
}
