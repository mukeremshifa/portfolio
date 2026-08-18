import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tag } from "@/components/ui/Tag";
import type { Project, ProjectStatus } from "@/lib/schemas";
import { formatYearRange } from "@/lib/utils";

type ProjectFactsProps = { project: Project };

// Structural words, not content (§9 rule 4) — these name a schema state, they do not say
// anything about the project.
const STATUS_LABELS: Record<ProjectStatus, string> = {
  completed: "Completed",
  "in-progress": "In progress",
  maintained: "Maintained",
};

/**
 * §8.3, and it is a description list rather than a table on purpose. A table asserts
 * that its rows share a relationship and that its columns mean something; "Role" and
 * "Team" are five unrelated facts about one project, which is exactly what `dl` is for.
 */
export function ProjectFacts({ project }: ProjectFactsProps) {
  const timeline = formatYearRange(project.year.start, project.year.end);

  return (
    <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)]">
      <dt className="font-mono text-eyebrow text-text-muted uppercase">Role</dt>
      <dd className="font-sans text-body text-text">{project.role}</dd>

      <dt className="font-mono text-eyebrow text-text-muted uppercase">Timeline</dt>
      <dd className="font-sans text-body text-text">{timeline}</dd>

      <dt className="font-mono text-eyebrow text-text-muted uppercase">Team</dt>
      <dd className="font-sans text-body text-text">{project.team}</dd>

      <dt className="font-mono text-eyebrow text-text-muted uppercase">Status</dt>
      <dd>
        <StatusBadge state={project.status} label={STATUS_LABELS[project.status]} />
      </dd>

      <dt className="font-mono text-eyebrow text-text-muted uppercase">Stack</dt>
      <dd>
        {/* `flex-wrap` plus `break-words` on the tag itself is what survives a
            52-character technology name at 320px, which the golden sample carries
            precisely to prove this row does not push the page sideways (§11.5). */}
        <ul className="flex flex-wrap gap-2">
          {project.technologies.map((technology) => (
            <li key={technology} className="max-w-full">
              <Tag>
                <span className="break-words">{technology}</span>
              </Tag>
            </li>
          ))}
        </ul>
      </dd>
    </dl>
  );
}
