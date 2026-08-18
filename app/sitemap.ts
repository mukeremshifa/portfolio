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
 * Only routes that exist are listed. `/projects/`, `/experience/`, `/about/`,
 * `/certifications/`, and `/contact/` join `STATIC_ROUTES` in Phases 3 and 4 as those
 * pages land — a sitemap that promises a 404 is worse than a short sitemap.
 */
const STATIC_ROUTES = ["/"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: absoluteUrl(route),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 1,
    })),
    ...getAllProjects().map((project) => ({
      url: absoluteUrl(`/projects/${project.slug}`),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
