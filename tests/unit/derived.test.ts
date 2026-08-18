import { describe, expect, test } from "vitest";

import { getAdjacentProjects, getAllProjects, getCategoryFilters } from "@/lib/content";
import { CATEGORIES } from "@/lib/schemas";
import { formatMonth, formatMonthRange, formatYearRange } from "@/lib/utils";

/**
 * The derivations Phase 3 added, and the one Phase 2 could only test degenerately.
 *
 * Adjacency is the clearest case: with a single project, `getAdjacentProjects()` could
 * only ever be asked about an item that was simultaneously the first and the last, so the
 * middle of the list — the part with both a `prev` and a `next` — was untested until there
 * were six.
 */

describe("§8.2 category filters", () => {
  const projects = getAllProjects();
  const filters = getCategoryFilters(projects);

  test("every Category appears, so an empty category is visible rather than missing", () => {
    // The point of the assertion. A filter that quietly omits a category with no projects
    // hides the fact that a whole section of the work is absent; a chip reading
    // "Systems (0)" says so out loud.
    const values = filters.map((filter) => filter.value);
    for (const category of CATEGORIES) {
      expect(values, `no chip for ${category}`).toContain(category);
    }
    expect(filters).toHaveLength(CATEGORIES.length + 1);
  });

  test("'All' comes first and counts every project", () => {
    expect(filters[0]?.value).toBe("all");
    expect(filters[0]?.count).toBe(projects.length);
  });

  test("the category counts sum to the total", () => {
    const summed = filters
      .filter((filter) => filter.value !== "all")
      .reduce((total, filter) => total + filter.count, 0);
    expect(summed).toBe(projects.length);
  });

  test("each count matches a straight filter of the list", () => {
    for (const filter of filters) {
      if (filter.value === "all") continue;
      const actual = projects.filter((p) => p.category === filter.value).length;
      expect(filter.count, `${filter.value}`).toBe(actual);
    }
  });

  test("a category with no projects still produces a chip", () => {
    // Constructed rather than loaded: the real content has two projects per category, so
    // the zero case cannot be reached through `content/` without emptying it.
    const onlyAiMl = projects.filter((project) => project.category === "AI/ML");
    const derived = getCategoryFilters(onlyAiMl);
    expect(derived).toHaveLength(CATEGORIES.length + 1);
    expect(derived.find((filter) => filter.value === "Systems")?.count).toBe(0);
  });
});

describe("§8.3 adjacency, across a list long enough to have a middle", () => {
  const projects = getAllProjects();

  test("the list is long enough for this test to mean something", () => {
    expect(projects.length).toBeGreaterThanOrEqual(3);
  });

  test("a project in the middle has both neighbours, and they are the right ones", () => {
    const middleIndex = Math.floor(projects.length / 2);
    const middle = projects[middleIndex]!;
    const { prev, next } = getAdjacentProjects(middle.slug);

    expect(prev).toEqual({
      slug: projects[middleIndex - 1]!.slug,
      title: projects[middleIndex - 1]!.title,
    });
    expect(next).toEqual({
      slug: projects[middleIndex + 1]!.slug,
      title: projects[middleIndex + 1]!.title,
    });
  });

  test("walking next from the first reaches the last, visiting each project once", () => {
    const walked: string[] = [];
    let current = projects[0]!.slug;

    for (;;) {
      walked.push(current);
      const { next } = getAdjacentProjects(current);
      if (!next) break;
      current = next.slug;
      // A cycle would otherwise hang the suite rather than fail it.
      expect(walked).not.toContain(current);
    }

    expect(walked).toEqual(projects.map((project) => project.slug));
  });

  test("prev and next are inverses of each other", () => {
    for (const project of projects) {
      const { next } = getAdjacentProjects(project.slug);
      if (!next) continue;
      expect(getAdjacentProjects(next.slug).prev?.slug).toBe(project.slug);
    }
  });
});

describe("date formatting", () => {
  test("formatYearRange collapses a single year and says Present for an open one", () => {
    expect(formatYearRange("2024", "2024")).toBe("2024");
    expect(formatYearRange("2022", "2023")).toBe("2022 — 2023");
    expect(formatYearRange("2025", null)).toBe("2025 — Present");
  });

  test("formatMonth names the month without going near a timezone", () => {
    expect(formatMonth("2025-06")).toBe("Jun 2025");
    expect(formatMonth("2021-01")).toBe("Jan 2021");
    expect(formatMonth("2021-12")).toBe("Dec 2021");
  });

  test("formatMonthRange is the YYYY-MM sibling, with the same two special cases", () => {
    expect(formatMonthRange("2021-09", "2022-01")).toBe("Sep 2021 — Jan 2022");
    expect(formatMonthRange("2021-06", "2021-06")).toBe("Jun 2021");
    expect(formatMonthRange("2025-01", null)).toBe("Jan 2025 — Present");
  });

  test("a malformed month returns the raw value rather than 'undefined 2025'", () => {
    // Unreachable through `content/` — the schema rejects it — but a helper that renders
    // the word "undefined" into a page is worse than one that renders the input.
    expect(formatMonth("2025-13")).toBe("2025-13");
  });
});
