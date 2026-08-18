import { CertificationCard } from "@/components/certifications/CertificationCard";
import type { Certification } from "@/lib/schemas";
import type { HeadingLevel } from "@/lib/utils";

type CertificationGridProps = {
  certifications: Certification[];
  headingLevel?: HeadingLevel;
};

/**
 * §8.6's card grid, and the home page's Credentials section.
 *
 * Two up at `md` and three at `lg`: certification cards carry much less text than project
 * cards, so at 1200px a two-column grid leaves each card mostly empty. Ordering and any
 * filtering happen in the page above (§9 rule 1).
 */
export function CertificationGrid({
  certifications,
  headingLevel = "h3",
}: CertificationGridProps) {
  return (
    <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {certifications.map((certification) => (
        <li key={certification.id}>
          <CertificationCard certification={certification} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}
