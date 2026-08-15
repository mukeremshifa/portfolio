import type { ReactNode } from "react";

type VisuallyHiddenProps = {
  children: ReactNode;
  /**
   * When true, the content becomes visible once anything inside it takes focus.
   * That is the skip-link pattern: present in the DOM and in the accessibility tree
   * at all times, painted only when a keyboard user is actually on it.
   */
  focusable?: boolean;
};

export function VisuallyHidden({ children, focusable = false }: VisuallyHiddenProps) {
  return (
    <span className={focusable ? "sr-only focus-within:not-sr-only" : "sr-only"}>
      {children}
    </span>
  );
}
