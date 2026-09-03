import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, test } from "vitest";

import {
  getAllProjects,
  getExperience,
  getFocus,
  getSkills,
  getCertifications,
  getEducation,
} from "@/lib/content";

/**
 * §5.5's cross-file invariants — the rules no single schema can enforce, because each
 * one spans two files that Zod validates independently.
 *
 * Rewritten 2026-09-04 against the current content architecture. The previous suite was
 * deleted by `b4d5d05` and is recoverable at `b4d5d05^`, but restoring it verbatim would
 * reintroduce assertions about fields that no longer exist: projects lost `codeSnippets`
 * and `screenshots` on 2026-08-30, and education split out of the timeline on 2026-08-31.
 * The numbering below follows §5.5's table, including its retired #4, so the invariant
 * numbers still mean what other documents say they mean.
 *
 * These are quality checks, not build gates (§5.5, §16.2). A failure here should be
 * visible, not blocking.
 */

const PROJECTS_DIR = join(process.cwd(), "content/projects");
const PUBLIC_DIR = join(process.cwd(), "public");

describe("§5.5 cross-file invariants", () => {
  test("1 — project slugs are unique", () => {
    const slugs = getAllProjects().map((project) => project.slug);
    const duplicated = slugs.filter((slug, i) => slugs.indexOf(slug) !== i);
    expect(duplicated).toEqual([]);
  });

  test("2 — every project's filename equals its slug", () => {
    // Read the directory rather than the loader: the loader derives nothing from the
    // filename, so a mismatch is invisible to it and shows up only as a 404 on a route
    // someone built by hand from the file tree.
    const filenames = readdirSync(PROJECTS_DIR)
      .filter((name) => name.endsWith(".json"))
      .map((name) => name.replace(/\.json$/, ""))
      .sort();
    const slugs = getAllProjects()
      .map((project) => project.slug)
      .sort();
    expect(filenames).toEqual(slugs);
  });

  test("3 — between 1 and 3 projects are featured", () => {
    const featured = getAllProjects().filter((project) => project.featured);
    expect(featured.length).toBeGreaterThanOrEqual(1);
    expect(featured.length).toBeLessThanOrEqual(3);
  });

  // 4 — retired 2026-08-31 with `site.featuredCaseStudySlug` and the home section that
  // rendered it. Deliberately not renumbered; see §5.5.

  test("5 — every cover image referenced by a project exists on disk", () => {
    // `screenshots[]` is gone from ProjectSchema (2026-08-30) and v1 ships without any
    // (DECISIONS.md, 2026-09-04), so covers are the whole of this invariant now. Both
    // halves of a light/dark pair are checked: a missing `srcDark` is invisible until
    // someone loads the site in the other theme.
    const missing = getAllProjects().flatMap((project) => {
      if (!project.cover) return [];
      const paths = [project.cover.src, project.cover.srcDark].filter(
        (src): src is string => typeof src === "string",
      );
      return paths
        .filter((src) => !existsSync(join(PUBLIC_DIR, src)))
        .map((src) => `${project.slug}: ${src}`);
    });
    expect(missing).toEqual([]);
  });

  test("6 — there are exactly 3 focus pillars", () => {
    expect(getFocus()).toHaveLength(3);
  });

  test("7 — at most one current role per organisation", () => {
    // Two entries with `end: null` at one organisation render as two simultaneous
    // "Present" roles. Across different organisations that is legitimate.
    const currentByOrg = new Map<string, number>();
    for (const entry of getExperience()) {
      if (entry.end !== null) continue;
      currentByOrg.set(
        entry.organization,
        (currentByOrg.get(entry.organization) ?? 0) + 1,
      );
    }
    const offenders = [...currentByOrg.entries()]
      .filter(([, count]) => count > 1)
      .map(([org, count]) => `${org}: ${count} current roles`);
    expect(offenders).toEqual([]);
  });

  test("8 — every project technology appears in a skills group", () => {
    // Closes one way only in this test: nothing in a project may be missing from a
    // group. The reverse direction is a separate assertion below, because the two fail
    // for different reasons and a combined test would not say which.
    const known = new Set(getSkills().flatMap((group) => group.items));
    const orphans = getAllProjects().flatMap((project) =>
      project.technologies
        .filter((technology) => !known.has(technology))
        .map((technology) => `${project.slug}: ${technology}`),
    );
    expect(orphans).toEqual([]);
  });

  /**
   * The reverse of 8, and currently **failing on four entries** — which is why it is
   * `.fails` rather than deleted or quietly relaxed.
   *
   * §5.5 claims invariant 8 "closes both ways: nothing in a project is missing from a
   * group, nothing in a group is unused." The forward half holds. The reverse does not:
   * `SQL`, `Framer Motion`, `nginx` and `WordPress` sit in groups no project's
   * `technologies` array names. That is a claim the site makes about its author that
   * nothing on the site demonstrates — the exact vocabulary drift the invariant exists
   * to catch.
   *
   * It is an owner decision, not a mechanical one: each of the four is either a real
   * skill whose project should list it (WordPress belongs to the AmtecLinks engagement,
   * whose `technologies` name only SEO activities and no platform), or a claim to drop.
   * `.fails` keeps the assertion executing and green while the discrepancy stands, and
   * turns red the moment someone resolves it — so the test cannot be forgotten in either
   * direction. Flip it to a plain `test` once the four are settled.
   *
   * See DECISIONS.md, 2026-09-04.
   */
  test.fails("8 (reverse) — every skills entry is used by at least one project", () => {
    const used = new Set(getAllProjects().flatMap((project) => project.technologies));
    const unused = getSkills().flatMap((group) =>
      group.items
        .filter((item) => !used.has(item))
        .map((item) => `${group.title}: ${item}`),
    );
    expect(unused).toEqual([]);
  });

  test("9 — no qualification is filed as experience", () => {
    // Enforced by ExperienceSchema rejecting `type: "education"` since 2026-08-31. This
    // asserts the outcome rather than the mechanism, so replacing the mechanism does not
    // silently drop the guarantee.
    const types = new Set(getExperience().map((entry) => entry.type));
    expect(types.has("education" as never)).toBe(false);
    expect(getEducation().length).toBeGreaterThan(0);
  });
});

describe("content loads and validates", () => {
  test("every collection parses and is non-empty", () => {
    // `lib/content.ts` validates at module load, so an invalid file throws on import
    // rather than failing here. These assertions catch the other failure: a collection
    // that parsed fine because it is an empty array.
    expect(getAllProjects().length).toBeGreaterThan(0);
    expect(getSkills().length).toBeGreaterThan(0);
    expect(getCertifications().length).toBeGreaterThan(0);
    expect(getExperience().length).toBeGreaterThan(0);
    expect(getEducation().length).toBeGreaterThan(0);
  });
});
