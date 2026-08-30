import { ExternalLink } from "@/components/ui/ExternalLink";
import { Tag } from "@/components/ui/Tag";
import type { Certification } from "@/lib/schemas";
import { formatMonth, type HeadingLevel } from "@/lib/utils";

type CertificationCardProps = {
  certification: Certification;
  headingLevel?: HeadingLevel;
  /** Compared against `expires` rather than read from the clock inside the card. */
  now?: Date;
};

/**
 * §8.6's card, and §9.3's contract.
 *
 * **An expired credential shows an explicit badge rather than being dropped.** §8.6 is
 * specific about that, and it is the honest behaviour: a credential that lapsed is a fact
 * about a real qualification, while silently removing it makes the page a claim about the
 * present that nobody can check against the past.
 *
 * The expiry comparison takes `now` as a prop with a default. String comparison is enough
 * because both sides are `YYYY-MM` and that format sorts lexically, which is most of why
 * the schema requires it.
 *
 * No `credentialUrl` means no "Verify credential" affordance at all — not a disabled one.
 * The same credential is also excluded from `/certifications/`'s JSON-LD, since §13.2
 * restricts that graph to credentials someone can actually verify.
 */
export function CertificationCard({
  certification,
  headingLevel = "h3",
  now = new Date(),
}: CertificationCardProps) {
  const Heading = headingLevel;
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const expired = certification.expires !== null && certification.expires < currentMonth;

  return (
    <article className="group flex h-full flex-col gap-4 rounded-none border border-border-subtle bg-surface p-6 transition-[border-color,background-color] duration-(--duration-fast) ease-standard hover:border-border-strong hover:bg-surface-alt">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="font-mono text-eyebrow text-text-muted uppercase">
          {formatMonth(certification.issued)}
        </p>
        {expired && certification.expires ? (
          // Warning rather than danger: a lapsed credential is a state to disclose, not
          // an error. `warning` on `surface-alt` keeps the pairing off the card's own
          // background so the chip reads as a chip in both themes.
          <span className="inline-flex items-center rounded-none border border-border-subtle bg-surface-alt px-2 py-1 font-mono text-body-sm text-warning">
            Expired {formatMonth(certification.expires)}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <Heading className="font-sans text-heading-2 font-semibold text-text">
          {certification.title}
        </Heading>
        <p className="font-sans text-body text-text-muted">
          {certification.issuerUrl ? (
            /* Same contrast fix as the project card: the card surface shifts under
               these links on hover, and `brand` on `surface-alt` measures 4.17:1 in
               dark mode, under AA. `brand-hover` there is 6.03:1. */
            <ExternalLink
              href={certification.issuerUrl}
              className="group-hover:text-brand-hover"
            >
              {certification.issuer}
            </ExternalLink>
          ) : (
            certification.issuer
          )}
        </p>
      </div>

      <ul className="mt-auto flex flex-wrap gap-2 pt-1">
        {certification.skills.map((skill) => (
          <li key={skill} className="max-w-full">
            <Tag>
              <span className="break-words">{skill}</span>
            </Tag>
          </li>
        ))}
      </ul>

      {certification.credentialUrl ? (
        <p className="font-sans text-body-sm">
          <ExternalLink
            href={certification.credentialUrl}
            className="group-hover:text-brand-hover"
          >
            Verify credential <span aria-hidden="true">&#8599;</span>
          </ExternalLink>
        </p>
      ) : null}
    </article>
  );
}
