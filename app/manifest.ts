import type { MetadataRoute } from "next";

import { getSite } from "@/lib/content";

/**
 * The web app manifest, and the third leg of the icon set alongside `app/favicon.ico`
 * and `app/icon.svg`.
 *
 * The site is not an app and does not want to be one — `display` is `browser`, so
 * installing it produces a bookmark that opens in a tab rather than a chrome-less
 * window that hides the URL bar of a site whose whole content is links.
 *
 * Colours are literals for the same reason `lib/og.ts` repeats them: a manifest is JSON
 * served to the OS, with no access to `globals.css`. `theme_color` is the emerald that
 * fills every icon tile, and `background_color` is the light `canvas` — the manifest has
 * no way to express "follows the user's theme", so both take the light values that the
 * icons themselves are drawn in.
 */
export default function manifest(): MetadataRoute.Manifest {
  const site = getSite();

  return {
    name: site.seo.title,
    short_name: site.name,
    description: site.seo.description,
    start_url: "/",
    display: "browser",
    background_color: "#f3ece2",
    theme_color: "#184e38",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      // Launchers crop maskable art to a shape of their choosing, so this one is the
      // single-letter mark inside a 28% safe margin. The two-letter monogram does not
      // survive a circular crop — see components/brand/Monogram.tsx.
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
