"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

type FadeProps = {
  children: ReactNode;
  /** Seconds from mount. */
  delay?: number;
  /** Travel distance in px. `0` for a pure fade. */
  distance?: number;
  as?: "div" | "span";
};

const EASE_DRIFT = [0.2, 0.7, 0.2, 1] as const;

/**
 * A decoupled entrance that fires **on mount** rather than on scroll.
 *
 * This is `Reveal`'s sibling, and the difference is only the trigger: `Reveal` waits for
 * the element to enter the viewport, `Fade` runs as soon as it renders. Anything in a
 * page-load sequence (§10.3) needs the latter — the hero is already in view, so a
 * viewport trigger would fire everything simultaneously and the staging would be lost.
 *
 * The durations are the same decoupled pair as §10.2, scaled down: 600ms of opacity
 * against 1200ms of travel. Shorter than a section entrance because the things using this
 * are usually part of a sequence where several elements are mid-animation at once, and the
 * full 1800ms drift across four staged items keeps the hero moving for far too long.
 */
export function Fade({
  children,
  delay = 0,
  distance = 16,
  as = "div",
}: FadeProps) {
  const Component = motion[as];

  return (
    <Component
      initial={{ opacity: 0, y: distance }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        opacity: { duration: 0.6, ease: EASE_DRIFT, delay },
        y: { duration: 1.2, ease: EASE_DRIFT, delay },
      }}
    >
      {children}
    </Component>
  );
}
