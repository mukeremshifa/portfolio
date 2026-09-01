import { ExperienceEntryItem } from "@/components/experience/ExperienceEntry";
import { Stagger } from "@/components/motion/Stagger";
import type { ExperienceEntry } from "@/lib/schemas";
import type { HeadingLevel } from "@/lib/utils";

type ExperienceTimelineProps = {
  entries: ExperienceEntry[];
  /** §9.3's flag. The home preview drops achievements and technology rows. */
  compact?: boolean;
  headingLevel?: HeadingLevel;
};

/**
 * §8.4's timeline, and §9.3's contract.
 *
 * **An `<ol>`, because the order is the content.** Newest first is not a styling choice
 * here, it is the claim the section makes, and a `<ul>` would say these entries are a set
 * whose sequence is incidental.
 *
 * The vertical rule is a `border-l` on the list and a dot per item, both pure CSS with the
 * dot marked `aria-hidden`. §11.1: a decorative spine must not turn up in the
 * accessibility tree as a stray element between every two entries.
 *
 * The page above supplies the ordering and any filtering — the home preview passes three
 * featured entries, `/experience/` passes all of them — so this component never decides
 * which entries exist (§9 rule 1).
 *
 * **The full timeline staggers; the compact preview does not** (§10.2). On `/experience/`
 * the timeline is the page's entire content, so the entries arriving in sequence *is* the
 * chronology arriving in order — the motion carries the same information the `<ol>` does.
 * In the home page's compact preview it would be three rows of dense text animating in the
 * middle of a longer page, which reads as a loading state rather than as a list; `compact`
 * already marks that caller, so it doubles as the switch.
 */
export function ExperienceTimeline({
  entries,
  compact = false,
  headingLevel = "h3",
}: ExperienceTimelineProps) {
  return (
    <ol
      className={`flex flex-col border-l border-border-subtle pl-6 ${
        compact ? "gap-10" : "gap-section"
      }`}
    >
      {/* The dot is positioned against the row, so it travels inside whatever element
          holds it: `Stagger` supplies the `li` in the animated branch, and the map
          supplies it in the static one. `relative` moves with it either way — it is on
          the inner wrapper here so both branches get the containing block, rather than
          relying on a class reaching the `li` that only one branch renders. */}
      {compact ? (
        entries.map((entry) => (
          <li key={entry.id}>
            <TimelineRow
              entry={entry}
              compact={compact}
              headingLevel={headingLevel}
            />
          </li>
        ))
      ) : (
        <Stagger as="li">
          {entries.map((entry) => (
            <TimelineRow
              key={entry.id}
              entry={entry}
              compact={compact}
              headingLevel={headingLevel}
            />
          ))}
        </Stagger>
      )}
    </ol>
  );
}

/**
 * One row's contents, without the `li` that holds them.
 *
 * Extracted so the static and staggered branches above render identical markup from one
 * place — the alternative was writing the dot and the entry twice and keeping the two
 * copies in step by hand. `relative` lives here rather than on the `li` because only one
 * of those branches renders an `li` this file controls; `Stagger` renders the other.
 */
function TimelineRow({
  entry,
  compact,
  headingLevel,
}: {
  entry: ExperienceEntry;
  compact: boolean;
  headingLevel: HeadingLevel;
}) {
  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="absolute top-[0.45rem] -left-7 size-2 rounded-none bg-border-strong"
      />
      <ExperienceEntryItem entry={entry} compact={compact} headingLevel={headingLevel} />
    </div>
  );
}
