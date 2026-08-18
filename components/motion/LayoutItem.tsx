"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

type LayoutItemProps = {
  children: ReactNode;
  as?: "div" | "li";
};

/**
 * §10.2's "Project filter → Motion `layout` → cards reposition over `base`".
 *
 * The third wrapper in `components/motion/`, and it exists because §9.4 makes this
 * directory **the only** place that imports `motion/react`. Neither `Reveal` nor
 * `Stagger` exposes `layout`, so `ProjectGrid` would have had to import Motion itself,
 * and the moment one domain component does that the "islands" framing stops being true.
 * Phase 1 already paid to keep that honest once.
 *
 * §10's binding test first, because an animation that fails it does not ship: remove the
 * repositioning and filtering becomes a grid whose contents are replaced in place, with
 * nothing to tell the reader which cards survived the filter from which cards are new.
 * That is the case where movement carries information rather than decorates it, and it is
 * genuinely unlike the nav underline Phase 1 replaced with CSS — that one described a
 * navigation the user had already completed.
 *
 * `ease-standard` rather than `ease-out`: this is a reposition, not an entrance. The
 * numbers are §10.1's tokens transcribed into Motion's units, since Motion cannot read a
 * CSS custom property for a transition.
 *
 * Reduced motion needs nothing here. `MotionConfig reducedMotion="user"` in
 * `MotionProvider` drops transform animations, and a `layout` animation is a transform,
 * so filtered cards jump rather than glide — which is exactly what §10.3 asks for.
 */
export function LayoutItem({ children, as = "div" }: LayoutItemProps) {
  const Component = motion[as];

  return (
    <Component layout transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}>
      {children}
    </Component>
  );
}
