import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Spec §12.2: no build-time image pipeline for now. Everything routes through
  // <Figure>, so turning Vercel's optimizer back on later is a one-line change.
  images: { unoptimized: true },
  /**
   * `/certifications` became `/skills` on 2026-08-31, when the page grew the focus pillars
   * and the tool groups and finally matched the label the nav had always given it.
   *
   * Permanent (308) rather than temporary: the rename is settled, and a 301/308 is what
   * moves any accumulated ranking to the new URL instead of splitting it. The route was
   * live and linked from the home page, so dropping it without this is a 404 for every
   * link already pointing at it — including the résumé, which this repo cannot edit.
   */
  async redirects() {
    return [{ source: "/certifications", destination: "/skills", permanent: true }];
  },
};

export default nextConfig;
