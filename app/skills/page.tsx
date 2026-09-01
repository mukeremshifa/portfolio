import type { Metadata } from "next";
import Link from "next/link";

import { CertificationGrid } from "@/components/certifications/CertificationGrid";
import { Fade } from "@/components/motion/Fade";
import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger } from "@/components/motion/Stagger";
import { ContactCallout } from "@/components/home/ContactCallout";
import { SectionRail, type RailSection } from "@/components/layout/SectionRail";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { getCertifications, getFocus, getSite, getSkills } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { certificationListJsonLd, jsonLdScript } from "@/lib/structured-data";

export const metadata: Metadata = buildMetadata({
  title: "Skills",
  description:
    "What I am focused on now, the tools I actually use, and the credentials behind them — with the issuer, the date, and a verification link where one exists.",
  path: "/skills",
});

/**
 * `/skills/`, which replaced `/certifications/` on 2026-08-31.
 *
 * **The rename fixed a nav that had been lying.** §7.2 labelled `/certifications/` "Skills"
 * and the route rendered credentials only, so the one link on the site promising skills
 * delivered a list of courses. The page now holds all three of the things that label
 * implies, and `next.config.ts` redirects the old path permanently.
 *
 * **The section order is the argument.** Focus first, then tools, then credentials: a bare
 * list of tools is not evidence that any of them were used well, and a bare list of
 * credentials is not evidence either. The pillars say what the tools are *for*, and the
 * certificates are the only part of the page a third party vouches for, so they close it
 * rather than open it. Shipping the tool list alone would have reproduced the defect this
 * page exists to fix, one noun over.
 *
 * §5.4 and §21: definition lists with **no proficiency indicators** of any kind. No bars,
 * no stars, no percentages. A self-assessed number is unfalsifiable, and grouping by use
 * context says more than a scale nobody can check.
 *
 * The JSON-LD stays a strict subset of the page: §13.2 restricts the credential graph to
 * entries with a verifiable URL, so a credential rendered here in prose may legitimately be
 * absent from the machine-readable list. Prose can be read with judgement; structured data
 * is an assertion, and asserting something unverifiable is the thing to avoid.
 */
// The rail's stops, in page order. See components/layout/SectionRail.tsx.
const SECTIONS: RailSection[] = [
  { id: "intro", label: "Overview" },
  { id: "focus", label: "Current focus" },
  { id: "tools", label: "Tools" },
  { id: "certifications", label: "Certifications" },
  { id: "contact", label: "Contact" },
];

export default function SkillsPage() {
  const site = getSite();
  const certifications = [...getCertifications()].sort((a, b) =>
    b.issued.localeCompare(a.issued),
  );

  return (
    <Container>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(certificationListJsonLd(certifications)),
        }}
      />

      <div className="flex flex-col gap-section py-section md:gap-section-lg md:py-section-lg">
        <div id="intro" data-rail-section className="flex flex-col gap-4">
          <SplitText
            as="h1"
            className="font-serif text-display-2 font-semibold text-text"
          >
            Skills
          </SplitText>
          <Fade delay={0.35}>
            <p className="max-w-measure font-sans text-body-lg text-text-muted">
              Core technologies, languages, and frameworks, including what I am working on
              getting good at, what I actually build with, and the credentials that back
              some of it up.
            </p>
          </Fade>
        </div>

        <section id="focus" data-rail-section className="flex flex-col gap-heading">
          <Reveal className="flex flex-col gap-heading">
            <SectionHeading
              title="What I am focused on right now"
              lead="Three things I keep choosing to work on, and the tools each one actually runs on."
            />
            {/* §10.3: each pillar arrives in turn. `Stagger` supplies the `li`. */}
            <ul className="flex flex-col gap-8">
              <Stagger as="li">
                {getFocus().map((pillar) => (
                  <div key={pillar.id} className="flex flex-col gap-3">
                    <h3 className="max-w-measure font-sans text-heading-2 font-semibold text-text">
                      {pillar.title}
                    </h3>
                    <p className="max-w-measure font-sans text-body text-text-muted">
                      {pillar.body}
                    </p>
                    {pillar.technologies.length > 0 ? (
                      <ul className="flex flex-wrap gap-2">
                        {pillar.technologies.map((technology) => (
                          <li key={technology} className="max-w-full">
                            <Tag>
                              <span className="break-words">{technology}</span>
                            </Tag>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </Stagger>
            </ul>
          </Reveal>
        </section>

        <section id="tools" data-rail-section className="flex flex-col gap-heading">
          <Reveal className="flex flex-col gap-heading">
            <SectionHeading
              title="Tools I reach for"
              lead="Grouped by what I use them for, with no proficiency scale attached to any of them."
            />
            <dl className="flex flex-col gap-6">
              {getSkills().map((group) => (
                <div key={group.id} className="flex flex-col gap-2">
                  <dt className="font-mono text-eyebrow text-text-muted uppercase">
                    {group.title}
                  </dt>
                  <dd>
                    <ul className="flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <li key={item} className="max-w-full">
                          <Tag>
                            <span className="break-words">{item}</span>
                          </Tag>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </section>

        <section
          id="certifications"
          data-rail-section
          className="flex flex-col gap-heading"
        >
          <Reveal className="flex flex-col gap-heading">
            <SectionHeading
              title="Certifications"
              lead="Continuous learning backed by industry-recognized certifications across AI engineering and modern backend development. The issuer, the date, and a link to verify where one exists."
            />
            <CertificationGrid certifications={certifications} headingLevel="h3" />
          </Reveal>
        </section>

        {/* §7.4: no page is a dead end, and this one previously handed the reader
            straight from a course certificate to a contact card. The tools and the
            credentials are both claims; the projects are the only place they are
            cashed out, so the exit points there rather than at the inbox. */}
        <p className="font-sans text-body text-text-muted">
          A list of tools is not evidence that any of them were used well. What I built
          with them is on{" "}
          <Link
            href="/projects"
            className="text-brand underline decoration-1 underline-offset-[3px] transition-colors duration-(--duration-fast) ease-out hover:text-brand-hover"
          >
            the projects page
          </Link>
          .
        </p>

        <div id="contact" data-rail-section>
          <ContactCallout site={site} />
        </div>
      </div>

      <SectionRail sections={SECTIONS} />
    </Container>
  );
}
