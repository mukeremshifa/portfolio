import Link from "next/link";

import { Monogram } from "@/components/brand/Monogram";
import type { NavItem } from "@/components/layout/MainNav";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { Container } from "@/components/ui/Container";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { VisuallyHidden } from "@/components/ui/VisuallyHidden";
import type { Site } from "@/lib/schemas";

type SiteFooterProps = {
  site: Site;
  nav: NavItem[];
};

/**
 * Every link in the three columns, whatever its destination. One string so a route link,
 * an external profile, and the `mailto:` cannot drift into three treatments of the same
 * row. `min-h-11` is §11's 44px touch target, which is also what gives the columns their
 * line rhythm.
 */
const COLUMN_LINK =
  "inline-flex min-h-11 items-center font-sans text-body-sm text-text-muted transition-colors duration-(--duration-fast) ease-standard hover:text-brand";

/**
 * §7.3, laid out as four blocks: identity, handles, three link columns, copyright.
 *
 * The place comes from `site.json` rather than from the markup, so it cannot be
 * overstated by whoever last edited a component — which is the whole reason
 * `content/site.json` was pulled forward into this phase (see DECISIONS.md). The role
 * line reads `site.roleShort` for the same reason, rather than being typed here. Nothing
 * in this footer claims a working arrangement any more: `location.remote` fed a
 * "· Available remotely" clause the one-sentence place line has no room for, and the
 * field was deleted rather than left unread.
 *
 * **The columns split the nav in half rather than naming two fixed sets.** Six routes
 * give Home/About/Projects and Experience/Skills/Contact, which is what the layout asks
 * for; a seventh route lands in the second column instead of silently creating a fourth
 * one that would collide with the links column.
 *
 * **The third column is §7.3's "GitHub · LinkedIn · Email", built from `site.socials`.**
 * It is a column of links rather than the brand-blue row it used to be, because beside
 * two columns of muted route links a blue underlined "GitHub" reads as a different kind
 * of thing than it is. The personal accounts are `site.handles`, they are separate keys
 * and the schema says why, and they sit in the baseline row as marks alone.
 */
export function SiteFooter({ site, nav }: SiteFooterProps) {
  // Computed per render on the server. A hard-coded year is wrong for up to 12 months
  // and nobody notices until January.
  const year = new Date().getFullYear();

  const half = Math.ceil(nav.length / 2);
  const navColumns = [nav.slice(0, half), nav.slice(half)];

  return (
    <footer className="mt-24 border-t border-border-subtle">
      <Container>
        <div className="py-12 md:py-16">
          <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between md:gap-16">
            <div className="flex flex-col gap-2 md:max-w-sm">
              {/* The monogram seals the footer where the name used to be set in serif.
                  Each mark gets exactly one job this way — "Mukerem." in the header, the
                  full signature in the hero, the monogram here — so no page ever shows
                  the same artwork twice, and on inner routes (which have no hero) this is
                  the only place the drawn identity appears at all.

                  `text-text-muted`, not `text-text`: it is a sign-off under the content,
                  not a second masthead. The name itself is still set, one line down and
                  in the copyright, so nothing is carried by the picture alone — which is
                  why the mark takes no label. */}
              <Monogram height={52} className="mb-1 text-text-muted" />
              <p className="font-serif text-heading-1 font-semibold text-text">
                {site.name}
              </p>
              {/* Two lines by instruction, not by luck: the break is explicit, so the
                  role and the place stay on their own lines at every width the column
                  takes rather than at whatever point the measure happens to run out. */}
              <p className="font-sans text-body-sm text-text-muted">
                {site.roleShort}
                <br />
                based in {site.location.label}
              </p>
            </div>

            <nav
              aria-label="Footer"
              className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 md:gap-x-16 lg:gap-x-24"
            >
              {navColumns.map((column) => (
                <ul key={column[0]?.href}>
                  {column.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className={COLUMN_LINK}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ))}

              <ul>
                {site.socials.map((social) => (
                  <li key={social.url}>
                    <ExternalLink
                      href={social.url}
                      tone="inherit"
                      className={COLUMN_LINK}
                    >
                      {social.label}
                    </ExternalLink>
                  </li>
                ))}
                <li>
                  {/* Not `ExternalLink`: a `mailto:` does not open a tab, so the
                      "(opens in a new tab)" suffix that component always adds would be a
                      lie. Labelled "Email" rather than spelled out, because the address
                      is long enough to set this column's width on its own. */}
                  <a href={`mailto:${site.email}`} className={COLUMN_LINK}>
                    Email
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          {/* The rule, and the one row under it. The copyright and the marks sit at
              opposite ends of the same baseline rather than in two stacked blocks, which
              is what keeps the footer's last line reading as a single sign-off.

              It wraps rather than switching layout at a breakpoint: four 18px marks and
              one short sentence fit side by side well below `sm`, and on the narrowest
              screens `flex-wrap` drops the marks to their own line without a media query
              deciding in advance where that happens. */}
          <div className="mt-16 flex flex-wrap items-center justify-between gap-x-8 gap-y-6 border-t border-border-subtle pt-8">
            <p className="font-sans text-body-sm text-text-muted">
              © {year} {site.name}. Built with Next.js.
            </p>

            {site.handles.length > 0 ? (
              <ul className="flex items-center gap-5">
                {site.handles.map((handle) => (
                  <li key={handle.url}>
                    <ExternalLink
                      href={handle.url}
                      tone="inherit"
                      className="inline-flex text-text-muted hover:text-brand"
                    >
                      {/* Mark only, so the accessible name is the whole label — and it
                          names the account, not just the platform, because three of the
                          four handles are the same word and "X" alone would not tell
                          anyone which account they are about to open. §7.4: never an icon
                          without a name. */}
                      <BrandIcon name={handle.platform} size={18} />
                      <VisuallyHidden>
                        {handle.label}, {handle.handle}
                      </VisuallyHidden>
                    </ExternalLink>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </Container>
    </footer>
  );
}
