import { Stagger } from "@/components/motion/Stagger";
import { BulletList } from "@/components/ui/BulletList";
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
 * `highlights` has no floor in the schema, and `BulletList` renders nothing for an empty
 * array. Most qualifications are the credential and the dates, and a component that always
 * renders a bullet list gets an invented bullet to put in it.
 *
 * **The marker is the star, not the square.** Both entries carry exactly one highlight, and
 * a square — the marker this system uses for a list of peers — in front of a lone item
 * reads as a list with one row in it, which is the shape a reader then looks for a second
 * row of. A star marks the item out rather than enumerating it, and both highlights are a
 * distinction — a graduation date, a final grade — rather than one of a series. This is the
 * only surface that takes the star.
 */
export function EducationList({ entries, headingLevel = "h3" }: EducationListProps) {
  const Heading = headingLevel;

  return (
    <ul className="flex flex-col gap-10">
      {/* §10.3: the entries arrive in sequence rather than as a block. `Stagger` supplies
          the `li`, so the map yields the row's contents and the list stays a list. */}
      <Stagger as="li">
        {entries.map((entry) => (
          <div key={entry.id} className="flex flex-col gap-3">
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
                  <ExternalLink href={entry.institutionUrl}>
                    {entry.institution}
                  </ExternalLink>
                ) : (
                  entry.institution
                )}
              </p>
            </div>

            <p className="max-w-measure font-sans text-body text-text">{entry.note}</p>

            <BulletList items={entry.highlights} marker="star" tone="muted" />
          </div>
        ))}
      </Stagger>
    </ul>
  );
}
