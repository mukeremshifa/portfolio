import { describe, expect, test } from "vitest";

import { cn, formatMonth, formatMonthRange, formatYearRange } from "@/lib/utils";

/**
 * The pure formatters in `lib/utils.ts`. Small surface, but two of them encode decisions
 * that are easy to "simplify" back into bugs, so both are pinned here.
 */

describe("cn", () => {
  test("drops falsy values rather than rendering them", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  test("an all-falsy call yields an empty string, not ' '", () => {
    expect(cn(false, null, undefined)).toBe("");
  });
});

describe("formatYearRange (§8.3)", () => {
  test("an open range reads as Present", () => {
    expect(formatYearRange("2024", null)).toBe("2024 — Present");
  });

  test("a single-year project renders the year once", () => {
    // Not "2023 — 2023". The range collapses because a project that started and finished
    // in one year did not span anything.
    expect(formatYearRange("2023", "2023")).toBe("2023");
  });

  test("a closed multi-year range renders both ends", () => {
    expect(formatYearRange("2022", "2024")).toBe("2022 — 2024");
  });
});

describe("formatMonth", () => {
  test("`YYYY-MM` renders as `Mon YYYY`", () => {
    expect(formatMonth("2025-06")).toBe("Jun 2025");
  });

  test("January and December are not off by one", () => {
    // The lookup is zero-indexed against a one-indexed month; these are the two ends
    // where an off-by-one shows up as a wrong year rather than a wrong month.
    expect(formatMonth("2025-01")).toBe("Jan 2025");
    expect(formatMonth("2025-12")).toBe("Dec 2025");
  });

  test("no timezone can shift the month", () => {
    /**
     * The reason this function is a lookup rather than `Intl` and a `Date`:
     * `new Date("2021-09")` parses as UTC midnight and formats in the runtime's zone, so
     * anywhere west of Greenwich it renders as August. A date that is a label rather than
     * an instant must never go near a timezone.
     *
     * Running the assertion under an explicit western TZ is what makes this a regression
     * test rather than a restatement of the line above.
     */
    const original = process.env.TZ;
    try {
      process.env.TZ = "America/Los_Angeles";
      expect(formatMonth("2021-09")).toBe("Sep 2021");
      process.env.TZ = "Pacific/Kiritimati";
      expect(formatMonth("2021-09")).toBe("Sep 2021");
    } finally {
      process.env.TZ = original;
    }
  });
});

describe("formatMonthRange", () => {
  test("an open range reads as Present", () => {
    expect(formatMonthRange("2024-01", null)).toContain("Present");
  });

  test("a closed range names both months", () => {
    const rendered = formatMonthRange("2022-03", "2023-07");
    expect(rendered).toContain("Mar 2022");
    expect(rendered).toContain("Jul 2023");
  });
});
