import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

// Production sets NEXT_PUBLIC_SITE_URL to the canonical apex. Preview deployments
// leave it unset on purpose (spec §16.4) so metadata resolves against the deployment's
// own origin rather than emitting production canonicals from a preview.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Mukerem Shifa",
  description:
    "Portfolio of Mukerem Shifa, AI Engineer and Full-Stack Developer. Under construction.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
