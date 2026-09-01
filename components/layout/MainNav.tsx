"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string };

/**
 * The desktop nav links, split out of `SiteHeader` as a client island so the header
 * itself stays a server component per §9.2. The only reason this needs the client is
 * `usePathname` — the active route cannot be known on the server for a statically
 * rendered page.
 *
 * §7.2: the active route carries `aria-current="page"` and uses the brand colour.
 */
export function MainNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <ul className="flex items-center gap-1">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              // `link-wipe link-wipe-inset` (globals.css) adds §10.3's underline that
              // travels in from the left, and keeps it drawn on the current page — so the
              // active indicator is the same mark the hover produces, at rest.
              className={`link-wipe link-wipe-inset inline-flex min-h-11 items-center rounded-none px-3 font-sans text-body transition-colors duration-(--duration-fast) ease-out hover:text-brand ${
                active ? "text-brand" : "text-text"
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
