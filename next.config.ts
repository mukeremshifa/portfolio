import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Spec §12.2: no build-time image pipeline for now. Everything routes through
  // <Figure>, so turning Vercel's optimizer back on later is a one-line change.
  images: { unoptimized: true },
};

export default nextConfig;
