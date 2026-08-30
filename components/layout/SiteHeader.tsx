import Link from "next/link";

import { Wordmark } from "@/components/brand/Wordmark";
import { MainNav, type NavItem } from "@/components/layout/MainNav";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Container } from "@/components/ui/Container";
import { VisuallyHidden } from "@/components/ui/VisuallyHidden";
import { WORDMARK_FIRST } from "@/lib/brand-marks";

type SiteHeaderProps = {
  nav: NavItem[];
  cta: NavItem;
  /** The full name. It is the home link's accessible name — see below. */
  siteName: string;
  /** `site.wordmark`. The typeset fallback when the drawn mark does not fit the name. */
  wordmark: string;
};

/**
 * §9.2: a server component that renders three client islands — `MainNav` (needs the
 * pathname), `MobileNavigation` (needs state), and `ThemeToggle`. The header's own
 * markup, the wordmark, and the CTA stay server-rendered.
 *
 * §7.2: sticky above `md`; below it the header scrolls away and the trigger goes with it.
 *
 * The home link used to set `site.wordmark` in mono. It now draws the "Mukerem." lockup,
 * and takes `siteName` as well because the two are not interchangeable as a link name:
 * neither "MS" nor a bare first name tells a screen-reader user where the link goes. The
 * mark is the picture; the name is the label, and it is the label either way below.
 *
 * The drawn mark spells one specific name, so — exactly as `Hero` does with the
 * signature — it only appears when that is the name in the content. Anything else falls
 * back to the typeset wordmark this link used to render, rather than greeting visitors
 * with somebody else's name.
 */
export function SiteHeader({ nav, cta, siteName, wordmark }: SiteHeaderProps) {
  return (
    <header className="bg-canvas md:sticky md:top-0 md:z-40">
      <Container>
        <div className="flex min-h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-none text-text"
          >
            {siteName === WORDMARK_FIRST.text ? (
              <>
                <Wordmark height={30} />
                <VisuallyHidden>{siteName}</VisuallyHidden>
              </>
            ) : (
              <span className="font-mono text-body font-medium tracking-[0.08em]">
                {wordmark}
              </span>
            )}
          </Link>

          <nav aria-label="Main" className="hidden md:block">
            <MainNav items={nav} />
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href={cta.href}
              className="hidden min-h-11 items-center justify-center rounded-none bg-brand-solid px-4 font-sans text-body-sm font-medium text-brand-contrast transition-colors duration-(--duration-fast) ease-standard hover:bg-brand-solid-hover md:inline-flex"
            >
              {cta.label}
            </Link>
            <MobileNavigation items={nav} cta={cta} />
          </div>
        </div>
      </Container>
    </header>
  );
}
