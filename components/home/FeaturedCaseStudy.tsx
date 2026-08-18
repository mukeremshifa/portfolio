import { CaseStudySummary } from "@/components/projects/CaseStudySummary";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Project } from "@/lib/schemas";

type FeaturedCaseStudyProps = { project: Project };

/**
 * §8.1's fourth section.
 *
 * `getFeaturedCaseStudy()` throws with a §5.5 invariant 4 message when
 * `site.featuredCaseStudySlug` does not resolve, so this component never has to render an
 * empty section — but the project it resolves to may still carry no `caseStudy` block, and
 * a heading over nothing is the failure §8.3's rule exists to prevent. Hence the guard.
 *
 * The three rows come from `CaseStudySummary`, the same component `/projects/[slug]/`
 * renders, so the home page's summary of a case study and the case study itself cannot
 * present the same three facts two different ways.
 */
export function FeaturedCaseStudy({ project }: FeaturedCaseStudyProps) {
  if (!project.caseStudy) return null;

  return (
    <section className="flex flex-col gap-heading">
      <SectionHeading eyebrow={project.category} title="Featured case study" />
      <div className="flex flex-col gap-8">
        <h3 className="max-w-measure font-serif text-heading-1 font-semibold text-text">
          {project.title}
        </h3>
        <CaseStudySummary caseStudy={project.caseStudy} />
        <div className="flex flex-wrap gap-3">
          <Button href={`/projects/${project.slug}`} variant="secondary">
            Read the full project
          </Button>
        </div>
      </div>
    </section>
  );
}
