import type { MetadataRoute } from "next";

import { getAllProjects } from "@/lib/content";
import { absoluteUrl } from "@/lib/metadata";

/**
 * §13.3. Absolute URLs on the canonical origin, one entry per real route.
 *
 * **`/dev/*` is excluded, deliberately.** `/dev/primitives` is `noindex, nofollow`, and
 * metadata keeps a route out of the index rather than out of the sitemap — listing it
 * here would advertise a development surface and then ask crawlers to ignore it. The
 * Phase 6 hardening pass re-verifies both halves; if either is ever in doubt, the route
 * gets deleted instead.
 *
 * Only routes that exist are listed, which is why this list was one entry long through
 * Phase 2: a sitemap that promises a 404 is worse than a short sitemap. Phase 3 built the
 * other five, so they join it here.
 *
 * No trailing slashes. `trailingSlash: true` was tried in Phase 2 and reverted, and every
 * href, canonical, and entry in the repo uses the bare form as a result.
 */
const STATIC_ROUTES = [
  "/",
  "/projects",
  "/experience",
  "/about",
  "/skills",
  "/contact",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: absoluteUrl(route),
      lastModified,
      changeFrequency: "monthly" as const,
      // Only the home page is a 1. Priority is a hint about relative importance within
      // one site, so giving six routes the same top value says nothing at all.
      priority: route === "/" ? 1 : 0.9,
    })),
    ...getAllProjects().map((project) => ({
      url: absoluteUrl(`/projects/${project.slug}`),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
