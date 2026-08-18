import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, test } from "vitest";

import {
  getAllProjects,
  getCertifications,
  getExperience,
  getFocus,
  getSite,
  getSkills,
} from "@/lib/content";

/**
 * §5.5's eight cross-file invariants.
 *
 * They live here rather than in `lib/content.ts`'s parse because they are quality
 * checks, not build gates. Invariant 5 is the clearest case: it reads the filesystem to
 * confirm every image exists, and during the phases where `public/placeholders/` is the
 * expected state a missing file should fail a test, not a deploy.
 *
 * Each test is written so that violating the thing it names makes it fail. An invariant
 * test that cannot fail is not a test.
 */

const CONTENT_DIR = join(process.cwd(), "content");
const PUBLIC_DIR = join(process.cwd(), "public");

const projects = getAllProjects();

describe("§5.5 cross-file invariants", () => {
  test("1 — project slugs are unique", () => {
    const slugs = projects.map((project) => project.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test("2 — every project filename equals its slug", () => {
    const filenames = readdirSync(join(CONTENT_DIR, "projects"))
      .filter((name) => name.endsWith(".json"))
      .map((name) => name.replace(/\.json$/, ""))
      .sort();

    expect(filenames).toEqual(projects.map((project) => project.slug).sort());
  });

  test("3 — between one and three projects are featured", () => {
    const featured = projects.filter((project) => project.featured);
    expect(featured.length).toBeGreaterThanOrEqual(1);
    expect(featured.length).toBeLessThanOrEqual(3);
  });

  test("4 — featuredCaseStudySlug resolves to a project with a caseStudy block", () => {
    const target = projects.find(
      (project) => project.slug === getSite().featuredCaseStudySlug,
    );
    expect(target, `no project named ${getSite().featuredCaseStudySlug}`).toBeDefined();
    expect(target?.caseStudy).toBeDefined();
  });

  test("5 — every cover and screenshot file exists on disk", () => {
    const missing = projects.flatMap((project) =>
      [project.cover, ...project.screenshots]
        .map((image) => image.src)
        .filter((src) => !existsSync(join(PUBLIC_DIR, src.replace(/^\//, "")))),
    );

    expect(missing).toEqual([]);
  });

  test("6 — there are exactly three focus pillars", () => {
    expect(getFocus()).toHaveLength(3);
  });

  test("7 — at most one entry per organization is still current", () => {
    const current = getExperience().filter((entry) => entry.end === null);
    const organizations = current.map((entry) => entry.organization);
    expect(new Set(organizations).size).toBe(organizations.length);
  });

  test("8 — every technology string appears in at least one skills group", () => {
    // `Certification.skills` is deliberately out of scope: those are competencies, not
    // technologies, and forcing them into skills.json would make the vocabulary the
    // invariant protects less precise, not more.
    const vocabulary = new Set(getSkills().flatMap((group) => group.items));
    const used = new Set([
      ...projects.flatMap((project) => project.technologies),
      ...getExperience().flatMap((entry) => entry.technologies),
      ...getFocus().flatMap((pillar) => pillar.technologies),
    ]);

    const undeclared = [...used].filter((technology) => !vocabulary.has(technology));
    expect(undeclared).toEqual([]);
  });
});

describe("Appendix B — the golden sample is actually the hard case", () => {
  const golden = projects.find((project) => project.slug === "placeholder-project");

  test("the sample exists", () => {
    expect(golden).toBeDefined();
  });

  test("it sits at the schema maxima the layout has to survive", () => {
    if (!golden) throw new Error("golden sample missing");

    expect(golden.title).toHaveLength(80);
    expect(golden.summary).toHaveLength(200);
    expect(golden.technologies).toHaveLength(12);
    expect(golden.codeSnippets).toHaveLength(4);
    expect(golden.screenshots).toHaveLength(6);
    expect(golden.lessons).toHaveLength(5);
    expect(golden.caseStudy).toBeDefined();
  });

  test("it carries one very long technology name", () => {
    if (!golden) throw new Error("golden sample missing");
    expect(Math.max(...golden.technologies.map((t) => t.length))).toBeGreaterThan(40);
  });

  test("its snippets span at least three languages", () => {
    if (!golden) throw new Error("golden sample missing");
    const languages = new Set(golden.codeSnippets.map((snippet) => snippet.language));
    expect(languages.size).toBeGreaterThanOrEqual(3);
  });

  test("one snippet has a line long enough to force horizontal scroll", () => {
    if (!golden) throw new Error("golden sample missing");
    const longest = Math.max(
      ...golden.codeSnippets.flatMap((snippet) =>
        snippet.code.split("\n").map((line) => line.length),
      ),
    );
    expect(longest).toBeGreaterThan(160);
  });

  test("its screenshots are six genuinely different aspect ratios", () => {
    if (!golden) throw new Error("golden sample missing");
    const ratios = new Set(
      golden.screenshots.map((shot) => (shot.width / shot.height).toFixed(3)),
    );
    expect(ratios.size).toBe(6);
  });

  test("exactly one optional link is missing", () => {
    if (!golden) throw new Error("golden sample missing");
    expect(golden.links.github).toBeDefined();
    expect(golden.links.live).toBeDefined();
    expect(golden.links.docs).toBeUndefined();
  });

  test("the supporting content sets exist", () => {
    expect(getCertifications().length).toBeGreaterThanOrEqual(1);
    expect(getExperience().length).toBeGreaterThanOrEqual(1);
    expect(getSkills().length).toBeGreaterThanOrEqual(1);
  });
});
