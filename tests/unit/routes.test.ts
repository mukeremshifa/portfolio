import { describe, expect, test } from "vitest";

import { metadata as devPrimitivesMetadata } from "@/app/dev/primitives/page";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { getProjectSlugs } from "@/lib/content";
import { SITE_ORIGIN } from "@/lib/metadata";

/**
 * The routing surface the site exposes: what is in the sitemap, what crawlers are told,
 * and the one development route that ships to production.
 *
 * `/dev/primitives` set its own condition when it was written (Phase 1): it survives past
 * Phase 6 as a living reference **only if** its `noindex` and its sitemap exclusion are
 * both verified in the hardening pass, and is deleted otherwise. Verifying that by hand
 * once is what the comment asked for; asserting it here is what keeps it true, because
 * both halves are one careless edit away from silently reversing and neither failure is
 * visible on the page itself.
 */

describe("/dev/primitives stays out of the index", () => {
  test("it declares noindex, nofollow", () => {
    expect(devPrimitivesMetadata.robots).toMatchObject({
      index: false,
      follow: false,
    });
  });

  test("it is absent from the sitemap", () => {
    // Metadata alone keeps a URL out of the index, not out of the sitemap. Listing it
    // would advertise a development surface and then ask crawlers to ignore it.
    const urls = sitemap().map((entry) => entry.url);
    expect(urls.filter((url) => url.includes("/dev"))).toEqual([]);
  });
});

describe("sitemap", () => {
  const entries = sitemap();

  test("every URL is absolute and on the canonical origin", () => {
    for (const entry of entries) {
      expect(entry.url.startsWith(SITE_ORIGIN)).toBe(true);
    }
  });

  test("every project has exactly one entry", () => {
    const urls = entries.map((entry) => entry.url);
    for (const slug of getProjectSlugs()) {
      const matching = urls.filter((url) => url.endsWith(`/projects/${slug}`));
      expect(matching).toHaveLength(1);
    }
  });

  test("no URL is listed twice", () => {
    const urls = entries.map((entry) => entry.url);
    expect(new Set(urls).size).toBe(urls.length);
  });

  test("the home page is listed", () => {
    expect(entries.some((entry) => entry.url === `${SITE_ORIGIN}/`)).toBe(true);
  });
});

describe("robots", () => {
  /**
   * `ALLOW_INDEXING` is unset in this process, which is the state every environment is in
   * except production after the Phase 6 flip. So this asserts the *blocked* branch — the
   * one that has to keep working while the site is promoted to production at every phase
   * boundary (§16.1). The opt-in branch is asserted by construction below.
   */
  test("crawling is disallowed while ALLOW_INDEXING is unset", () => {
    expect(process.env.ALLOW_INDEXING).not.toBe("true");
    const rules = robots().rules;
    expect(rules).toMatchObject({ userAgent: "*", disallow: "/" });
  });

  test("nothing is advertised in the blocked branch", () => {
    // No sitemap reference while blocked: pointing a crawler at a sitemap and then
    // disallowing everything in it is a mixed signal.
    expect(robots().sitemap).toBeUndefined();
  });
});
