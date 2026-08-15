import type { Metadata } from "next";

import { Reveal } from "@/components/motion/Reveal";
import { Stagger } from "@/components/motion/Stagger";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { Prose } from "@/components/ui/Prose";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tag } from "@/components/ui/Tag";
import { VisuallyHidden } from "@/components/ui/VisuallyHidden";

/**
 * The Phase 1 exit criterion, and a visual regression surface for the rest of the build:
 * every primitive, in every variant, in whichever theme the toggle is set to.
 *
 * It is `noindex, nofollow` because it is a development surface on a production origin.
 * When `sitemap.ts` lands in Phase 2 it must exclude `/dev/*` as well — metadata alone
 * keeps it out of the index, not out of the sitemap.
 *
 * Its fate is decided, not drifted into: it survives past Phase 6 as a living reference,
 * on the condition that this noindex and the sitemap exclusion are both verified in the
 * Phase 6 hardening pass. If either is ever in doubt, delete the route instead.
 */
export const metadata: Metadata = {
  title: "Primitives",
  robots: { index: false, follow: false },
};

const TYPE_SCALE = [
  { token: "display-1", family: "font-serif", className: "text-display-1" },
  { token: "display-2", family: "font-serif", className: "text-display-2" },
  { token: "heading-1", family: "font-serif", className: "text-heading-1" },
  { token: "heading-2", family: "font-sans", className: "text-heading-2" },
  { token: "heading-3", family: "font-sans", className: "text-heading-3" },
  { token: "body-lg", family: "font-sans", className: "text-body-lg" },
  { token: "body", family: "font-sans", className: "text-body" },
  { token: "body-sm", family: "font-sans", className: "text-body-sm" },
  { token: "eyebrow", family: "font-mono", className: "text-eyebrow uppercase" },
  { token: "code", family: "font-mono", className: "text-code" },
] as const;

const SURFACE_TOKENS = [
  { name: "canvas", className: "bg-canvas" },
  { name: "surface", className: "bg-surface" },
  { name: "surface-alt", className: "bg-surface-alt" },
  { name: "code-bg", className: "bg-code-bg" },
  { name: "brand", className: "bg-brand" },
  { name: "brand-solid", className: "bg-brand-solid" },
  { name: "brand-soft", className: "bg-brand-soft" },
  { name: "danger", className: "bg-danger" },
  { name: "success", className: "bg-success" },
  { name: "warning", className: "bg-warning" },
] as const;

const STATUSES = [
  { state: "completed", label: "Completed" },
  { state: "in-progress", label: "In progress" },
  { state: "maintained", label: "Maintained" },
  { state: "available", label: "Available" },
  { state: "open", label: "Open to offers" },
  { state: "unavailable", label: "Unavailable" },
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Reveal as="section">
      <div className="flex flex-col gap-6 border-t border-border-subtle py-12">
        <SectionHeading eyebrow="Primitive" title={title} />
        {children}
      </div>
    </Reveal>
  );
}

