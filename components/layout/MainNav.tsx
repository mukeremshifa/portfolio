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
 * §7.2: the active route carries `aria-current="page"` *and* a 2px underline. The
 * underline is the non-colour cue; the colour change alone would fail §11.4.
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
              className={`inline-flex min-h-11 items-center rounded-md px-3 font-sans text-body-sm transition-colors duration-(--duration-fast) ease-standard hover:text-brand ${
                active
                  ? "border-b-2 border-brand text-text"
                  : "border-b-2 border-transparent text-text-muted"
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
