import { CertificationCard } from "@/components/certifications/CertificationCard";
import { Stagger } from "@/components/motion/Stagger";
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
 *
 * **The cards stagger in** (§10.2), and this grid can afford it where `ProjectGrid`
 * cannot: nothing filters certifications, so the entrance runs once per page view on
 * first scroll-in and never again. `Stagger` renders each child as an `li`, so the list
 * stays a real list (§11.1), and it caps the offset at six children — past that the last
 * card waits most of a second for a sequence nobody perceives.
 *
 * Because this grid staggers, no caller should also wrap it in a `Reveal`; the home page
 * leaves its Credentials section unwrapped for exactly this reason.
 */
export function CertificationGrid({
  certifications,
  headingLevel = "h3",
}: CertificationGridProps) {
  return (
    <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* `Stagger` supplies the `li`, so the map yields the card and not the list item.
          The key goes on the child it wraps; `Children.map` keeps the wrappers stable.

          `perRow={2}` is the `md` column count. This grid also goes to three at `lg`,
          which `Stagger` does not model — it reads one breakpoint, not a scale. The
          mismatch is deliberate and cheap: at `lg` the third card of each row shares a
          beat with the next row's first, which at 70ms is a rounding error in the sweep,
          and modelling the full responsive scale would mean teaching a motion component
          the whole grid system to fix something nobody can see. */}
      <Stagger as="li" perRow={2}>
        {certifications.map((certification) => (
          <CertificationCard
            key={certification.id}
            certification={certification}
            headingLevel={headingLevel}
          />
        ))}
      </Stagger>
    </ul>
  );
}
