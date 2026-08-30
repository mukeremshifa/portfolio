import type { Metadata } from "next";

import { Container } from "@/components/ui/Container";
import { Prose } from "@/components/ui/Prose";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { getFocus, getSite, getSkills } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { jsonLdScript, profilePageJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "How I work, what I am focused on now, and the tools I actually use. Context the project pages cannot give on their own.",
  path: "/about",
});

/**
 * §8.5, at prose width and deliberately short.
 *
 * **Skills live here rather than on the home page**, and that is a claim about evidence
 * rather than a layout preference: a list of tools is not proof that any of them were used
 * well. The projects are the proof; this page is the context around them.
 *
 * §5.4 and §21: definition lists with **no proficiency indicators** of any kind. No bars,
 * no stars, no percentages. A self-assessed number is unfalsifiable, and grouping by use
 * context says more than a scale nobody can check.
 *
 * The focus pillars render their `technologies` here and not on the home page, so the
 * tooling appears once, on the page that is about tooling.
 */
export default function AboutPage() {
  const site = getSite();

  return (
    <Container width="prose">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(profilePageJsonLd()) }}
      />

      <div className="flex flex-col gap-section py-section md:gap-section-lg md:py-section-lg">
        <div className="flex flex-col gap-4">
          <h1 className="font-serif text-display-2 font-semibold text-text">About</h1>
          <p className="max-w-measure font-sans text-body-lg text-text-muted">
            {site.intro}
          </p>
        </div>

        <section className="flex flex-col gap-heading">
          <SectionHeading title="How I work" />
          <Prose>
            <p>
              I start from the constraint rather than the feature list. Permissions,
              migrations, partial failure, and the second environment are the parts that
              decide what a system can become, and retrofitting them means rewriting the
              parts that were enjoyable to build.
            </p>
            <p>
              I would rather maintain something than ship it and move on. Four of the
              projects listed here are still in progress, and most of what I believe about
              any of their first designs came out of having to change it later.
            </p>
            <p>
              Accessibility and clarity are product requirements, not a pass at the end.
              Keyboard paths, focus order, contrast, and behaviour at 320 pixels get
              decided while a component is being written, because that is the only point
              at which they are cheap.
            </p>
          </Prose>
        </section>

        <section className="flex flex-col gap-heading">
          <SectionHeading title="What I am focused on now" />
          <ul className="flex flex-col gap-8">
            {getFocus().map((pillar) => (
              <li key={pillar.id} className="flex flex-col gap-3">
                <h3 className="font-sans text-heading-2 font-semibold text-text">
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
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-heading">
          <SectionHeading
            title="Tools I use"
            lead="Grouped by what they are for, with no proficiency scale attached to any of them."
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
        </section>

        <section className="flex flex-col gap-heading">
          <SectionHeading title="Outside engineering" />
          <Prose>
            <p>
              I watch a lot of mystery and thriller films, and I follow soccer closely. I
              do walk further than is strictly necessary. I try to give people the benefit
              of the doubt, and I like finding out how things work underneath the
              abstraction. The last one is arguably still engineering.
            </p>
          </Prose>
        </section>
      </div>
    </Container>
  );
}
