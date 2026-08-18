import { getSite } from "@/lib/content";
import { absoluteUrl } from "@/lib/metadata";
import type { Project } from "@/lib/schemas";

/**
 * §13.2's JSON-LD builders. Every value comes from `content/` — nothing here states a
 * fact the site does not already state in prose.
 *
 * Phase 2 builds only what the project route needs. The rest of §13.2's table
 * (`Person`, `WebSite`, `ItemList`, `ProfilePage`) lands as Phase 3 builds those routes,
 * so a builder never exists before the page that renders it.
 */
export type JsonLd = Record<string, unknown>;

/** The author reference every graph on the site points at. */
function personRef(): JsonLd {
  const site = getSite();
  return {
    "@type": "Person",
    name: site.name,
    url: absoluteUrl("/"),
  };
}

/**
 * §13.2: `SoftwareSourceCode` when there is a repository to point at, `CreativeWork`
 * otherwise. The distinction is not cosmetic — `SoftwareSourceCode` without
 * `codeRepository` claims source that nobody can reach.
 *
 * `site.email` is a marked placeholder until §19 Q1 is answered (Phase 5), which is why
 * it does not appear here yet.
 */
export function projectJsonLd(project: Project): JsonLd {
  const repository = project.links.github;

  return {
    "@context": "https://schema.org",
    "@type": repository ? "SoftwareSourceCode" : "CreativeWork",
    name: project.title,
    description: project.summary,
    url: absoluteUrl(`/projects/${project.slug}`),
    image: absoluteUrl(project.cover.src),
    author: personRef(),
    dateCreated: project.year.start,
    ...(project.year.end ? { dateModified: project.year.end } : {}),
    keywords: project.technologies,
    programmingLanguage: [
      // The snippet languages are the honest answer to "what language is this": they are
      // the code actually published on the page. The technology list is a superset that
      // includes databases and infrastructure, which are not programming languages.
      ...new Set(project.codeSnippets.map((snippet) => snippet.language)),
    ],
    ...(repository ? { codeRepository: repository } : {}),
    ...(project.links.live ? { sameAs: [project.links.live] } : {}),
  };
}

/**
 * Serialises a graph for a `<script type="application/ld+json">` tag.
 *
 * The `<` escape is not optional: `JSON.stringify` does not sanitise strings, and
 * content is authored input. Escaping the one character that can close the script
 * element is what keeps a stray `</script>` in a code snippet from ending the block.
 */
export function jsonLdScript(data: JsonLd): string {
  return JSON.stringify(data).replaceAll("<", "\u003c");
}
