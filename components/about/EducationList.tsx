import { ExternalLink } from "@/components/ui/ExternalLink";
import type { Education } from "@/lib/schemas";
import { formatMonthRange, type HeadingLevel } from "@/lib/utils";

type EducationListProps = {
  entries: Education[];
  headingLevel?: HeadingLevel;
};

/**
 * Formal qualifications on `/about/`, split out of the experience timeline on 2026-08-31.
 *
 * **A `<ul>`, where `ExperienceTimeline` is an `<ol>`.** The distinction is not pedantry:
 * `/experience/` makes a claim with its ordering — this came after that — and the ordered
 * list is what states it. Two qualifications are a set. They are still rendered
 * newest-first because that is the useful reading order, but the markup does not assert
 * that the sequence carries meaning, and it also does not inherit the timeline's spine,
 * which would have made education look like one more job.
 *
 * `highlights` has no floor in the schema, so the list is conditional. Most qualifications
 * are the credential and the dates, and a component that always renders a bullet list gets
 * an invented bullet to put in it.
 */
export function EducationList({ entries, headingLevel = "h3" }: EducationListProps) {
  const Heading = headingLevel;

  return (
    <ul className="flex flex-col gap-10">
      {entries.map((entry) => (
        <li key={entry.id} className="flex flex-col gap-3">
          <p className="font-mono text-eyebrow text-text-muted uppercase">
            {formatMonthRange(entry.start, entry.end)}
            {entry.location ? ` · ${entry.location}` : ""}
          </p>

          <div className="flex flex-col gap-1">
            <Heading className="font-sans text-heading-2 font-semibold text-text">
              {entry.credential}
            </Heading>
            <p className="font-sans text-body text-text-muted">
              {entry.institutionUrl ? (
                <ExternalLink href={entry.institutionUrl}>{entry.institution}</ExternalLink>
              ) : (
                entry.institution
              )}
            </p>
          </div>

          <p className="max-w-measure font-sans text-body text-text">{entry.note}</p>

          {entry.highlights.length > 0 ? (
            <ul className="flex max-w-measure list-disc flex-col gap-2 pl-6 font-sans text-body text-text-muted">
              {entry.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
