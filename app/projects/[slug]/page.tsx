import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { CodeHighlight } from "@/components/projects/CodeHighlight";
import { ProjectFacts } from "@/components/projects/ProjectFacts";
import { ScreenshotGallery } from "@/components/projects/ScreenshotGallery";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Figure } from "@/components/ui/Figure";
import { Prose } from "@/components/ui/Prose";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getProjectBySlug, getProjectSlugs } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { jsonLdScript, projectJsonLd } from "@/lib/structured-data";
import { formatYearRange } from "@/lib/utils";

type ProjectPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!getProjectSlugs().includes(slug)) return {};

  const project = getProjectBySlug(slug);
  return buildMetadata({
    title: project.seo?.title ?? project.title,
    description: project.seo?.description ?? project.summary,
    path: `/projects/${project.slug}`,
    type: "article",
  });
}

/**
 * §8.3's section order, top to bottom. The layout owns the one `<main>` (§11.1), so this
 * renders sections and never a `main` of its own, and `SectionHeading` is capped at
 * h2/h3 (§9.1), so the project title is written here as the page's own `h1`.
 *
 * Nothing below is conditional on *which* project this is. Adding a second project is a
 * JSON file and nothing else, which is the phase's exit criterion, and every empty-array
 * guard here exists to keep that true for a project carrying less than this one does.
 *
 * `CaseStudyNavigation` and the contact callout are §8.3's last two rows and belong to
 * Phase 3 per §18. With one project, prev/next renders two dead ends, which is worse
 * than absent. `getAdjacentProjects()` is built and tested; it has no consumer yet.
 */
export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  if (!getProjectSlugs().includes(slug)) notFound();

  const project = getProjectBySlug(slug);
  const timeline = formatYearRange(project.year.start, project.year.end);

  return (
    <Container>
      {/* §13.2. A native script tag rather than next/script: JSON-LD is data, not
          executable code, and lib/structured-data.ts escapes it. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(projectJsonLd(project)) }}
      />

      <div className="flex flex-col gap-12 py-12">
        <div className="flex flex-col gap-6">
          <Link
            href="/projects"
            className="inline-flex min-h-11 items-center self-start font-sans text-body-sm text-text-muted transition-colors duration-(--duration-fast) ease-standard hover:text-brand"
          >
            <span aria-hidden="true">&larr;</span>
            <span className="ml-2">Back to projects</span>
          </Link>

          <div className="flex flex-col gap-4">
            {/* Presentational, so a paragraph. An eyebrow must never stand in for a
                heading in the outline (§11.1). */}
            <p className="font-mono text-eyebrow text-text-muted uppercase">
              {project.category} &middot; {timeline}
            </p>
            <h1 className="max-w-measure font-serif text-display-2 font-semibold text-text">
              {project.title}
            </h1>
            <p className="max-w-measure font-sans text-body-lg text-text-muted">
              {project.summary}
            </p>
          </div>

          {/* An absent optional link produces no affordance at all: no disabled button,
              no empty row. The golden sample drops `docs` precisely to prove it. */}
          {project.links.live || project.links.github || project.links.docs ? (
            <div className="flex flex-wrap gap-3">
              {project.links.live ? (
                <Button href={project.links.live} external>
                  Live demo <span aria-hidden="true">&#8599;</span>
                </Button>
              ) : null}
              {project.links.github ? (
                <Button href={project.links.github} external variant="secondary">
                  Source <span aria-hidden="true">&#8599;</span>
                </Button>
              ) : null}
              {project.links.docs ? (
                <Button href={project.links.docs} external variant="secondary">
                  Documentation <span aria-hidden="true">&#8599;</span>
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        <ProjectFacts project={project} />

        <Figure
          src={project.cover.src}
          alt={project.cover.alt}
          width={project.cover.width}
          height={project.cover.height}
          priority
          sizes="(min-width: 1200px) 1200px, 100vw"
        />

        <Section title="Overview">
          <Prose>
            {project.overview.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </Prose>
        </Section>

        <Section title="What it does">
          <ul className="flex max-w-measure list-disc flex-col gap-2 pl-6 font-sans text-body text-text">
            {project.capabilities.map((capability) => (
              <li key={capability}>{capability}</li>
            ))}
          </ul>
        </Section>

        <Section title="Key features">
          <ul className="grid gap-8 md:grid-cols-2">
            {project.features.map((feature) => (
              <li key={feature.title} className="flex flex-col gap-2">
                <h3 className="font-sans text-heading-2 font-semibold text-text">
                  {feature.title}
                </h3>
                <p className="max-w-measure font-sans text-body text-text-muted">
                  {feature.body}
                </p>
              </li>
            ))}
          </ul>
        </Section>

        {project.codeSnippets.length > 0 ? (
          <Section title="Code highlights">
            <CodeHighlight snippets={project.codeSnippets} />
          </Section>
        ) : null}

        {project.screenshots.length > 0 ? (
          <Section title="Screenshots">
            <ScreenshotGallery screenshots={project.screenshots} />
          </Section>
        ) : null}

        {project.lessons.length > 0 ? (
          <Section title="Lessons learned">
            <ul className="flex max-w-measure list-disc flex-col gap-3 pl-6 font-sans text-body text-text">
              {project.lessons.map((lesson) => (
                <li key={lesson}>{lesson}</li>
              ))}
            </ul>
          </Section>
        ) : null}

        {project.caseStudy ? (
          <Section title="Case study">
            <dl className="flex max-w-measure flex-col gap-6">
              <div className="flex flex-col gap-2">
                <dt className="font-mono text-eyebrow text-text-muted uppercase">
                  Challenge
                </dt>
                <dd className="font-sans text-body text-text">
                  {project.caseStudy.challenge}
                </dd>
              </div>
              <div className="flex flex-col gap-2">
                <dt className="font-mono text-eyebrow text-text-muted uppercase">
                  Decision
                </dt>
                <dd className="font-sans text-body text-text">
                  {project.caseStudy.decision}
                </dd>
              </div>
              <div className="flex flex-col gap-2">
                <dt className="font-mono text-eyebrow text-text-muted uppercase">
                  Outcome
                </dt>
                <dd className="font-sans text-body text-text">
                  {project.caseStudy.outcome}
                </dd>
              </div>
            </dl>
          </Section>
        ) : null}
      </div>
    </Container>
  );
}

/**
 * Each §8.3 section is an h2 and its body. Sections whose data is empty are not rendered
 * at all, which is why every call site above is guarded rather than this helper handling
 * emptiness: a heading with nothing under it is the failure the rule exists to prevent.
 */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-6 border-t border-border-subtle pt-12">
      <SectionHeading title={title} />
      {children}
    </section>
  );
}
