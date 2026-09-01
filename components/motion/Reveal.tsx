"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Seconds. `Stagger` uses this to offset siblings; callers rarely set it directly. */
  delay?: number;
  as?: "div" | "section" | "li";
  /**
   * How far the element travels, in pixels. Defaults to §10.1's `--reveal-distance`.
   * Lower it for something already near its final position; there is rarely a reason to
   * raise it.
   */
  distance?: number;
};

// §10.1's tokens, transcribed into Motion's units. Motion cannot read a CSS custom
// property for a transition, so when globals.css changes these change with it.
const DURATION_REVEAL = 0.8;
const DURATION_DRIFT = 1.8;
const EASE_DRIFT = [0.2, 0.7, 0.2, 1] as const;
const DISTANCE = 32;

/**
 * §10.2's decoupled entrance, and the component the whole motion system is built on.
 *
 * **The two halves run at different durations, and that is the entire point.** Opacity
 * resolves over 800ms, so the content is readable quickly and nobody is made to wait for
 * a paragraph. The transform keeps resolving for 1800ms, so the element is still settling
 * into place long after it became legible. That gap — between "I can read this" and "this
 * has finished arriving" — is the difference between motion that reads as cheap and motion
 * that reads as considered, and it is the thing v2's 200ms-for-both version was missing.
 *
 * Do not "fix" this by matching the two durations. Matching them is what it used to do.
 *
 * The curve is `--ease-drift`, not `--ease-out`: it covers most of its distance early and
 * spends the remainder settling, which is why 1.8s does not feel slow. `--ease-out`
 * overshoots harder and lands sooner — right for a hover, wrong for an arrival.
 *
 * Under `prefers-reduced-motion`, `MotionConfig reducedMotion="user"` in `MotionProvider`
 * drops the transform and keeps the opacity, so content still arrives without travelling
 * (§10.4).
 */
export function Reveal({
  children,
  delay = 0,
  as = "div",
  distance = DISTANCE,
}: RevealProps) {
  const Component = motion[as];

  return (
    <Component
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      // `once` because content that re-animates on scroll-up is motion competing with
      // someone who is already reading it (§10.3). `amount: 0.15` fires a little before
      // the rail's own observer band claims the section, so the content finishes arriving
      // and *then* the marker moves, rather than the gutter twitching as the column
      // travels.
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        opacity: { duration: DURATION_REVEAL, ease: EASE_DRIFT, delay },
        y: { duration: DURATION_DRIFT, ease: EASE_DRIFT, delay },
      }}
    >
      {children}
    </Component>
  );
}
