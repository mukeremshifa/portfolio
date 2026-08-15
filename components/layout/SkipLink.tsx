/**
 * §7.2 / §11.2: the first focusable element in the DOM, which is why `app/layout.tsx`
 * renders it above `<SiteHeader>` and not inside it. Hidden until focused, then painted
 * over the header rather than pushing it down, so tabbing into the page does not shift
 * the layout under the pointer.
 *
 * The target is `<main id="main" tabindex="-1">`, which the root layout owns.
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only rounded-md bg-surface font-sans text-body-sm font-medium text-text focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:inline-flex focus:min-h-11 focus:items-center focus:border focus:border-border-strong focus:px-4 focus:py-3"
    >
      Skip to main content
    </a>
  );
}
