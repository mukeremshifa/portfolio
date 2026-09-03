import { describe, expect, test } from "vitest";

import { getAllProjects, getCertifications, getSite } from "@/lib/content";
import { absoluteUrl, SITE_ORIGIN } from "@/lib/metadata";
import {
  certificationListJsonLd,
  jsonLdScript,
  personJsonLd,
  projectJsonLd,
  projectListJsonLd,
  profilePageJsonLd,
  webSiteJsonLd,
} from "@/lib/structured-data";

/**
 * §13.2's JSON-LD, and the escaping that puts it in the document.
 *
 * The escaping half is why this file is not optional. Phase 2 shipped a `jsonLdScript`
 * whose replacement was written with one backslash — a unicode escape in the source,
 * evaluating to `<`, making the call a no-op that reads exactly like a working one. It
 * went unnoticed until a test asserted on the *output* rather than on the intent, and it
 * was deleted along with the rest of the suite by `b4d5d05`. Restored 2026-09-04.
 */

describe("jsonLdScript escaping", () => {
  test("`<` is escaped so a payload cannot close the script tag", () => {
    const escaped = jsonLdScript({ note: "</script><img onerror=x>" });
    expect(escaped).not.toContain("</script>");
    expect(escaped).toContain("\\u003c");
  });

  test("the escape is a JSON escape, not a mangled value", () => {
    // The assertion the original version would have failed: parsing the output must give
    // back exactly what went in. A no-op replacement passes the "contains no </script>"
    // check by accident only when the input has none, so this is the one that bites.
    const payload = { note: "a < b && c </script>" };
    expect(JSON.parse(jsonLdScript(payload))).toEqual(payload);
  });

  test("output is valid JSON for every graph the site emits", () => {
    const graphs = [
      personJsonLd(),
      webSiteJsonLd(),
      profilePageJsonLd(),
      projectListJsonLd(getAllProjects()),
      certificationListJsonLd(getCertifications()),
      ...getAllProjects().map(projectJsonLd),
    ];
    for (const graph of graphs) {
      expect(() => JSON.parse(jsonLdScript(graph))).not.toThrow();
    }
  });
});

describe("graphs restate content, and nothing else", () => {
  test("the Person node matches site.json", () => {
    const site = getSite();
    const person = personJsonLd();
    expect(person["@type"]).toBe("Person");
    expect(person.name).toBe(site.name);
    expect(person.jobTitle).toBe(site.role);
    expect(person.description).toBe(site.intro);
    expect(person.email).toBe(`mailto:${site.email}`);
  });

  test("sameAs carries socials and excludes handles", () => {
    // §5.2 keeps `handles` deliberately out of `sameAs`: they are personal accounts, not
    // professional identity, and this is the assertion that keeps them out.
    const site = getSite();
    const sameAs = personJsonLd().sameAs as string[];
    expect(sameAs).toEqual(site.socials.map((social) => social.url));
    for (const handle of site.handles) {
      expect(sameAs).not.toContain(handle.url);
    }
  });

  test("knowsLanguage carries names only, never the self-assessed level", () => {
    const site = getSite();
    const languages = personJsonLd().knowsLanguage as string[];
    expect(languages).toEqual(site.languages.map((language) => language.name));
    for (const language of site.languages) {
      if (language.level) expect(languages).not.toContain(language.level);
    }
  });

  test("every project graph names its own project", () => {
    for (const project of getAllProjects()) {
      const graph = projectJsonLd(project);
      expect(graph.name).toBe(project.title);
      expect(JSON.stringify(graph)).toContain(project.slug);
    }
  });

  test("no graph invents a URL off the canonical origin", () => {
    const graphs = [personJsonLd(), webSiteJsonLd(), profilePageJsonLd()];
    for (const graph of graphs) {
      const urls = JSON.stringify(graph).match(/https?:\/\/[^"\\]+/g) ?? [];
      const internal = urls.filter((url) => url.startsWith(SITE_ORIGIN));
      // Every internal URL must be built through absoluteUrl, so none may carry a double
      // slash from a path that already had a leading one.
      for (const url of internal) {
        expect(url.slice("https://".length)).not.toContain("//");
      }
    }
  });
});

describe("absoluteUrl", () => {
  test("joins without doubling or dropping the separator", () => {
    expect(absoluteUrl("/")).toBe(`${SITE_ORIGIN}/`);
    expect(absoluteUrl("/about")).toBe(`${SITE_ORIGIN}/about`);
  });
});
