import { describe, expect, test } from "vitest";

import { getAllProjects, getCertifications, getExperience, getSite } from "@/lib/content";

/**
 * No link in `content/` points at the site's own apex.
 *
 * This exists because two stub `docs` links did. They read as perfectly ordinary URLs —
 * `https://mukeremshifa.com/docs/<slug>` — and they 404, because there is no `/docs` route
 * and there is no plan for one. Worse, they were invisible in local verification: a crawl
 * of `localhost:3000` classifies an apex URL as external and never follows it, so the
 * break only appeared once the site was serving from the apex itself.
 *
 * Every field checked below is a link to somewhere else: a repository, a live deployment,
 * an organisation, a credential issuer. If a destination is genuinely on this site it
 * should be a root-relative path and an ordinary internal link, not an absolute URL that
 * leaves the app and comes back. `site.resume.url` is exactly that case and is why §5.2
 * accepts a root-relative path, so it is deliberately not in this list.
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
        .filter(([, url]) => url !== undefined && onApex(url))
        .map(([kind, url]) => `${project.slug}.links.${kind}: ${url}`),
    );
    expect(offenders).toEqual([]);
  });

  test("socials", () => {
    const offenders = getSite()
      .socials.filter((social) => onApex(social.url))
      .map((social) => `socials.${social.platform}: ${social.url}`);
    expect(offenders).toEqual([]);
  });

  test("organisation links on the timeline", () => {
    const offenders = getExperience()
      .filter((entry) => entry.organizationUrl && onApex(entry.organizationUrl))
      .map((entry) => `${entry.id}: ${entry.organizationUrl}`);
    expect(offenders).toEqual([]);
  });

  test("certification issuer and verification links", () => {
    const offenders = getCertifications().flatMap((certification) =>
      [
        ["issuerUrl", certification.issuerUrl],
        ["credentialUrl", certification.credentialUrl],
      ]
        .filter(([, url]) => url !== undefined && onApex(url))
        .map(([kind, url]) => `${certification.id}.${kind}: ${url}`),
    );
    expect(offenders).toEqual([]);
  });

  test("a link that would have caught the original bug is caught", () => {
    // The assertion that keeps the four above honest: `onApex` has to actually recognise
    // the shape that broke, not merely return false for everything.
    expect(onApex("https://mukeremshifa.com/docs/some-project")).toBe(true);
    expect(onApex("https://www.mukeremshifa.com/docs/some-project")).toBe(true);
    expect(onApex("https://docs.mukeremshifa.com/some-project")).toBe(false);
    expect(onApex("https://github.com/mukeremshifa/some-project")).toBe(false);
    expect(onApex("/placeholders/placeholder-resume.pdf")).toBe(false);
  });
});
