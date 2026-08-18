import { SectionHeading } from "@/components/ui/SectionHeading";
import type { FocusPillar } from "@/lib/schemas";

type EngineeringFocusProps = { pillars: FocusPillar[] };

/**
 * §8.1's third section: exactly three pillars, each a title and a short body.
 *
 * §21 rules out everything this section would otherwise attract — no icons that carry
 * meaning, no percentage bars, no skill clouds. What is left is three claims in words,
 * which is the only form of this section that can be read as true or false.
 *
 * The pillars' `technologies` are not rendered here. They appear on `/about/` under "What
 * I am focused on now", where §8.5 already puts the tooling; showing them twice would make
 * the home page the skills page it is deliberately not.
 */
export function EngineeringFocus({ pillars }: EngineeringFocusProps) {
  return (
    <section className="flex flex-col gap-heading">
      <SectionHeading title="Engineering focus" />
      <ul className="grid gap-8 md:grid-cols-3">
        {pillars.map((pillar) => (
          <li key={pillar.id} className="flex flex-col gap-2">
            <h3 className="font-sans text-heading-2 font-semibold text-text">
              {pillar.title}
            </h3>
            <p className="max-w-measure font-sans text-body text-text-muted">
              {pillar.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
