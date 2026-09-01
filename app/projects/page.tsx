import type { Metadata } from "next";

import { ProjectExplorer } from "@/components/projects/ProjectExplorer";
import { Fade } from "@/components/motion/Fade";
import { SplitText } from "@/components/motion/SplitText";
import { Container } from "@/components/ui/Container";
import { getAllProjects, getCategoryFilters } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { jsonLdScript, projectListJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = buildMetadata({
  title: "Projects",
  description:
    "A full index of AI, full-stack, and systems work, filterable by category, each with a case study behind it.",
  path: "/projects",
});

/**
 * §8.2's index.
 *
 * A server component that reads content and hands it down. The filter's state lives in one
 * client island (`ProjectExplorer`), which is the only part of this page that needs the
 * browser — the cards, the counts, and the JSON-LD are all resolved here.
 *
 * The `ItemList` graph is built from the same array the page renders, in the same order,
 * so its positions match what a reader actually sees rather than describing a ranking the
 * page does not make. It is the unfiltered list on purpose: the filter is a view of this
 * page, not a different page.
 */
export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <Container>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(projectListJsonLd(projects)) }}
      />

      <div className="flex flex-col gap-section py-section md:gap-section-lg md:py-section-lg">
        <div className="flex flex-col gap-4">
          <SplitText
            as="h1"
            className="font-serif text-display-2 font-semibold text-text"
          >
            Projects
          </SplitText>
          {/* The lead follows the title in, on mount rather than on scroll — it is above
              the fold, so a viewport trigger would fire before the `h1` had finished
              sweeping and the two would land together. */}
          <Fade delay={0.35}>
            <p className="max-w-measure font-sans text-body-lg text-text-muted">
              AI and full-stack work, from multi-tenant platforms to smaller pieces worth
              keeping. Each one has a page with the decisions behind it, including the
              ones that turned out to be wrong.
            </p>
          </Fade>
        </div>

        <ProjectExplorer projects={projects} filters={getCategoryFilters(projects)} />
      </div>
    </Container>
  );
}
