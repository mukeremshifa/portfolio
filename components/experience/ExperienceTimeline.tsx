import { ExperienceEntryItem } from "@/components/experience/ExperienceEntry";
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
      {entries.map((entry) => (
        <li key={entry.id} className="relative">
          <span
            aria-hidden="true"
            className="absolute top-[0.45rem] -left-7 size-2 rounded-none bg-border-strong"
          />
          <ExperienceEntryItem
            entry={entry}
            compact={compact}
            headingLevel={headingLevel}
          />
        </li>
      ))}
    </ol>
  );
}
