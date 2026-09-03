import { describe, expect, test } from "vitest";

import { getAllProjects, getCertifications, getExperience, getSite } from "@/lib/content";

/**
 * No link in `content/` points at the site's own apex.
 *
 * This exists because two stub `docs` links did. They read as perfectly ordinary URLs —
 * `https://mukeremshifa.com/docs/<slug>` — and they 404, because there is no `/docs`
 * route and there is no plan for one. Worse, they were invisible in local verification: a
 * crawl of `localhost:3000` classifies an apex URL as external and never follows it, so
 * the break only appeared once the site was serving from the apex itself. `176e8fc` fixed
 * them by hand; this is what would have caught them.
 *
 * Every field checked below is a link to somewhere else: a repository, a live deployment,
 * an organisation, a credential issuer. If a destination is genuinely on this site it
 * should be a root-relative path and an ordinary internal link, not an absolute URL that
 * leaves the app and comes back. `site.resume.url` is exactly that case and is why §5.2
 * accepts a root-relative path, so it is deliberately not in this list.
 *
 * Recovered from `b4d5d05^` on 2026-09-04, which deleted it. Subdomains are allowed:
 * `conversekit.mukeremshifa.com` is a real separate deployment, not a route on this app.
 */

const APEX = "mukeremshifa.com";

/** Absolute URLs whose host is the apex or a bare `www.` of it. */
function onApex(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === APEX || hostname === `www.${APEX}`;
  } catch {
    // Not an absolute URL. Root-relative paths are internal links by design.
    return false;
  }
}

describe("content links point off-site, or are root-relative", () => {
  test("project links", () => {
    const offenders = getAllProjects().flatMap((project) =>
      Object.entries(project.links)
        .filter(([, url]) => typeof url === "string" && onApex(url))
        .map(([kind, url]) => `${project.slug}.links.${kind}: ${url}`),
    );
    expect(offenders).toEqual([]);
  });

  test("certification verify links and issuer sites", () => {
    const offenders = getCertifications().flatMap((certification) =>
      [certification.credentialUrl, certification.issuerUrl]
        .filter((url): url is string => typeof url === "string" && onApex(url))
        .map((url) => `${certification.title}: ${url}`),
    );
    expect(offenders).toEqual([]);
  });

  test("experience organisation links", () => {
    const offenders = getExperience()
      .map((entry) => entry.organizationUrl)
      .filter((url): url is string => typeof url === "string" && onApex(url));
    expect(offenders).toEqual([]);
  });

  test("social and handle links", () => {
    const site = getSite();
    const offenders = [...site.socials, ...site.handles]
      .filter((link) => onApex(link.url))
      .map((link) => `${link.label ?? link.platform}: ${link.url}`);
    expect(offenders).toEqual([]);
  });
});

describe("every external URL is well-formed and https", () => {
  /**
   * The owner verified all 33 URLs by hand on 2026-09-04. Nothing here re-checks that a
   * destination *exists* — that needs a network call, and a test suite that fails when
   * GitHub is slow is a test suite people learn to ignore. This checks the half that is
   * knowable offline: the string parses as a URL and uses https.
   */
  function collect(): string[] {
    const site = getSite();
    return [
      ...getAllProjects().flatMap((project) => Object.values(project.links)),
      ...getCertifications().flatMap((c) => [c.credentialUrl, c.issuerUrl]),
      ...getExperience().map((entry) => entry.organizationUrl),
      ...site.socials.map((link) => link.url),
      ...site.handles.map((link) => link.url),
    ].filter((url): url is string => typeof url === "string" && url.startsWith("http"));
  }

  test("all parse", () => {
    const malformed = collect().filter((url) => {
      try {
        new URL(url);
        return false;
      } catch {
        return true;
      }
    });
    expect(malformed).toEqual([]);
  });

  test("all use https", () => {
    const insecure = collect().filter((url) => !url.startsWith("https://"));
    expect(insecure).toEqual([]);
  });
});
