import Link from "next/link";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  as?: "h2" | "h3";
  action?: { href: string; label: string };
  lead?: string;
};

// §6.6: heading-1 is Source Serif 4, heading-2 is Instrument Sans. The `--text-*` scale
// carries size, leading, and tracking; the family is a separate class by design.
const levels = {
  h2: "font-serif text-heading-1",
  h3: "font-sans text-heading-2",
} as const;

export function SectionHeading({
  eyebrow,
  title,
  as = "h2",
  action,
  lead,
}: SectionHeadingProps) {
  const Heading = as;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div className="flex flex-col gap-2">
          {/* §6.6 and §11.1: the eyebrow is presentational. It is a <p> so it can never
              substitute for a real heading in the document outline. */}
          {eyebrow ? (
            <p className="font-mono text-eyebrow text-text-muted uppercase">{eyebrow}</p>
          ) : null}
          <Heading className={`${levels[as]} font-semibold text-text`}>{title}</Heading>
        </div>
        {action ? (
          <Link
            href={action.href}
            className="font-sans text-body-sm text-brand underline decoration-1 underline-offset-[3px] transition-colors duration-(--duration-fast) ease-out hover:text-brand-hover"
          >
            {action.label}
          </Link>
        ) : null}
      </div>
      {lead ? (
        <p className="max-w-measure font-sans text-body-lg text-text-muted">{lead}</p>
      ) : null}
    </div>
  );
}
