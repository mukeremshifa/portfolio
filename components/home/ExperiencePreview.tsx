import { ExperienceTimeline } from "@/components/experience/ExperienceTimeline";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { ExperienceEntry } from "@/lib/schemas";

type ExperiencePreviewProps = { entries: ExperienceEntry[] };

/**
 * §8.1's fifth section: up to three featured entries, with the heading row linking to
 * `/experience/`.
 *
 * `compact` on the shared timeline rather than a second, shorter timeline component. The
 * home page shows what each role was; the full page shows what came of it. Two components
 * would mean two places to fix the day the date range renders wrong.
 */
export function ExperiencePreview({ entries }: ExperiencePreviewProps) {
  if (entries.length === 0) return null;

  return (
    <section className="flex flex-col gap-heading">
      <SectionHeading
        title="Experience"
        action={{ href: "/experience", label: "Full timeline →" }}
      />
      <ExperienceTimeline entries={entries} compact />
    </section>
  );
}
