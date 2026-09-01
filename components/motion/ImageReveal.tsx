"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

import { usePrefersReducedMotion } from "@/components/motion/use-reduced-motion";

type ImageRevealProps = {
  children: ReactNode;
  delay?: number;
  /** Skip the scale, keeping only the blur and fade. For images already at their size. */
  still?: boolean;
  /**
   * Trigger on mount instead of on scroll. The hero portrait needs this: it is already in
   * the viewport at first paint, so a viewport trigger fires immediately and ignores the
   * `delay` that places it in the load sequence.
   */
  onMount?: boolean;
  /**
   * Classes for the wrapper. This component inserts a `div`, which takes the image's
   * place in a parent's flex or grid layout — so anything the image relied on there
   * (`shrink-0`, a column span) has to move onto the wrapper or it is silently lost.
   */
  className?: string;
};

const EASE_DRIFT = [0.2, 0.7, 0.2, 1] as const;

/**
 * §10.3's image entrance: an image resolves into focus rather than appearing.
 *
 * Three properties move together — opacity, a 4% scale-down, and a 12px blur — and like
 * every other entrance in this system they do not share a duration. The blur and opacity
 * clear in 900ms so the picture is legible quickly; the scale keeps settling for 1800ms,
 * so the frame is still easing to rest after the content in it has resolved. That is the
 * §10.2 principle applied to an image instead of a block of text.
 *
 * **`scale(1.04)` down to `1`, never up from below.** Scaling up from `0.96` shrinks the
 * image's edges away from the layout box it was given, which reads as the element being
 * inserted. Starting slightly oversized and settling *into* the box reads as focus being
 * found — the frame was always that size, the picture is arriving into it.
 *
 * `overflow-hidden` on the wrapper is load-bearing: without it the 4% overscale spills
 * past the border `Figure` draws and the image visibly exceeds its own frame for the
 * first second.
 *
 * This is used only where the site shows a real photograph or render — the portrait and
 * project covers. It is deliberately not applied to icons, brand marks, or anything
 * decorative, where a focus-pull is a lie about the content's importance.
 *
 * **Reduced motion needs explicit handling here**, unlike most of this directory.
 * `MotionConfig reducedMotion="user"` strips transforms, so the scale goes — but `filter`
 * is not a transform, and a 12px blur clearing over 900ms is precisely the kind of motion
 * the preference exists to switch off. `usePrefersReducedMotion` drops the blur too,
 * leaving a plain opacity fade: the image still arrives, it just does not resolve.
 */
export function ImageReveal({
  children,
  delay = 0,
  still = false,
  onMount = false,
  className,
}: ImageRevealProps) {
  const reduced = usePrefersReducedMotion();

  // Under reduced motion the blur is never applied, so there is nothing to clear. Setting
  // it to "blur(0px)" in both states would still hand Motion a filter animation to run.
  const settled = reduced
    ? { opacity: 1, scale: 1 }
    : { opacity: 1, scale: 1, filter: "blur(0px)" };

  return (
    <motion.div
      className={className ? `overflow-hidden ${className}` : "overflow-hidden"}
      initial={
        reduced
          ? { opacity: 0, scale: 1 }
          : { opacity: 0, scale: still ? 1 : 1.04, filter: "blur(12px)" }
      }
      {...(onMount
        ? { animate: settled }
        : { whileInView: settled, viewport: { once: true, amount: 0.2 } })}
      transition={{
        opacity: { duration: 0.9, ease: EASE_DRIFT, delay },
        filter: { duration: 0.9, ease: EASE_DRIFT, delay },
        scale: { duration: 1.8, ease: EASE_DRIFT, delay },
      }}
    >
      {children}
    </motion.div>
  );
}
