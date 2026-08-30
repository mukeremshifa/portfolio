import { getSite, getSkills } from "@/lib/content";
import { absoluteUrl } from "@/lib/metadata";
import type { Certification, Project } from "@/lib/schemas";

/**
 * §13.2's JSON-LD builders. Every value comes from `content/` — nothing here states a
 * fact the site does not already state in prose.
 *
 * Each builder lands with the page that renders it, so a builder never exists before its
 * consumer. Phase 2 built the project route's; Phase 3 completes the table.
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
 * §13.2's `/` graph: the full `Person`.
 *
 * Built from `personRef()` rather than beside it, so the two can never disagree about the
 * name or the URL — the reference is the same node, and every other graph on the site
 * points at it by those two properties.
 *
 * `address` appears **only if** `location` is set, per §13.2. `knowsAbout` is the skills
 * vocabulary, which is already the one list every technology string on the site has to
 * appear in (§5.5 invariant 8), so the graph claims exactly what the pages claim.
 */
export function personJsonLd(): JsonLd {
  const site = getSite();

  return {
    "@context": "https://schema.org",
    ...personRef(),
    jobTitle: site.role,
    description: site.intro,
    email: `mailto:${site.email}`,
    sameAs: site.socials.map((social) => social.url),
    knowsAbout: getSkills().flatMap((group) => group.items),
    ...(site.location.label
      ? {
          address: {
            "@type": "PostalAddress",
            addressLocality: site.location.label,
          },
        }
      : {}),
    ...(site.portrait ? { image: absoluteUrl(site.portrait.src) } : {}),
  };
}

/** §13.2's second `/` graph. Name and url, which is all a `WebSite` node honestly has. */
export function webSiteJsonLd(): JsonLd {
  const site = getSite();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: absoluteUrl("/"),
    inLanguage: "en",
  };
}

/**
 * §13.2's `/about/` graph. `mainEntity` references the `Person` rather than restating it,
 * which is the distinction a `ProfilePage` exists to draw: the page is about the person,
 * it is not a second person.
 */
export function profilePageJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: absoluteUrl("/about"),
    mainEntity: personRef(),
  };
}

/**
 * §13.2's `/projects/` graph: an `ItemList` of project URLs **in the order the page
 * renders them**. A list whose positions do not match what a reader sees is a claim about
 * ranking that the page does not make.
 */
export function projectListJsonLd(projects: Project[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: projects.length,
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/projects/${project.slug}`),
      name: project.title,
    })),
  };
}

/**
 * §13.2's `/certifications/` graph: **only credentials with a verifiable URL**.
 *
 * The filter is the point rather than a detail. Structured data is a machine-readable
 * assertion, and asserting a credential that offers nothing to check it against is the one
 * thing this graph must not do. The page still renders every credential, verifiable or
 * not; the page is prose and can be read with judgement.
 */
export function certificationListJsonLd(certifications: Certification[]): JsonLd {
  const verifiable = certifications.filter(
    (certification) => certification.credentialUrl !== undefined,
  );

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: verifiable.length,
    itemListElement: verifiable.map((certification, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "EducationalOccupationalCredential",
        name: certification.title,
        url: certification.credentialUrl,
        credentialCategory: "certificate",
        dateCreated: certification.issued,
        ...(certification.expires ? { expires: certification.expires } : {}),
        recognizedBy: {
          "@type": "Organization",
          name: certification.issuer,
          ...(certification.issuerUrl ? { url: certification.issuerUrl } : {}),
        },
        ...(certification.credentialId ? { identifier: certification.credentialId } : {}),
      },
    })),
  };
}

/**
 * §13.2: `SoftwareSourceCode` when there is a repository to point at, `CreativeWork`
 * otherwise. The distinction is not cosmetic — `SoftwareSourceCode` without
 * `codeRepository` claims source that nobody can reach.
 *
 * No `email` on this node: the address belongs to the `Person`, and repeating it per
 * project would assert that each project has its own contact address.
 */
export function projectJsonLd(project: Project): JsonLd {
  const repository = project.links.github;

  return {
    "@context": "https://schema.org",
    "@type": repository ? "SoftwareSourceCode" : "CreativeWork",
    name: project.title,
    description: project.summary,
    url: absoluteUrl(`/projects/${project.slug}`),
    // Omitted rather than defaulted when a brief project carries no cover. Pointing every
    // coverless project at the site's OG card would assert that a generic image depicts
    // this specific work, which is the kind of claim structured data should not make.
    ...(project.cover ? { image: absoluteUrl(project.cover.src) } : {}),
    author: personRef(),
    dateCreated: project.year.start,
    ...(project.year.end ? { dateModified: project.year.end } : {}),
    keywords: project.technologies,
    // No `programmingLanguage`. It used to be the distinct `codeSnippets[].language`
    // values — the honest answer, because that was the code actually published on the
    // page. With the snippets gone the only remaining candidate is `technologies`, and
    // that list is a superset carrying databases and infrastructure, which are not
    // programming languages. Asserting it would be worse than omitting the property,
    // and an empty array asserts nothing while still occupying the field.
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
 *
 * **The replacement is a backslash-escape, not a unicode escape.** Written with one
 * backslash it is a unicode escape in *this* file, evaluates to `<`, and makes the whole
 * call a no-op that reads exactly like a working one. Phase 2 shipped that version and it
 * went unnoticed until `tests/unit/structured-data.test.ts` asserted on the output rather
 * than on the intent. JSON reads the escape back as `<`, so the parsed value is unchanged.
 */
export function jsonLdScript(data: JsonLd): string {
  return JSON.stringify(data).replaceAll("<", "\\u003c");
}
