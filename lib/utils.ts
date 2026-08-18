import type { ExperienceEntry, ProjectStatus } from "@/lib/schemas";

/**
 * Class-name joiner.
 *
 * Deliberately dependency-free: no `clsx`, no `tailwind-merge`. The primitives in
 * `components/ui/` compose rather than parameterise (§9 rule 2), so the only component
 * that accepts an arbitrary `className` is `ExternalLink`. Nothing in this phase needs
 * conflict resolution between two competing Tailwind utilities, and a merge library
 * would be two pinned dependencies bought against a problem the contracts prevent.
 *
 * If a primitive ever does need to let callers override a utility it already sets, add
 * `tailwind-merge` then — without it, the winner is decided by stylesheet order rather
 * than by the order of the class attribute, which is not what the caller will expect.
 */
export type ClassValue = string | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}

/**
 * §8.3's project timeline. `end: null` means the work is current, so it renders
 * "Present"; a project that started and finished in the same year renders that year once
 * rather than as a range of it to itself.
 */
export function formatYearRange(start: string, end: string | null): string {
  if (end === null) return `${start} — Present`;
  return end === start ? start : `${start} — ${end}`;
}

/**
 * Month names for `YYYY-MM`, as a lookup rather than through `Intl` and a `Date`.
 *
 * `new Date("2021-09")` is parsed as UTC midnight and then formatted in the runtime's
 * zone, so west of Greenwich it renders as August. A date that is a label rather than an
 * instant should never go near a timezone, and a twelve-item array is cheaper than the
 * explanation of why it did.
 */
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** `2025-06` renders as `Jun 2025`. The schema guarantees the shape. */
export function formatMonth(value: string): string {
  const [year, month] = value.split("-");
  const name = MONTHS[Number(month) - 1];
  // A `YYYY-MM` that the schema let through cannot land here malformed, but returning
  // the raw value beats rendering "undefined 2025" if one ever does.
  return name && year ? `${name} ${year}` : value;
}

/**
 * §8.4's timeline range, the `YYYY-MM` sibling of `formatYearRange`.
 *
 * A sibling rather than a parameter on the original: the two take different input
 * shapes and one of them collapses on the year while the other collapses on the month.
 * Threading a format flag through would make both call sites read as a question.
 */
export function formatMonthRange(start: string, end: string | null): string {
  const from = formatMonth(start);
  if (end === null) return `${from} — Present`;
  const to = formatMonth(end);
  return from === to ? from : `${from} — ${to}`;
}

/**
 * Structural words for two schema enums (§9 rule 4). They name a state; they say nothing
 * about the person or the work, which is why they live in code rather than in `content/`.
 *
 * Here rather than beside their first consumer because each has two consumers now — the
 * project card and the project facts list, the timeline and its badge — and a label map
 * copied into a second component is how two pages start disagreeing about what
 * `in-progress` is called.
 */
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  completed: "Completed",
  "in-progress": "In progress",
  maintained: "Maintained",
};

export const EXPERIENCE_TYPE_LABELS: Record<ExperienceEntry["type"], string> = {
  employment: "Employment",
  freelance: "Freelance",
  internship: "Internship",
  research: "Research",
  education: "Education",
  independent: "Independent",
};

/**
 * §9.3 types `headingLevel` as `"h3" | "h4"`, which was written when the only consumer was
 * a section on the home page. On an index route the item *is* a top-level item under the
 * page `h1`, so `h2` is the correct level and §11.1's "heading levels never skip" is not
 * satisfiable without it. Widened rather than worked around with a visually hidden
 * heading, which would be a real element in the accessibility tree existing only to fill a
 * gap in a prop type. See docs/DECISIONS.md.
 */
export type HeadingLevel = "h2" | "h3" | "h4";
