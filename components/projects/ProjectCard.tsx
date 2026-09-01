import Link from "next/link";

import { ExternalLink } from "@/components/ui/ExternalLink";
import { Figure } from "@/components/ui/Figure";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tag } from "@/components/ui/Tag";
import type { Project } from "@/lib/schemas";
import { formatYearRange, PROJECT_STATUS_LABELS, type HeadingLevel } from "@/lib/utils";

type ProjectCardProps = {
  project: Project;
  variant?: "featured" | "standard";
  headingLevel?: HeadingLevel;
};

// §8.1: cards show 3 to 6 technologies. The golden sample carries twelve, so the cap is
// what stops one card's stack row from being taller than the card beside it. The overflow
// is stated rather than truncated silently — "+6 more" is a fact about the project; a row
// that just stops is a layout artefact the reader has to guess at.
const TECHNOLOGIES_SHOWN = 6;

/**
 * §6.8's card, and §9.3's contract.
 *
 * **The whole card is not a link.** The title anchor carries a stretched pseudo-element
 * (`after:absolute after:inset-0`) so the card has one accessible name and one tab stop
 * instead of four. Wrapping the card in an `<a>` would name the link with every word
 * inside it, which is what a screen reader then has to read out before the user can
 * decide whether to follow it.
 *
 * The honest cost: the overlay sits above the card's text, so dragging to select the
 * summary starts a link drag instead. That is the known trade of this pattern, and it is
 * still the better half of it — the alternative costs the accessible name.
 *
 * The external links sit in `relative z-10` so they stay clickable through the overlay,
 * and they are absent entirely when a project has none. Project 5 in the stub set carries
 * no links at all precisely so that row can be seen to disappear rather than reasoned
 * about.
 */
export function ProjectCard({
  project,
  variant = "standard",
  headingLevel = "h3",
}: ProjectCardProps) {
  const Heading = headingLevel;
  const featured = variant === "featured";
  const shown = project.technologies.slice(0, TECHNOLOGIES_SHOWN);
  const remaining = project.technologies.length - shown.length;
  const hasLinks = Boolean(
    project.links.live ?? project.links.github ?? project.links.docs,
  );

  return (
    <article
      className={`group relative flex h-full flex-col gap-5 rounded-none border border-border-subtle bg-surface p-6 transition-[border-color,background-color,transform] duration-(--duration-fast) ease-standard hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-alt ${
        featured ? "md:flex-row md:items-start md:gap-8 md:p-8" : ""
      }`}
    >
      {/* The featured card is the one place a cover earns its space: it spans the full
          grid width, so without the image it is a short paragraph in a very wide box.

          `cover` became optional with the brief project shape (§5.3), so this is now two
          conditions rather than one. A standard card never rendered the image anyway,
          which is exactly why a coverless project is invisible as such on `/projects` —
          the absence shows up on its own page, not in the grid. */}
      {featured && project.cover ? (
        <div className="md:w-2/5 md:shrink-0">
          <Figure
            src={project.cover.src}
            srcDark={project.cover.srcDark}
            alt={project.cover.alt}
            width={project.cover.width}
            height={project.cover.height}
            sizes="(min-width: 768px) 40vw, 100vw"
          />
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="font-mono text-eyebrow text-text-muted uppercase">
            {project.category} &middot;{" "}
            {formatYearRange(project.year.start, project.year.end)}
          </p>
          <StatusBadge
            state={project.status}
            label={PROJECT_STATUS_LABELS[project.status]}
          />
        </div>

        {/* Both families are spelled out per branch rather than layering `font-serif`
            over a base `font-sans`. Tailwind resolves two utilities for one property by
            stylesheet order, not by the order they appear in the attribute, so the
            "override" would win or lose depending on which rule Tailwind emitted last.
            See the note in `cn()` about why `tailwind-merge` is not installed. */}
        <Heading
          className={`font-semibold text-text ${
            featured ? "font-serif text-heading-1" : "font-sans text-heading-2"
          }`}
        >
          <Link
            href={`/projects/${project.slug}`}
            className="rounded-none underline-offset-[3px] group-hover:underline after:absolute after:inset-0 after:rounded-none focus-visible:underline"
          >
            {project.title}
          </Link>
        </Heading>

        <p className="max-w-measure font-sans text-body text-text-muted">
          {project.summary}
        </p>

        <ul className="mt-auto flex flex-wrap gap-2 pt-1">
          {shown.map((technology) => (
            <li key={technology} className="max-w-full">
              <Tag>
                <span className="break-words">{technology}</span>
              </Tag>
            </li>
          ))}
          {remaining > 0 ? (
            <li>
              <Tag>+{remaining} more</Tag>
            </li>
          ) : null}
        </ul>

        {hasLinks ? (
          // `relative z-10` lifts these above the title's stretched overlay. Without it
          // the overlay would swallow the clicks and every link on the card would
          // navigate to the project page instead.
          //
          // `group-hover:text-brand-hover` keeps the links legible as the card surface
          // shifts to `surface-alt` under the pointer. Re-measured against B4's dark
          // stack: `brand` on `surface-alt` is 6.04:1 dark and 7.70:1 light, so it now
          // clears AA on its own — the earlier 4.17:1 was the orange palette's number
          // and outlived it. `brand-hover` there is 7.33:1 dark and 10.53:1 light, so
          // the links still brighten with the background rather than trailing it.
          <ul className="relative z-10 flex flex-wrap items-center gap-x-5 gap-y-2 font-sans text-body-sm">
            {project.links.live ? (
              <li>
                <ExternalLink
                  href={project.links.live}
                  className="group-hover:text-brand-hover"
                >
                  Live <span aria-hidden="true">&#8599;</span>
                </ExternalLink>
              </li>
            ) : null}
            {project.links.github ? (
              <li>
                <ExternalLink
                  href={project.links.github}
                  className="group-hover:text-brand-hover"
                >
                  Source <span aria-hidden="true">&#8599;</span>
                </ExternalLink>
              </li>
            ) : null}
            {project.links.docs ? (
              <li>
                <ExternalLink
                  href={project.links.docs}
                  className="group-hover:text-brand-hover"
                >
                  Docs <span aria-hidden="true">&#8599;</span>
                </ExternalLink>
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
