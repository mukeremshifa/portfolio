import type { Metadata } from "next";

import { getSite } from "@/lib/content";

/**
 * The canonical origin, derived exactly once (§13, §16.4).
 *
 * Production sets `NEXT_PUBLIC_SITE_URL` to the apex. Preview deployments leave it unset
 * on purpose so everything resolves against the deployment's own origin and a preview
 * never emits a production canonical, a production sitemap entry, or a production OG
 * URL. Every consumer — `metadataBase` in `app/layout.tsx`, `buildMetadata`,
 * `lib/structured-data.ts`, `app/sitemap.ts`, `app/robots.ts` — reads this constant
 * rather than repeating the fallback chain, because a second copy of it is how a preview
 * starts claiming to be production.
 */
export const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

/** Absolute URL for a repo-relative route or asset path. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_ORIGIN).toString();
}

/**
 * §13.3, amended: crawling is disallowed until the site is finished, and the flag opts
 * *in* rather than out. Phase 6 sets `ALLOW_INDEXING=true` in the Production
 * environment; until then every promotion to `main` is safe because the answer to "do
 * not index an unfinished portfolio" is this flag, not withholding the deploy.
 */
export const INDEXING_ALLOWED = process.env.ALLOW_INDEXING === "true";

type BuildMetadataInput = {
  title: string;
  description: string;
  /**
   * Route path with a leading slash and no trailing one, matching the form Next
   * actually serves. Resolved against `metadataBase`.
   */
  path: string;
  image?: string;
  type?: "website" | "article";
};

/**
 * §13.1. Produces the title, description, canonical, OpenGraph, and Twitter card for one
 * page.
 *
 * `alternates.canonical` and `openGraph.url` are left **relative**. Next resolves them
 * against the `metadataBase` set in `app/layout.tsx`, so this function never needs to
 * know the origin — which is the point, since re-deriving it here is how previews start
 * emitting production canonicals.
 *
 * `image` is deliberately not defaulted. When it is absent, the `opengraph-image` file
 * convention supplies the card (§13.4); setting an empty `images` array here would win
 * over the generated one and produce a page with no card at all.
 */
export function buildMetadata({
  title,
  description,
  path,
  image,
  type = "website",
}: BuildMetadataInput): Metadata {
  const site = getSite();

  // §13.1: "{title} — Mukerem Shifa", bare on the home page. The layout's title template
  // does this for `title`; OpenGraph and Twitter carry their own copies, so they are
  // composed here rather than relying on the template reaching them.
  const isHome = path === "/";
  const socialTitle = isHome ? title : `${title} — ${site.name}`;

  return {
    title: isHome ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      siteName: site.name,
      locale: "en_US",
      title: socialTitle,
      description,
      url: path,
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}
