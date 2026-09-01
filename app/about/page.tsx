import type { Metadata } from "next";
import Link from "next/link";

import { EducationList } from "@/components/about/EducationList";
import { Reveal } from "@/components/motion/Reveal";
import { ProfileHeader } from "@/components/about/ProfileHeader";
import { ContactCallout } from "@/components/home/ContactCallout";
import { SectionRail, type RailSection } from "@/components/layout/SectionRail";
import { Container } from "@/components/ui/Container";
import { Prose } from "@/components/ui/Prose";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getEducation, getSite } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { jsonLdScript, profilePageJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "Who I am, where I studied, and how I work. Context the project pages cannot give on their own.",
  path: "/about",
});

/**
 * §8.5, at prose width, restructured on 2026-08-31.
 *
 * **This page is about the person; `/skills/` is about the toolkit.** It used to be both,
 * and the tool groups plus the focus pillars crowded out everything a reader actually
 * comes to an About page for — where someone is, what they speak, what they studied. Those
 * two sections moved to `/skills/`, where they sit above the credentials that evidence
 * them, and this page took the space back.
 *
 * **The register is deliberately warmer than the rest of the site.** Every other page is
 * declarative because it is making checkable claims about work. This one is first person,
 * because the claim it makes is about who is making the others, and a bio written in the
 * project pages' voice reads like a third party describing someone.
 *
 * The `h1` is a greeting rather than "About". The nav label, the browser title, and the
 * canonical all still say About — only the visible heading changed, so nothing that
 * navigates or indexes by title moved.
 */
// The rail's stops, in page order. See components/layout/SectionRail.tsx.
const SECTIONS: RailSection[] = [
  { id: "profile", label: "Profile" },
  { id: "education", label: "Education" },
  { id: "how-i-work", label: "How I work" },
  { id: "outside", label: "Outside engineering" },
  { id: "contact", label: "Contact" },
];

export default function AboutPage() {
  const site = getSite();

  return (
    <Container width="prose">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(profilePageJsonLd()) }}
      />

      <div className="flex flex-col gap-section py-section md:gap-section-lg md:py-section-lg">
        <div id="profile" data-rail-section>
          <ProfileHeader site={site} />
        </div>

        <section id="education" data-rail-section className="flex flex-col gap-heading">
          <Reveal className="flex flex-col gap-heading">
            <SectionHeading title="Education" />
            <EducationList entries={getEducation()} />
          </Reveal>
        </section>

        <section id="how-i-work" data-rail-section className="flex flex-col gap-heading">
          <Reveal className="flex flex-col gap-heading">
            <SectionHeading title="How I work" />
            <Prose>
              <p>
                I like to start from the constraint rather than the feature list.
                Permissions, migrations, partial failure, and the awkward second environment
                are the parts that quietly decide what a system can become, and I have
                learned the hard way that retrofitting them means rewriting all the parts
                that were fun to build.
              </p>
              <p>
                I would honestly rather maintain something than ship it and walk away. Four
                of the projects here are still in progress, and most of what I believe about
                any of their first designs came out of having to change them later.
              </p>
              <p>
                Accessibility and clarity are product requirements to me, not a pass at the
                end. Keyboard paths, focus order, contrast, and how a thing behaves at 320
                pixels get decided while I am writing the component, because that is the
                only moment they are cheap.
              </p>
            </Prose>
          </Reveal>
        </section>

        <section id="outside" data-rail-section className="flex flex-col gap-heading">
          <Reveal className="flex flex-col gap-heading">
            <SectionHeading title="Outside engineering" />
            <Prose>
              <p>
                I watch a lot of mystery and thriller films, and I follow soccer more
                closely than is strictly reasonable. I walk further than I need to. I try to
                give people the benefit of the doubt, and I love finding out how things work
                underneath the abstraction. That last one is arguably still engineering.
              </p>
            </Prose>
          </Reveal>
        </section>

        {/* §7.4: no page is a dead end. This is a link rather than a repeated tag strip —
            the tools have a page now, and listing them twice would put the vocabulary in
            two places to drift apart in. */}
        <p className="font-sans text-body text-text-muted">
          The tools I actually use, and what I am focused on right now, live on{" "}
          <Link
            href="/skills"
            className="text-brand underline decoration-1 underline-offset-[3px] transition-colors duration-(--duration-fast) ease-out hover:text-brand-hover"
          >
            the skills page
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
