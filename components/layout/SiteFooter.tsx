import Link from "next/link";

import { Monogram } from "@/components/brand/Monogram";
import type { NavItem } from "@/components/layout/MainNav";
import { Container } from "@/components/ui/Container";
import { ExternalLink } from "@/components/ui/ExternalLink";
import type { Site } from "@/lib/schemas";

type SiteFooterProps = {
  site: Site;
  nav: NavItem[];
};

/**
 * §7.3. Location and availability come from `site.json` rather than the markup, so
 * neither can be overstated by whoever last edited a component — which is the whole
 * reason `content/site.json` was pulled forward into this phase (see DECISIONS.md).
 */
export function SiteFooter({ site, nav }: SiteFooterProps) {
  // Computed per render on the server. A hard-coded year is wrong for up to 12 months
  // and nobody notices until January.
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border-subtle">
      <Container>
        <div className="flex flex-col gap-8 py-12">
          <div className="flex flex-col gap-2">
            {/* The monogram seals the footer where the name used to be set in serif.
                Each mark gets exactly one job this way — "Mukerem." in the header, the
                full signature in the hero, the monogram here — so no page ever shows the
                same artwork twice, and on inner routes (which have no hero) this is the
                only place the drawn identity appears at all.

                `text-text-muted`, not `text-text`: it is a sign-off under the content,
                not a second masthead. The name itself is still set, one line down and in
                the copyright, so nothing is carried by the picture alone — which is why
                the mark takes no label. */}
            <Monogram height={52} className="mb-1 text-text-muted" />
            <p className="font-serif text-heading-1 font-semibold text-text">
              {site.name}
            </p>
            <p className="font-sans text-body text-text-muted">{site.role}</p>
            <p className="font-sans text-body-sm text-text-muted">
              Based in {site.location.label}
              {site.location.remote ? " · Available remotely" : ""}
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center font-sans text-body-sm text-text-muted transition-colors duration-(--duration-fast) ease-standard hover:text-brand hover:underline hover:underline-offset-[3px]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 font-sans text-body-sm">
            {site.socials.map((social) => (
              <li key={social.url}>
                <ExternalLink href={social.url}>{social.label}</ExternalLink>
              </li>
            ))}
            <li>
              <a
                href={`mailto:${site.email}`}
                className="text-brand underline decoration-1 underline-offset-[3px] transition-colors duration-(--duration-fast) ease-standard hover:text-brand-hover hover:decoration-2"
              >
                {site.email}
              </a>
            </li>
          </ul>

          <p className="font-sans text-body-sm text-text-muted">
            © {year} {site.name}. Built with Next.js.
          </p>
        </div>
      </Container>
    </footer>
  );
}
