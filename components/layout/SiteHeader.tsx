import Link from "next/link";

import { MainNav, type NavItem } from "@/components/layout/MainNav";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Container } from "@/components/ui/Container";

type SiteHeaderProps = {
  nav: NavItem[];
  cta: NavItem;
  wordmark: string;
};

/**
 * §9.2: a server component that renders three client islands — `MainNav` (needs the
 * pathname), `MobileNavigation` (needs state), and `ThemeToggle`. The header's own
 * markup, the wordmark, and the CTA stay server-rendered.
 *
 * §7.2: sticky above `md`; below it the header scrolls away and the trigger goes with it.
 */
export function SiteHeader({ nav, cta, wordmark }: SiteHeaderProps) {
  return (
    <header className="bg-canvas md:sticky md:top-0 md:z-40">
      <Container>
        <div className="flex min-h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-none font-mono text-body font-medium tracking-[0.08em] text-text"
          >
            {wordmark}
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
