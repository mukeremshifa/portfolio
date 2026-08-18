import { describe, expect, test } from "vitest";

import { getAllProjects, getSite } from "@/lib/content";

/**
 * The machine-checkable half of `docs/STUB-INVENTORY.md`.
 *
 * Phase 3 writes stubs that are structurally realistic on purpose, which means they are
 * hard to spot by eye — the v1.0 approach of grepping for the word "placeholder" stopped
 * working the moment a stub email started looking like an email. What a machine can still
 * check is the asset half: every image the site renders is still a placeholder file.
 *
 * When a real asset lands this fails, and that failure is the reminder that the inventory
 * needs updating. It is an assertion about the current state, not a gate on ever adding a
 * real image: the fix is to update the content and the inventory together, and to delete
 * the rows here as the last real asset arrives (§5.6, Phase 5's exit criterion).
 */

const PLACEHOLDER_PREFIX = "/placeholders/";

describe("§5.6 — every asset in content/ is still a placeholder", () => {
  test("project covers and screenshots", () => {
    const real = getAllProjects().flatMap((project) =>
      [project.cover, ...project.screenshots]
        .map((image) => image.src)
        .filter((src) => !src.startsWith(PLACEHOLDER_PREFIX))
        .map((src) => `${project.slug}: ${src}`),
    );

    expect(real, "real assets have landed — update docs/STUB-INVENTORY.md").toEqual([]);
  });

  test("the portrait, when the field is present", () => {
    const portrait = getSite().portrait;
    // Absence is a supported state (§8.1: the hero collapses to one column), so this
    // asserts on the src only when there is one.
    if (!portrait) return;
    expect(portrait.src.startsWith(PLACEHOLDER_PREFIX)).toBe(true);
  });

  test("the résumé, when the field is present", () => {
    const resume = getSite().resume;
    if (!resume) return;
    expect(resume.url.startsWith(PLACEHOLDER_PREFIX)).toBe(true);
  });
});
