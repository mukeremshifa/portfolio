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
      <ul className="grid gap-6 md:grid-cols-2">
        <li className="md:col-span-2">
          <ProjectCard project={lead} variant="featured" />
        </li>
        {rest.map((project) => (
          <li key={project.slug}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>
    </section>
  );
}
