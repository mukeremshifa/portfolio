import { describe, expect, test } from "vitest";

import {
  getAdjacentProjects,
  getAllProjects,
  getCategoryFilters,
  getEducation,
  getFeaturedProjects,
  getProjectBySlug,
  getProjectSlugs,
} from "@/lib/content";
import { CATEGORIES } from "@/lib/schemas";

/**
 * `lib/content.ts`'s own behaviour — the ordering, derivation and lookup it does on top
 * of loading, which is where a bug renders a plausible-looking wrong page rather than
 * throwing.
 *
 * Written 2026-09-04 against the current selectors. Zod covers the shape of each file at
 * module load; nothing below re-checks a field the schema already guarantees.
 */

describe("project ordering (§5.1)", () => {
  test("`order` ascending is the primary sort", () => {
    const orders = getAllProjects().map((project) => project.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  test("within one `order`, a current project sorts above a finished one", () => {
    // The tie-break maps `end: null` to "9999" so that unfinished work reads as current
    // rather than as having ended in year zero. Grouped by `order` because the tie-break
    // only applies within a group.
    const byOrder = new Map<number, ReturnType<typeof getAllProjects>>();
    for (const project of getAllProjects()) {
      byOrder.set(project.order, [...(byOrder.get(project.order) ?? []), project]);
    }
    for (const group of byOrder.values()) {
      const ends = group.map((project) => project.year.end ?? "9999");
      expect(ends).toEqual([...ends].sort().reverse());
    }
  });
});

describe("selectors", () => {
  test("getProjectSlugs matches getAllProjects, in order", () => {
    expect(getProjectSlugs()).toEqual(getAllProjects().map((project) => project.slug));
  });

  test("getProjectBySlug returns the right project for every slug", () => {
    for (const slug of getProjectSlugs()) {
      expect(getProjectBySlug(slug).slug).toBe(slug);
    }
  });

  test("getProjectBySlug throws rather than returning undefined", () => {
    // Routes guard with getProjectSlugs() and call notFound(). Reaching the loader with
    // an unknown slug means one was constructed rather than enumerated, which is a bug
    // and should be loud.
    expect(() => getProjectBySlug("no-such-project")).toThrow(/no-such-project/);
  });

  test("getFeaturedProjects returns only featured projects, capped at 3", () => {
    const featured = getFeaturedProjects();
    expect(featured.every((project) => project.featured)).toBe(true);
    expect(featured.length).toBeLessThanOrEqual(3);
  });

  test("getEducation is newest first", () => {
    const starts = getEducation().map((entry) => entry.start);
    expect(starts).toEqual([...starts].sort().reverse());
  });
});

describe("adjacency (§9.3)", () => {
  const slugs = getProjectSlugs();

  test("the first project has no prev, the last has no next", () => {
    expect(getAdjacentProjects(slugs[0]!).prev).toBeUndefined();
    expect(getAdjacentProjects(slugs[slugs.length - 1]!).next).toBeUndefined();
  });

  test("adjacency is symmetric across the whole list", () => {
    // If A's next is B, B's prev must be A. An asymmetry here strands a project: it is
    // reachable going one way through the set and not the other.
    for (let i = 0; i < slugs.length - 1; i++) {
      const here = slugs[i]!;
      const following = slugs[i + 1]!;
      expect(getAdjacentProjects(here).next?.slug).toBe(following);
      expect(getAdjacentProjects(following).prev?.slug).toBe(here);
    }
  });

  test("an unknown slug yields neither neighbour", () => {
    expect(getAdjacentProjects("no-such-project")).toEqual({});
  });
});

describe("category filters (§8.2)", () => {
  test("`All` comes first and counts every project", () => {
    const filters = getCategoryFilters(getAllProjects());
    expect(filters[0]?.value).toBe("all");
    expect(filters[0]?.count).toBe(getAllProjects().length);
  });

  test("every category is emitted, including empty ones", () => {
    // A filter that silently drops an empty category hides that a whole section of the
    // work is missing. A chip reading "Systems (0)" says it out loud.
    const filters = getCategoryFilters(getAllProjects());
    expect(filters.map((filter) => filter.value)).toEqual(["all", ...CATEGORIES]);
  });

  test("the per-category counts sum to the total", () => {
    const filters = getCategoryFilters(getAllProjects());
    const [all, ...categories] = filters;
    const summed = categories.reduce((total, filter) => total + filter.count, 0);
    expect(summed).toBe(all?.count);
  });

  test("it is pure — a constructed list is counted, not the loaded one", () => {
    const filters = getCategoryFilters([]);
    expect(filters[0]?.count).toBe(0);
    expect(filters.every((filter) => filter.count === 0)).toBe(true);
  });
});
