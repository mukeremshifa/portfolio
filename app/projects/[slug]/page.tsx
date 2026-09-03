import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { ContactCallout } from "@/components/home/ContactCallout";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { CaseStudyNavigation } from "@/components/projects/CaseStudyNavigation";
import { CaseStudySummary } from "@/components/projects/CaseStudySummary";
import { ProjectFacts } from "@/components/projects/ProjectFacts";
import { BulletList } from "@/components/ui/BulletList";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Figure } from "@/components/ui/Figure";
import { Prose } from "@/components/ui/Prose";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  getAdjacentProjects,
  getProjectBySlug,
  getProjectSlugs,
  getSite,
} from "@/lib/content";
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
    // This segment generates its own card from the project (§13.4).
    image: null,
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
 * Phase 3 adds §8.3's last two rows: `CaseStudyNavigation`, which finally has a list to
 * walk, and the shared `ContactCallout`, so this page is not a dead end (§7.4). It also
 * brings the page onto §6.7's section rhythm — Phase 2 shipped 48px between sections and
 * 24px under a heading against a spec that says 64/112 and 32, which was invisible with
 * one page and would have been the thing that made six pages look unconsidered.
 */
export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  if (!getProjectSlugs().includes(slug)) notFound();

  const project = getProjectBySlug(slug);
  const timeline = formatYearRange(project.year.start, project.year.end);
  const adjacent = getAdjacentProjects(slug);

  return (
    <Container>
      {/* §13.2. A native script tag rather than next/script: JSON-LD is data, not
          executable code, and lib/structured-data.ts escapes it. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(projectJsonLd(project)) }}
      />

      <div className="flex flex-col gap-section py-section md:gap-section-lg md:py-section-lg">
        <div className="flex flex-col gap-6">
          <Link
            href="/projects"
            className="inline-flex min-h-11 items-center self-start font-sans text-body-sm text-text-muted transition-colors duration-(--duration-fast) ease-out hover:text-brand"
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
            {/* §10.3's character split, the same treatment the home hero's role line
                gets. This is the one other real-text `h1` on the site — the home page's
                is drawn artwork — so it is the one other place the effect belongs.
                `SplitText` scales its step to the string, so an 80-character title
                sweeps rather than crawls. */}
            <SplitText
              as="h1"
              delay={0.1}
              className="max-w-measure font-serif text-display-2 font-semibold text-text"
            >
              {project.title}
            </SplitText>
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

        <Reveal>
          <ProjectFacts project={project} />
        </Reveal>

        {/* Absent on a brief project (§5.3). The page opens straight into "Overview"
            then, which is the intended shape rather than a degraded one — there is no
            placeholder and no reserved empty band, because a box holding nothing is worse
            than a page that is simply shorter. */}
        {project.cover ? (
          // §10.3's blur-scale. This is the page's lead image and the largest thing on
          // it; `onMount` because it sits above the fold on most screens, where a
          // viewport trigger fires instantly and the reveal is wasted.
          <ImageReveal delay={0.35} onMount>
            <Figure
              src={project.cover.src}
              srcDark={project.cover.srcDark}
              alt={project.cover.alt}
              width={project.cover.width}
              height={project.cover.height}
              preload
              sizes="(min-width: 1200px) 1200px, 100vw"
            />
          </ImageReveal>
        ) : null}

        <Section title="Overview">
          <Prose>
            {project.overview.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </Prose>
        </Section>

        {/* One section where there were two. "What it does" was a bulleted `capabilities`
            list sitting directly above this grid saying the same thing in a different
            shape, which asked the reader to find a distinction the author had not drawn.
            Bullets are now reserved for "Lessons learned" — the one list on this page
            whose items are genuinely peers and nothing more. */}
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

        {project.lessons.length > 0 ? (
          <Section title="Lessons learned">
            <BulletList items={project.lessons} gap="loose" />
          </Section>
        ) : null}

        {project.caseStudy ? (
          <Section title="Case study">
            <CaseStudySummary caseStudy={project.caseStudy} />
          </Section>
        ) : null}

        <Reveal>
          <CaseStudyNavigation prev={adjacent.prev} next={adjacent.next} />
        </Reveal>

        <ContactCallout site={getSite()} />
      </div>
    </Container>
  );
}

/**
 * Each §8.3 section is an h2 and its body. Sections whose data is empty are not rendered
 * at all, which is why every call site above is guarded rather than this helper handling
 * emptiness: a heading with nothing under it is the failure the rule exists to prevent.
 *
 * **The `border-t` rule is gone.** Phase 2 drew one because 48px of space did not read as
 * a break on its own. At §6.7's 112px it does, and a rule on top of that is belt and
 * braces that makes a long technical page look like a settings screen. §6.7 asks for a
 * border on cards, not between sections. The one divider that survives on this page is
 * `CaseStudyNavigation`'s, where it separates the article from the way out of it.
 */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    // §10.3's entrance, applied here rather than at each of the four call sites above.
    // A case study is the longest scroll on the site and every section of it was static
    // — putting the `Reveal` in the shared helper means Overview, Key features, Lessons,
    // and Case study all animate, and any section added later inherits it instead of
    // being the one that does not move.
    <Reveal as="section">
      <div className="flex flex-col gap-heading">
        <SectionHeading title={title} />
        {children}
      </div>
    </Reveal>
  );
}
