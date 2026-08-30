"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import type { NavItem } from "@/components/layout/MainNav";

type MobileNavigationProps = {
  items: NavItem[];
  cta: NavItem;
};

/**
 * §7.2 requires a focus trap, Escape to close, scroll lock, a visible close button, and
 * focus returned to the trigger. Four of those five are what a hand-rolled dialog gets
 * subtly wrong, so this is built on the native `<dialog>` element with `showModal()`,
 * which gives them from the platform:
 *
 * - focus trap: the top layer is modal, and everything behind it is inert
 * - Escape: fires `cancel`, which is intercepted below so the exit animation can run
 * - focus restoration: `close()` returns focus to whatever opened it, i.e. the trigger
 * - initial focus: the first focusable child, which is the close button
 *
 * That leaves scroll lock, which is the one thing `<dialog>` does not do, and it is done
 * explicitly below. The trigger lives in this component rather than in `SiteHeader`
 * precisely so the browser's focus restoration has the right element to return to.
 */
export function MobileNavigation({ items, cta }: MobileNavigationProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog && !dialog.open) dialog.showModal();
  }, [open]);

  // The one affordance `<dialog>` does not provide. Restores the previous value rather
  // than clearing it, so it composes with anything else that locks scroll.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-grid min-h-11 min-w-11 place-items-center rounded-none border border-border-strong text-text transition-colors duration-(--duration-fast) ease-standard hover:bg-surface-alt md:hidden"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          aria-hidden="true"
          className="size-5"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
        <span className="sr-only">Open navigation menu</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Site navigation"
        // Escape fires `cancel`. Preventing the default close lets the exit animation
        // run; `onExitComplete` does the real `close()`, which is what restores focus.
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onClose={close}
        className="m-0 ml-auto h-dvh max-h-none w-[min(20rem,85vw)] max-w-none bg-transparent p-0 backdrop:bg-black/50"
      >
        <AnimatePresence onExitComplete={() => dialogRef.current?.close()}>
          {open ? (
            <motion.div
              // §10.2: slides in from the right over `slow`. Under reduced motion,
              // `MotionConfig reducedMotion="user"` drops the transform, so the panel
              // simply appears — which is exactly what §10.3 asks for.
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.32, ease: [0.2, 0, 0, 1] }}
              className="flex h-full flex-col gap-6 border-l border-border-subtle bg-surface p-5 shadow-overlay"
            >
              <div className="flex items-center justify-between">
                <p className="font-mono text-eyebrow text-text-muted uppercase">Menu</p>
                <button
                  type="button"
                  onClick={close}
                  className="inline-grid min-h-11 min-w-11 place-items-center rounded-none border border-border-strong text-text transition-colors duration-(--duration-fast) ease-standard hover:bg-surface-alt"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.75}
                    strokeLinecap="round"
                    aria-hidden="true"
                    className="size-5"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                  <span className="sr-only">Close navigation menu</span>
                </button>
              </div>

              <nav aria-label="Main">
                <ul className="flex flex-col">
                  {items.map((item) => {
                    const active =
                      pathname === item.href || pathname.startsWith(`${item.href}/`);

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          // Closed on click rather than in an effect on `pathname`:
                          // same outcome, one render instead of a cascading one.
                          onClick={close}
                          aria-current={active ? "page" : undefined}
                          className={`flex min-h-11 items-center font-sans text-body font-medium transition-colors duration-(--duration-fast) ease-standard hover:text-brand ${
                            active ? "text-brand" : "text-text"
                          }`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <Link
                href={cta.href}
                onClick={close}
                className="mt-auto inline-flex min-h-11 items-center justify-center rounded-none bg-brand-solid px-4 py-3 font-sans text-body font-medium text-brand-contrast transition-colors duration-(--duration-fast) ease-standard hover:bg-brand-solid-hover"
              >
                {cta.label}
              </Link>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </dialog>
    </>
  );
}
