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
