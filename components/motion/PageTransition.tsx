"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const EASE_DRIFT = [0.2, 0.7, 0.2, 1] as const;

/**
 * §10.3's route change, wrapping `<main>`'s children in `app/layout.tsx`.
 *
 * **This animates the arrival only, never the departure, and that is a deliberate
 * rejection of the obvious design.** The natural instinct is an exit animation: fade the
 * old page out, then fade the new one in. Every such implementation makes the site feel
 * slower than it is, because the exit runs *after* the click and before the navigation —
 * the reader has asked for a new page and is being shown an animation of the old one
 * leaving. §10's second clause forbids exactly that: motion must never make someone wait.
 *
 * So the outgoing page is simply gone, and the incoming one arrives. The perceived effect
 * is the same "the page changed" signal, at zero cost to responsiveness.
 *
 * **Keyed on `pathname`**, which is what makes React tear down the old subtree and mount a
 * fresh one, restarting the animation on every route change. Without the key this renders
 * once and never animates again.
 *
 * The numbers are shorter than a section entrance (§10.2's 800/1800 pair) — 500ms and
 * 700ms — because a route change already carries its own signal in the browser and the
 * content beneath is what the reader asked for. A full 1.8s drift on every navigation
 * would be theatre applied to the most frequent interaction on the site.
 *
 * Travel is 12px rather than §10.1's 32px, for the same reason: this fires often, and the
 * frequency budget for a repeated animation is much smaller than for a one-time entrance.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        opacity: { duration: 0.5, ease: EASE_DRIFT },
        y: { duration: 0.7, ease: EASE_DRIFT },
      }}
    >
      {children}
    </motion.div>
  );
}
