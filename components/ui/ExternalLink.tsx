import type { ReactNode } from "react";

import { VisuallyHidden } from "@/components/ui/VisuallyHidden";
import { cn } from "@/lib/utils";

type ExternalLinkProps = {
  href: string;
  children: ReactNode;
  /**
   * `link` is the default and the one §7.4 describes: brand colour, underlined, thicker
   * on hover. `inherit` renders the anchor with no colour or decoration of its own, for
   * the places where the link is one item in a list that already sets both — the footer's
   * nav columns, where a brand-blue underlined "GitHub" beside a muted "Projects" would
   * be two treatments for the same kind of thing.
   *
   * A variant rather than a `className` override, because `cn` is a joiner and not
   * `tailwind-merge` (see `lib/utils.ts`): passing `text-text-muted` alongside the base
   * `text-brand` leaves the winner to stylesheet order, which is not something a caller
   * can reason about. Callers still get `className` for everything that does not conflict.
   */
  tone?: "link" | "inherit";
  className?: string;
};

const tones = {
  link: "text-brand underline decoration-1 underline-offset-[3px] transition-[text-decoration-thickness,color] duration-(--duration-fast) ease-standard hover:text-brand-hover hover:decoration-2",
  inherit: "transition-colors duration-(--duration-fast) ease-standard",
} as const;

/**
 * §7.4: the one way an external destination is linked. It always carries
 * `rel="noopener noreferrer"`, always opens in a new tab, and always announces that it
 * will — the visually hidden suffix is what stops the new tab from being a surprise for
 * anyone not watching the viewport.
 */
export function ExternalLink({
  href,
  children,
  tone = "link",
  className,
}: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(tones[tone], className)}
    >
      {children}
      <VisuallyHidden> (opens in a new tab)</VisuallyHidden>
    </a>
  );
}
