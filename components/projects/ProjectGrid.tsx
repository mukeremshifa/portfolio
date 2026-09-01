import { Stagger } from "@/components/motion/Stagger";
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
 * **One animation, always: the cards stagger in.** This component used to carry two —
 * a stagger for unfiltered callers and a `layout` reposition plus enter/exit fade for
 * `/projects` — selected by a `filterable` prop, because filtering and entering are
 * different events and each seemed to want its own treatment.
 *
 * That is gone, and the reason is worth keeping. The reposition animation was solving a
 * problem the design did not have to have: when a filter removes some cards and keeps
 * others, the survivors slide to new positions while the newcomers fade, so a single
 * click produced three different motions across one grid and the eye had nothing stable
 * to track. `ProjectExplorer` now remounts this list on every filter change (see the
 * `key` there), so a filter is not a rearrangement at all — it is a new list arriving,
 * and it arrives exactly the way the page's first render does.
 *
 * The result is that filtering needs no bespoke animation, `LayoutItem` and `Presence`
 * are no longer used by anything, and the grid has one behaviour to reason about instead
 * of two mutually exclusive ones. Simpler and better-looking is a rare pairing; take it.
 */
export function ProjectGrid({ projects, headingLevel = "h3" }: ProjectGridProps) {
  return (
    <ul className="grid gap-6 md:grid-cols-2">
      {/* `Stagger` supplies the `li`, so the map yields the card and the list stays a
          list (§11.1). `perRow={2}` matches `md:grid-cols-2`, so each *row* of the grid
          arrives as a unit rather than the right-hand card trailing the left-hand one —
          a row landing together is how a reader parses a two-column grid, and a
          left-to-right offset inside one row animates the grid's internal ordering
          instead of the content. Below `md` the grid is one column and `Stagger` follows
          it, so this is inert on a phone. */}
      <Stagger as="li" perRow={2}>
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} headingLevel={headingLevel} />
        ))}
      </Stagger>
    </ul>
  );
}
