import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { VisuallyHidden } from "@/components/ui/VisuallyHidden";
import { cn } from "@/lib/utils";

type ButtonProps = {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
  href?: string;
  external?: boolean;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"button">, "children">;

// §6.8. The 44x44 minimum hit area is on the base, not the size, so `sm` shrinks what
// you see without shrinking what you can hit (§11.5).
const base =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-none font-sans font-medium transition-[background-color,border-color,color,transform] duration-(--duration-fast) ease-standard active:scale-[0.98]";

const variants = {
  primary: "bg-brand-solid text-brand-contrast hover:bg-brand-solid-hover",
  secondary: "border border-border-strong bg-transparent text-text hover:bg-surface-alt",
  ghost: "bg-transparent text-brand hover:bg-surface-alt hover:text-brand-hover",
} as const;

const sizes = {
  sm: "px-3 py-2 text-body-sm",
  md: "px-4 py-3 text-body",
} as const;

/**
 * Renders `<button>`, `<Link>`, or `<a>` depending on props — never a `<div>` (§9.1).
 * `href` makes it a link because it navigates; no `href` makes it a button because it
 * acts. A div would take neither the keyboard behaviour nor the role for free.
 */
export function Button({
  variant = "primary",
  size = "md",
  href,
  external = false,
  className,
  children,
  type,
  ...rest
}: ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if (href) {
    // The contract types the spread as button props; on the link branches the shared
    // attributes (id, aria-*, data-*, onClick) are the ones that actually apply.
    const linkProps = rest as unknown as ComponentPropsWithoutRef<"a">;

    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
          {...linkProps}
        >
          {children}
          <VisuallyHidden> (opens in a new tab)</VisuallyHidden>
        </a>
      );
    }

    return (
      <Link href={href} className={classes} {...linkProps}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type ?? "button"} className={classes} {...rest}>
      {children}
    </button>
  );
}
