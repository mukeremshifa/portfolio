import type { MetadataRoute } from "next";

import { absoluteUrl, INDEXING_ALLOWED } from "@/lib/metadata";

/**
 * §13.3, as amended. Crawling is disallowed until the site is finished, and the flag
 * opts *in*: `ALLOW_INDEXING` is unset everywhere until the Phase 6 hardening pass sets
 * it to `true` in Vercel's Production environment.
 *
 * This is what makes §16.1's promotion cadence safe. `dev` reaches `main` at every phase
 * boundary so canonical URLs, the sitemap, and OG image URLs are exercised on the
 * production origin — the only place their real values ever resolve — without an
 * unfinished portfolio full of placeholder copy being indexed. The answer to "do not
 * index this yet" is this file, not withholding the deploy.
 *
 * The matching `noindex` meta tag is in `app/layout.tsx` and reads the same flag.
 * `robots.txt` stops a crawl; only the meta tag stops a URL discovered elsewhere from
 * being indexed anyway, and "unfinished" is a claim about the page, not about the path.
 */
export default function robots(): MetadataRoute.Robots {
  if (!INDEXING_ALLOWED) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/", disallow: "/dev/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
