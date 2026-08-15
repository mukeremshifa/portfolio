"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Seconds. `Stagger` uses this to offset siblings; callers rarely set it directly. */
  delay?: number;
  as?: "div" | "section" | "li";
};

/**
 * §10.2 section entrance: opacity 0 to 1 and translateY(12px) to 0, over `base` with
 * `ease-out`. The numbers are §10.1's tokens transcribed into Motion's units (seconds,
 * and the easing as its four control points) because Motion cannot read CSS custom
 * properties for a transition.
 *
 * Under `prefers-reduced-motion`, `MotionConfig reducedMotion="user"` drops the
 * transform and keeps the opacity, so content still arrives — it just does not move.
 */
export function Reveal({ children, delay = 0, as = "div" }: RevealProps) {
  const Component = motion[as];

  return (
    <Component
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </Component>
  );
}
