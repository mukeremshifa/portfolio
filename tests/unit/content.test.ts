import { describe, expect, test } from "vitest";
import { z } from "zod";

import {
  getAdjacentProjects,
  getAllProjects,
  getFeaturedCaseStudy,
  getFeaturedProjects,
  getProjectBySlug,
  getProjectSlugs,
} from "@/lib/content";
import { ProjectSchema, SiteSchema } from "@/lib/schemas";

/**
 * `lib/content.ts`'s own behaviour: the selectors in §5.1, and the shape of the error
 * the gate produces. The gate matters as much as the schema — a validation failure that
 * prints a stack trace is a failure someone has to decode before they can fix it.
 */

describe("selectors", () => {
  test("getAllProjects sorts by order, then by year descending", () => {
    const projects = getAllProjects();
    for (let i = 1; i < projects.length; i += 1) {
      const previous = projects[i - 1]!;
      const current = projects[i]!;
      expect(previous.order).toBeLessThanOrEqual(current.order);
      if (previous.order === current.order) {
        // Years are compared as strings; an unfinished project sorts as the most recent.
        expect((previous.year.end ?? "9999") >= (current.year.end ?? "9999")).toBe(true);
      }
    }
  });

  test("getFeaturedProjects returns only featured projects, capped at three", () => {
    const featured = getFeaturedProjects();
    expect(featured.length).toBeLessThanOrEqual(3);
    expect(featured.every((project) => project.featured)).toBe(true);
  });

  test("getProjectSlugs matches the loaded projects", () => {
    expect(getProjectSlugs()).toEqual(getAllProjects().map((project) => project.slug));
  });

  test("getProjectBySlug returns the project, and throws on a slug that is not one", () => {
    const [first] = getAllProjects();
    expect(first).toBeDefined();
    expect(getProjectBySlug(first!.slug)).toBe(first);
    expect(() => getProjectBySlug("not-a-project")).toThrow(/not-a-project/);
  });

  test("getFeaturedCaseStudy resolves and carries a caseStudy block", () => {
    expect(getFeaturedCaseStudy().caseStudy).toBeDefined();
  });

  test("getAdjacentProjects walks the ordered list and stops at both ends", () => {
    const projects = getAllProjects();
    const first = projects[0]!;
    const last = projects[projects.length - 1]!;

    expect(getAdjacentProjects(first.slug).prev).toBeUndefined();
    expect(getAdjacentProjects(last.slug).next).toBeUndefined();
    expect(getAdjacentProjects("not-a-project")).toEqual({});

    if (projects.length > 1) {
      const second = projects[1]!;
      expect(getAdjacentProjects(first.slug).next).toEqual({
        slug: second.slug,
        title: second.title,
      });
      expect(getAdjacentProjects(second.slug).prev).toEqual({
        slug: first.slug,
        title: first.title,
      });
    }
  });
});

describe("the gate is readable", () => {
  // The loader turns a ZodError into `z.prettifyError` output before it throws. This is
  // that transform, not a re-test of Zod: the assertion is that a person reading CI
  // output can see which field is wrong and why, without opening lib/schemas.ts.
  test("a missing required field names the field, not a stack frame", () => {
    const broken = { ...getAllProjects()[0] } as Record<string, unknown>;
    delete broken.title;

    const result = ProjectSchema.safeParse(broken);
    expect(result.success).toBe(false);
    if (result.success) return;

    const message = z.prettifyError(result.error);
    expect(message).toContain("title");
    expect(message).not.toContain("at Object.");
  });

  test("an over-length field says so in words", () => {
    const broken = { ...getAllProjects()[0], title: "x".repeat(81) };

    const result = ProjectSchema.safeParse(broken);
    expect(result.success).toBe(false);
    if (result.success) return;

    const message = z.prettifyError(result.error);
    expect(message).toMatch(/Too big/i);
    expect(message).toContain("title");
  });

  test("site.json's own shape is enforced, not assumed", () => {
    const result = SiteSchema.safeParse({ name: "Only a name" });
    expect(result.success).toBe(false);
  });
});
