import { LayoutItem } from "@/components/motion/LayoutItem";
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
 * stays one — only the wrapper is a client island.
 */
export function ProjectGrid({ projects, headingLevel = "h3" }: ProjectGridProps) {
  return (
    <ul className="grid gap-6 md:grid-cols-2">
      {projects.map((project) => (
        // The key is the slug rather than the index, and that is load-bearing rather
        // than habitual: a `layout` animation tracks an element across renders by key,
        // so an index key would make every card think it had become a different card
        // the moment the filter changed.
        <LayoutItem key={project.slug} as="li">
          <ProjectCard project={project} headingLevel={headingLevel} />
        </LayoutItem>
      ))}
    </ul>
  );
}