export default function PrimitivesPage() {
  return (
    <Container>
      <div className="py-12">
        {/* §9.1 caps `SectionHeading` at h2/h3 because it is for *section* headings.
            A page's h1 is the page's own, so it is written here — which also keeps the
            outline from skipping straight to h2 (§11.1). */}
        <div className="flex flex-col gap-3">
          <p className="font-mono text-eyebrow text-text-muted uppercase">Phase 1</p>
          <h1 className="font-serif text-display-2 font-semibold text-text">
            Primitives
          </h1>
          <p className="max-w-measure font-sans text-body-lg text-text-muted">
            Every primitive, in every variant. Toggle the theme in the header and this
            page is the check: nothing here should be unstyled, illegible, or invisible in
            either theme.
          </p>
        </div>

        <Section title="Type scale">
          <dl className="flex flex-col gap-6">
            {TYPE_SCALE.map((step) => (
              <div key={step.token} className="flex flex-col gap-1">
                <dt className="font-mono text-eyebrow text-text-muted uppercase">
                  {step.token}
                </dt>
                <dd className={`${step.family} ${step.className} text-text`}>
                  The quick brown fox jumps over the lazy dog
                </dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section title="Surface tokens">
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {SURFACE_TOKENS.map((token) => (
              <li key={token.name} className="flex flex-col gap-2">
                <span
                  aria-hidden="true"
                  className={`h-16 rounded-lg border border-border-subtle ${token.className}`}
                />
                <span className="font-mono text-body-sm text-text-muted">
                  {token.name}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Text and border tokens">
          <ul className="flex flex-col gap-3">
            <li className="font-sans text-body text-text">text — primary</li>
            <li className="font-sans text-body text-text-muted">
              text-muted — secondary
            </li>
            <li className="font-sans text-body text-brand">brand — links and accents</li>
            <li className="font-sans text-body text-danger">danger — form errors</li>
            <li className="font-sans text-body text-success">success — form success</li>
            <li className="font-sans text-body text-warning">warning</li>
            <li className="rounded-md border border-border-subtle p-3 font-sans text-body-sm text-text-muted">
              border-subtle — decorative dividers only
            </li>
            <li className="rounded-md border border-border-strong p-3 font-sans text-body-sm text-text">
              border-strong — control boundaries
            </li>
            <li className="rounded-md bg-surface p-3">
              <span className="font-sans text-body-sm text-text">
                On surface, for the §6.1 contrast spot-check
              </span>
            </li>
          </ul>
        </Section>

        <Section title="Button">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <Button>Primary md</Button>
              <Button variant="secondary">Secondary md</Button>
              <Button variant="ghost">Ghost md</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Primary sm</Button>
              <Button size="sm" variant="secondary">
                Secondary sm
              </Button>
              <Button size="sm" variant="ghost">
                Ghost sm
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button href="/">Link button</Button>
              <Button href="https://nextjs.org" external variant="secondary">
                External link button
              </Button>
              <Button disabled>Disabled button</Button>
            </div>
          </div>
        </Section>

        <Section title="Tag">
          <div className="flex flex-wrap gap-2">
            <Tag>TypeScript</Tag>
            <Tag>Next.js</Tag>
            <Tag>PostgreSQL</Tag>
            <Tag tone="accent">Retrieval-Augmented Generation</Tag>
          </div>
        </Section>

        <Section title="StatusBadge">
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((status) => (
              <StatusBadge key={status.state} state={status.state} label={status.label} />
            ))}
          </div>
        </Section>

        <Section title="SectionHeading">
          <div className="flex flex-col gap-10">
            <SectionHeading title="Title only" />
            <SectionHeading eyebrow="Eyebrow" title="With an eyebrow" />
            <SectionHeading
              eyebrow="Eyebrow"
              title="With a lead and an action"
              lead="A lead paragraph sits under the title at body-lg and is capped at the prose measure so it never runs past 68 characters."
              action={{ href: "/projects/", label: "All projects" }}
            />
            <SectionHeading as="h3" title="As an h3, in Instrument Sans" />
          </div>
        </Section>

        <Section title="Prose">
          <Prose>
            <p>
              Running text sits at the <code>body</code> step and is capped at 68
              characters, which is what <code>Prose</code> enforces. This paragraph is
              long enough to wrap several times, so the measure is actually visible rather
              than asserted — if it runs the full width of the container, the cap is not
              working.
            </p>
            <h3>A heading inside prose</h3>
            <p>
              Links in running prose are <a href="/projects/">brand-coloured</a> with a
              1px underline that thickens on hover, per §6.8. Inline <code>code</code>{" "}
              sits on the <code>code-bg</code> token.
            </p>
            <ul>
              <li>Lists are real lists</li>
              <li>With real spacing between items</li>
            </ul>
          </Prose>
        </Section>

        <Section title="ExternalLink">
          <p className="font-sans text-body text-text">
            <ExternalLink href="https://nextjs.org">This opens in a new tab</ExternalLink>{" "}
            — and says so, in text only a screen reader hears.
          </p>
        </Section>

        <Section title="Container">
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-border-subtle bg-surface p-4">
              <p className="font-sans text-body-sm text-text-muted">
                content — 1200px, for grids and cards
              </p>
            </div>
            <div className="max-w-prose rounded-lg border border-border-subtle bg-surface p-4">
              <p className="font-sans text-body-sm text-text-muted">
                prose — 720px, for running text
              </p>
            </div>
          </div>
        </Section>

        <Section title="VisuallyHidden">
          <p className="font-sans text-body text-text">
            There is a hidden word after this colon:
            <VisuallyHidden> (hidden, but announced)</VisuallyHidden> — inspect the DOM or
            listen to it.
          </p>
        </Section>

        <Section title="Stagger">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Stagger as="li">
              {Array.from({ length: 6 }, (_, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-border-subtle bg-surface p-6 transition-[background-color,border-color,transform] duration-(--duration-fast) ease-standard hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-alt"
                >
                  <p className="font-sans text-heading-2 font-semibold text-text">
                    Card {index + 1}
                  </p>
                  <p className="mt-2 font-sans text-body-sm text-text-muted">
                    Border and surface change on hover — never a shadow (§6.7).
                  </p>
                </div>
              ))}
            </Stagger>
          </ul>
        </Section>

        <Section title="Overlay shadow">
          <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-overlay">
            <p className="font-sans text-body-sm text-text-muted">
              The only shadow in the system, reserved for the mobile nav panel and
              dialogs. Shown here so it is reviewable in both themes; it belongs nowhere
              else.
            </p>
          </div>
        </Section>
      </div>
    </Container>
  );
}
