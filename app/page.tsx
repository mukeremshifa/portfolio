import type { Metadata } from "next";

import { ContactCallout } from "@/components/home/ContactCallout";
import { CredentialsPreview } from "@/components/home/CredentialsPreview";
import { EngineeringFocus } from "@/components/home/EngineeringFocus";
import { FeaturedCaseStudy } from "@/components/home/FeaturedCaseStudy";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { ExperiencePreview } from "@/components/home/ExperiencePreview";
import { Hero } from "@/components/home/Hero";
import { TechnologyList } from "@/components/home/TechnologyList";
import { Container } from "@/components/ui/Container";
import {
  getCertifications,
  getExperience,
  getFeaturedCaseStudy,
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

/**
 * §8.1, all seven sections in order: who, proof, how, depth, history, credibility,
 * contact.
 *
 * Everything below is a section under the hero's `h1`, so the outline is one `h1` and six
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

      <div className="flex flex-col gap-section py-section md:gap-section-lg md:py-section-lg">
        <Hero site={site} />
        <FeaturedProjects projects={getFeaturedProjects()} />
        <EngineeringFocus pillars={getFocus()} />
        <FeaturedCaseStudy project={getFeaturedCaseStudy()} />
        <ExperiencePreview entries={featuredExperience} />
        <CredentialsPreview certifications={featuredCertifications} />
        <TechnologyList />
        <ContactCallout site={site} />
      </div>
    </Container>
  );
}
