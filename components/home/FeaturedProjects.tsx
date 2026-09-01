import { Stagger } from "@/components/motion/Stagger";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Project } from "@/lib/schemas";

type FeaturedProjectsProps = { projects: Project[] };

/**
 * §8.1's "Selected work": one full-width card, then two half-width at `md` and up,
 * stacking below (§6.7's grid rule).
 *
 * The shape is expressed as a span on the first item rather than as two separate lists,
 * so the markup stays one `<ul>` of peers — which is what it is. `getFeaturedProjects()`
 * caps at three and §5.5 invariant 3 keeps it between one and three, so the grid degrades
 * sensibly if the owner features fewer.
 */
export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  const [lead, ...rest] = projects;
  if (!lead) return null;

  return (
    // An unnamed <section> is deliberate: without an accessible name it is not exposed
    // as a landmark, so it adds structure without adding a seventh region for a screen
    // reader to walk past. The h2 inside is what carries the outline (§11.1).
    <section className="flex flex-col gap-heading">
      <SectionHeading
        title="Selected work"
        action={{ href: "/projects", label: "View all →" }}
      />
      {/* The lead card's `md:col-span-2` is expressed as a first-child selector on the
          grid rather than as a class on the item, because `Stagger` generates the `li`s
          and takes one `as` for all of them — it has no per-child class, and widening its
          API for a single caller would be the wrong trade. The selector says the same
          thing the class did: the first item in this grid spans both columns. */}
      <ul className="grid gap-6 md:grid-cols-2 md:[&>li:first-child]:col-span-2">
        {/* §10.2's stagger. Nothing filters this grid — `getFeaturedProjects()` caps at
            three fixed cards — so the entrance runs once on first scroll-in and the
            reposition machinery `/projects` needs would be inert here. The section is
            deliberately not also wrapped in a `Reveal` on the home page; see app/page.tsx. */}
        {/* One flat array, not a lead element followed by `{rest.map(...)}`. `Stagger`
            uses `Children.map`, which counts a nested array as a *single* child — so the
            latter shape wraps both remaining cards in one `li` and renders only the
            first. The cards differ by `variant`, not by nesting. */}
        <Stagger as="li">
          {projects.map((project) => (
            <ProjectCard
              key={project.slug}
              project={project}
              variant={project.slug === lead.slug ? "featured" : "standard"}
            />
          ))}
        </Stagger>
      </ul>
    </section>
  );
}
