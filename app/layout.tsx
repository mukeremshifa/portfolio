import type { Metadata } from "next";
import { IBM_Plex_Mono, Instrument_Sans, Source_Serif_4 } from "next/font/google";
import type { ReactNode } from "react";

import type { NavItem } from "@/components/layout/MainNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SkipLink } from "@/components/layout/SkipLink";
import { ThemeScript } from "@/components/layout/ThemeScript";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { getSite } from "@/lib/content";
import { INDEXING_ALLOWED, SITE_ORIGIN } from "@/lib/metadata";
import "./globals.css";

// §6.6 / §12.3: three families, self-hosted at build, `display: swap`. Each declares
// only the weights the scale actually uses — serif 600 for display and section headings;
// sans 400 for body, 500 for UI chrome, 600 for headings; mono 400 for code and tags,
// 500 for the wordmark. Adding a weight to a component means adding it here too, which
// is the point: the cost of a new weight stays visible.
//
// Swapping a family is one line here: the CSS variable names are the only thing
// globals.css knows about.
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
  variable: "--font-source-serif",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-instrument-sans",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-ibm-plex-mono",
});

// The origin is derived once, in lib/metadata.ts, and consumed here. Production sets
// NEXT_PUBLIC_SITE_URL to the canonical apex; preview deployments leave it unset on
// purpose (§16.4) so metadata resolves against the deployment's own origin rather than
// emitting production canonicals from a preview.
const site = getSite();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  // §13.1: every page below this one gets "{title} — Mukerem Shifa". `default` is not
  // run through the template, so the home page shows the bare site title, and any page
  // needing the bare form asks for it with `title: { absolute }` (see `buildMetadata`).
  title: { default: site.seo.title, template: `%s — ${site.name}` },
  description: site.seo.description,
  // §13.3, amended, and the companion to app/robots.ts. robots.txt stops a crawl; this
  // is what stops a URL someone linked to from being indexed anyway. Phase 6 sets
  // ALLOW_INDEXING=true and both go away together.
  ...(INDEXING_ALLOWED ? {} : { robots: { index: false, follow: false } }),
};

// §7.1's route table. Structural, not content — the routes are fixed by the spec, and
// Phase 3 builds the pages behind them.
const NAV: NavItem[] = [
  { href: "/projects", label: "Projects" },
  { href: "/experience", label: "Experience" },
  { href: "/about", label: "About" },
  { href: "/certifications", label: "Certifications" },
];

const CTA: NavItem = { href: "/contact", label: "Let us talk →" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // `suppressHydrationWarning` is required, not incidental: the inline script below
    // adds a class, a data attribute, and an inline `color-scheme` before React sees the
    // document, and without it React would treat its own markup as authoritative and
    // undo them.
    <html
      lang="en"
      className={`${sourceSerif.variable} ${instrumentSans.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body>
        <MotionProvider>
          {/* §11.2: first focusable element in the DOM, above the header. */}
          <SkipLink />
          <SiteHeader nav={NAV} cta={CTA} wordmark={site.wordmark} />
          {/* §11.1: the layout owns the one <main> per page, so pages render sections
              and cannot accidentally produce a second one. `tabindex="-1"` makes it a
              focus target for the skip link without making it a tab stop. */}
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <SiteFooter site={site} nav={NAV} />
        </MotionProvider>
      </body>
    </html>
  );
}
