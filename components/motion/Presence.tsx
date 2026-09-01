"use client";

import { AnimatePresence } from "motion/react";
import type { ReactNode } from "react";

type PresenceProps = {
  children: ReactNode;
};

/**
 * The fourth wrapper in `components/motion/`, and it exists for the same reason the third
 * one does: §9.4 makes this directory the only place that imports `motion/react`, and
 * `AnimatePresence` had no wrapper. Without it `ProjectGrid` would have to import Motion
 * itself, and the moment one domain component does that the "islands" framing stops being
 * true. `LayoutItem` was added on 2026-08-18 on exactly this reasoning; this is that
 * precedent, not a second convention.
 *
 * **What it fixes.** §10.2's filter row was marked shipped and was two-thirds true.
 * `LayoutItem` gave the grid `layout` and a slug key, so cards that *survive* a filter
 * change glide to their new positions. But nothing was tracking the ones that leave: React
 * unmounted them on the spot and mounted the arrivals on the spot, so the surviving cards
 * slid gracefully around neighbours that popped in and out. That reads as a glitch rather
 * than as a filter — the animation was describing half a transition.
 *
 * `AnimatePresence` is what defers the unmount until the exit animation finishes, so
 * `LayoutItem`'s `exit` prop has somewhere to run.
 *
 * **No `mode` prop.** The default (`"sync"`) is correct here and the alternatives are
 * actively wrong: `"wait"` would hold every arriving card until the last departing one had
 * faded, turning a filter click into a two-step sequence, and `"popLayout"` takes exiting
 * children out of flow — which is what you want for a list that closes a gap, and not what
 * you want for a grid whose surviving cards are already animating into the gap themselves.
 *
 * **Reduced motion needs nothing here**, and that is worth stating because it is not
 * obvious: `MotionConfig reducedMotion="user"` drops transforms but keeps opacity, so
 * under reduced motion the exits still fade rather than snapping. That is §10.3's
 * intent — content still arrives and departs, it just does not move.
 *
 * Do not put anything else in here. Like `MotionProvider`, it exists to hold one thing.
 */
export function Presence({ children }: PresenceProps) {
  return <AnimatePresence>{children}</AnimatePresence>;
}
