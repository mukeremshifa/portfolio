import { describe, expect, test } from "vitest";

import { getCertifications, getSite } from "@/lib/content";
import {
  certificationListJsonLd,
  jsonLdScript,
  personJsonLd,
} from "@/lib/structured-data";

/**
 * §13.2's graphs, and one rule in particular.
 *
 * Structured data is a machine-readable assertion, so the interesting tests are the ones
 * about what it refuses to claim: a credential nobody can verify, and an address for a
 * location that was never set.
 */

describe("§13.2 — the certification list excludes unverifiable credentials", () => {
  const certifications = getCertifications();

  test("the content set actually contains one without a credentialUrl", () => {
    // Without this the filter test below would pass against a list that never exercises
    // it, which is the way this kind of test rots.
    const unverifiable = certifications.filter((c) => c.credentialUrl === undefined);
    expect(unverifiable.length).toBeGreaterThanOrEqual(1);
  });

  test("only credentials with a verifiable URL reach the graph", () => {
    const graph = certificationListJsonLd(certifications) as {
      numberOfItems: number;
      itemListElement: { item: { name: string; url?: string } }[];
    };

    const verifiable = certifications.filter((c) => c.credentialUrl !== undefined);
    expect(graph.numberOfItems).toBe(verifiable.length);
    expect(graph.itemListElement).toHaveLength(verifiable.length);

    for (const entry of graph.itemListElement) {
      expect(entry.item.url, `${entry.item.name} has no url`).toBeDefined();
    }

    const names = graph.itemListElement.map((entry) => entry.item.name);
    for (const certification of certifications) {
      if (certification.credentialUrl) continue;
      expect(names, "an unverifiable credential reached the graph").not.toContain(
        certification.title,
      );
    }
  });

  test("an empty list produces an empty graph rather than throwing", () => {
    const graph = certificationListJsonLd([]) as { numberOfItems: number };
    expect(graph.numberOfItems).toBe(0);
  });
});

describe("§13.2 — the Person", () => {
  test("address appears only when location is set", () => {
    const graph = personJsonLd() as { address?: { addressLocality: string } };
    const site = getSite();

    if (site.location.label) {
      expect(graph.address?.addressLocality).toBe(site.location.label);
    } else {
      expect(graph.address).toBeUndefined();
    }
  });

  test("sameAs carries every social, and nothing else", () => {
    const graph = personJsonLd() as { sameAs: string[] };
    expect(graph.sameAs).toEqual(getSite().socials.map((social) => social.url));
  });
});

describe("jsonLdScript escapes the one character that matters", () => {
  test("a stray closing tag in authored content cannot end the script element", () => {
    const serialised = jsonLdScript({ note: "</script><img src=x onerror=alert(1)>" });
    expect(serialised).not.toContain("</script>");
    expect(serialised).toContain("\\u003c");
    // Still valid JSON: the escape is a JSON string escape, not a mangling of the value.
    expect(JSON.parse(serialised)).toEqual({
      note: "</script><img src=x onerror=alert(1)>",
    });
  });
});
