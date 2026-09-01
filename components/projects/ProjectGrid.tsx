import { LayoutItem } from "@/components/motion/LayoutItem";
import { Presence } from "@/components/motion/Presence";
import { ProjectCard } from "@/components/projects/ProjectCard";
import type { Project } from "@/lib/schemas";
import type { HeadingLevel } from "@/lib/utils";

type ProjectGridProps = {
  projects: Project[];
  headingLevel?: HeadingLevel;
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
 * **This grid deliberately does not stagger.** `CertificationGrid` does, and the asymmetry
 * is the point: a stagger is an entrance, and this grid's cards change on filter clicks as
 * well as on first view. Wrapping it in `Stagger` too would mean every filter click
 * re-ran a 60ms-per-card cascade on top of the reposition and the fade — three animations
 * on one element for one click. One grid, one behaviour.
 */
export function ProjectGrid({ projects, headingLevel = "h3" }: ProjectGridProps) {
  return (
    <ul className="grid gap-6 md:grid-cols-2">
      <Presence>
        {projects.map((project) => (
          // The key is the slug rather than the index, and that is load-bearing rather
          // than habitual: `layout` tracks an element across renders by key and
          // `AnimatePresence` decides what is leaving the same way, so an index key would
          // make every card think it had become a different card the moment the filter
          // changed — and the exit animation would run on the wrong ones.
          <LayoutItem key={project.slug} as="li" animatePresence>
            <ProjectCard project={project} headingLevel={headingLevel} />
          </LayoutItem>
        ))}
      </Presence>
    </ul>
  );
}
