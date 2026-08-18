import { ExternalLink } from "@/components/ui/ExternalLink";
import { Tag } from "@/components/ui/Tag";
import type { ExperienceEntry as Entry } from "@/lib/schemas";
import { EXPERIENCE_TYPE_LABELS, formatMonthRange, type HeadingLevel } from "@/lib/utils";

type ExperienceEntryProps = {
  entry: Entry;
  /** `true` drops the achievements and the technology row. See `ExperienceTimeline`. */
  compact?: boolean;
  headingLevel?: HeadingLevel;
};

/**
 * One row of §8.4's timeline.
 *
 * Every optional field renders as absence: no `organizationUrl` and the organisation is
 * plain text rather than a dead link, no `location` and the meta line simply has one
 * fewer part, an empty `technologies` array and the tag row is not there at all. The stub
 * set carries one entry of each so all three are visible rather than argued about.
 *
 * The type badge is `accent` while technologies are `neutral`, which is the whole point of
 * §8.4 asking for it: an entry has to say at a glance that it was independent work rather
 * than employment, and a badge that looks like the technology chips beside it says
 * nothing.
 */
export function ExperienceEntryItem({
  entry,
  compact = false,
  headingLevel = "h3",
}: ExperienceEntryProps) {
  const Heading = headingLevel;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="font-mono text-eyebrow text-text-muted uppercase">
          {formatMonthRange(entry.start, entry.end)}
          {entry.location ? ` · ${entry.location}` : ""}
        </p>
        <Tag tone="accent">{EXPERIENCE_TYPE_LABELS[entry.type]}</Tag>
      </div>

      <div className="flex flex-col gap-1">
        <Heading className="font-sans text-heading-2 font-semibold text-text">
          {entry.role}
        </Heading>
        <p className="font-sans text-body text-text-muted">
          {entry.organizationUrl ? (
            <ExternalLink href={entry.organizationUrl}>{entry.organization}</ExternalLink>
          ) : (
            entry.organization
          )}
        </p>
      </div>

      <p className="max-w-measure font-sans text-body text-text">{entry.summary}</p>

      {compact ? null : (
        <>
          <ul className="flex max-w-measure list-disc flex-col gap-2 pl-6 font-sans text-body text-text-muted">
            {entry.achievements.map((achievement) => (
              <li key={achievement}>{achievement}</li>
            ))}
          </ul>

          {entry.technologies.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {entry.technologies.map((technology) => (
                <li key={technology} className="max-w-full">
                  <Tag>
                    <span className="break-words">{technology}</span>
                  </Tag>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}
    </div>
  );
}
