import type { ReactNode } from "react";

import { VisuallyHidden } from "@/components/ui/VisuallyHidden";
import { cn } from "@/lib/utils";

type ExternalLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

/**
 * §7.4: the one way an external destination is linked. It always carries
 * `rel="noopener noreferrer"`, always opens in a new tab, and always announces that it
 * will — the visually hidden suffix is what stops the new tab from being a surprise for
 * anyone not watching the viewport.
 */
export function ExternalLink({ href, children, className }: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "text-brand underline decoration-1 underline-offset-[3px] transition-[text-decoration-thickness,color] duration-(--duration-fast) ease-standard hover:text-brand-hover hover:decoration-2",
        className,
      )}
    >
      {children}
      <VisuallyHidden> (opens in a new tab)</VisuallyHidden>
    </a>
  );
}
