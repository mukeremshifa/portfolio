import type { Metadata } from "next";

import { ContactCallout } from "@/components/home/ContactCallout";
import { CredentialsPreview } from "@/components/home/CredentialsPreview";
import { EngineeringFocus } from "@/components/home/EngineeringFocus";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { ExperiencePreview } from "@/components/home/ExperiencePreview";
import { Hero } from "@/components/home/Hero";
import { TechnologyList } from "@/components/home/TechnologyList";
import { SectionRail, type RailSection } from "@/components/layout/SectionRail";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import {
  getCertifications,
  getExperience,
  getFeaturedProjects,
  getFocus,
  getSite,
} from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { jsonLdScript, personJsonLd, webSiteJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = buildMetadata({
  title: getSite().seo.title,
  description: getSite().seo.description,
  path: "/",
  // app/opengraph-image.tsx sits in this segment and supplies the card.
  image: null,
});

// §8.1's "Experience snapshot" and "Credentials" are page-level filters over the existing
// selectors, not new ones. §5.1's API stays the size it is (see docs/DECISIONS.md).
const EXPERIENCE_SHOWN = 3;
const CREDENTIALS_SHOWN = 4;

// The rail's stops, in page order. Labels are shorter than the headings they point at —
// they sit in a gutter, and "Selected work" is what the reader is looking for out of
// "Selected work, and what each one had to solve". The ids are on the wrappers below.
const SECTIONS: RailSection[] = [
  { id: "intro", label: "Intro" },
  { id: "work", label: "Selected work" },
  { id: "focus", label: "Focus" },
  { id: "experience", label: "Experience" },
  { id: "credentials", label: "Credentials" },
  { id: "technology", label: "Technology" },
  { id: "contact", label: "Contact" },
];

/**
 * §8.1, six sections in order: who, proof, how, history, credibility, contact.
 *
 * **"Depth" is gone.** §8.1's fourth section promoted one project to a full case-study
 * block here. Every project page is now written as a case study in its own right, so that
 * section restated a page the "Selected work" cards already link to, and it did it above
 * the fold with `site.featuredCaseStudySlug` deciding which project got the second
 * telling. Removed 2026-08-31 along with the field, the selector, and §5.5 invariant 4.
 *
 * Everything below is a section under the hero's `h1`, so the outline is one `h1` and five
 * `h2`s with no level skipped. Each section reads its own slice of content here and
 * receives it as a prop (§9 rule 1), which is what keeps every component on this page
 * renderable from data the owner can edit.
 */
export default function Home() {
  const site = getSite();
  const featuredExperience = getExperience()
    .filter((entry) => entry.featured)
    .slice(0, EXPERIENCE_SHOWN);
  const featuredCertifications = getCertifications()
    .filter((certification) => certification.featured)
    .slice(0, CREDENTIALS_SHOWN);

  return (
    <Container>
      {/* §13.2. Two graphs, two tags: a single script element holds one node, and the
          alternative — an @graph array — buys nothing here. Native script rather than
          next/script because JSON-LD is data, and jsonLdScript() escapes it. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(personJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(webSiteJsonLd()) }}
      />

      {/* §11.2: the rail is in the DOM after the content it points into, so it never
          sits between the skip link and the page. It is `fixed`, so its position in the
          flow costs nothing. */}
      <div className="flex flex-col gap-section py-section md:gap-section-lg md:py-section-lg">
        {/* Each stop is a wrapper rather than an `id` inside the component: the section
            elements belong to the components, and a component that owns a page-level
            anchor id can only ever be used once per page. `data-rail-section` is what
            `globals.css` hangs `scroll-margin-top` on, so the sticky header never covers
            the heading the reader just jumped to. */}
        {/* Every section below the hero animates. Under the v2 spec three of them
            deliberately did not, and scrolling the page hit a dead patch at "Experience"
            that read as the motion having broken rather than as restraint — which is the
            owner's report that prompted §10's v3 rewrite. Consistency down the scroll is
            worth more here than a per-section judgment call.

            What still differs is *which* animation, and that is decided by what the
            section contains rather than by how important it is:

            - **Focus** and **Experience** get a `Reveal` — one block of prose or timeline
              arriving as one thing.
            - **Selected work**, **Credentials**, and **Technology** get nothing at this
              level, because their contents run their own sequence: the first two stagger
              their cards, the third waves its chips. A reveal on top would delay the
              section and *then* cascade within it, so the last item waits out both.
            - **Contact** carries its own `Reveal` plus an inner `Stagger`, inside
              `ContactCallout`, because it renders on three routes and has to bring its
              own motion with it.

            The hero is the one section with no scroll entrance, and that stays true: it
            is above the fold with its own four-stage load sequence, and an entrance on
            something already on screen at first paint is an animation nobody sees.

            The `Reveal`s sit inside the rail wrappers rather than replacing them: the
            `id` and `data-rail-section` belong to a stable element, and a motion wrapper
            is not one to hang a scroll anchor on. */}
        <div id="intro" data-rail-section>
          <Hero site={site} />
        </div>
        {/* No `Reveal`: the grid inside staggers. See the note above. */}
        <div id="work" data-rail-section>
          <FeaturedProjects projects={getFeaturedProjects()} />
        </div>
        <div id="focus" data-rail-section>
          <Reveal>
            <EngineeringFocus pillars={getFocus()} />
          </Reveal>
        </div>
        <div id="experience" data-rail-section>
          <Reveal>
            <ExperiencePreview entries={featuredExperience} />
          </Reveal>
        </div>
        {/* No `Reveal`, for the same reason as "Selected work" above: `CredentialsPreview`
            renders a `CertificationGrid`, and that grid staggers its own cards. */}
        <div id="credentials" data-rail-section>
          <CredentialsPreview certifications={featuredCertifications} />
        </div>
        {/* No `Reveal`: the chips inside run their own wave, and the same
            no-nesting rule that applies to the card grids applies here. */}
        <div id="technology" data-rail-section>
          <TechnologyList />
        </div>
        <div id="contact" data-rail-section>
          <ContactCallout site={site} />
        </div>
      </div>

      <SectionRail sections={SECTIONS} />
    </Container>
  );
}
