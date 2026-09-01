"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

// §10.1's curve, transcribed for Motion.
const EASE_DRIFT = [0.2, 0.7, 0.2, 1] as const;

type LayoutItemProps = {
  children: ReactNode;
  as?: "div" | "li";
  /**
   * Fade the item in as it mounts and out as it unmounts, on top of the repositioning
   * this component has always done. Off by default, because the enter and exit halves
   * only actually run inside a `Presence` — outside one, `exit` is silently ignored and
   * `initial` would animate a card that nothing is filtering. Opt in where both are true.
   */
  animatePresence?: boolean;
  /**
   * Seconds to delay this item's *first* appearance, so a filtered grid can still stagger
   * itself into view on page load.
   *
   * It applies to the mount only. Motion re-reads `transition` on every animation, so a
   * delay left in place would also postpone every later filter click by the same amount —
   * the sixth card would lag 350ms behind the first on every interaction, which is an
   * entrance's pacing applied to a response. The component drops it after the first run.
   */
  enterDelay?: number;
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
 * `ease-drift` and §10.1's decoupled pair, scaled down. This component was written under
 * the v2 spec and kept `ease-out` at 120/200ms through the v3 rewrite, which made the
 * filter the one interaction on the site speaking a different motion language — the owner
 * reported it as "odd to what's used elsewhere" and that was exactly right. The numbers
 * are §10.1's tokens transcribed into Motion's units, since Motion cannot read a CSS
 * custom property for a transition.
 *
 * Reduced motion needs nothing here. `MotionConfig reducedMotion="user"` in
 * `MotionProvider` drops transform animations, and a `layout` animation is a transform,
 * so filtered cards jump rather than glide — which is exactly what §10.3 asks for.
 */
export function LayoutItem({
  children,
  as = "div",
  animatePresence = false,
  enterDelay = 0,
}: LayoutItemProps) {
  const Component = motion[as];

  const presence = animatePresence
    ? {
        // A small rise, not a pure fade. Under v2 this was opacity alone, and it was the
        // only motion on the site with no travel in it — every other entrance moves, so
        // a card that simply brightened into place read as a different system's
        // animation stitched into this one. 10px, because a filtered card only has to
        // register as *new* rather than as arriving from off-screen; the surrounding
        // cards are simultaneously repositioning and a longer trip would cross them.
        initial: { opacity: 0, y: 10 },
        // The stagger delay rides on the *enter* variant rather than on the shared
        // `transition` below. That is what confines it to the mount: `animate` carries
        // its own transition here, so the delay applies as the card appears and never to
        // the repositions a later filter click triggers. Putting it on the shared
        // transition would make the sixth card lag a third of a second behind the first
        // on every single click.
        animate: {
          opacity: 1,
          y: 0,
          transition: {
            opacity: { duration: 0.26, ease: EASE_DRIFT, delay: enterDelay },
            y: { duration: 0.42, ease: EASE_DRIFT, delay: enterDelay },
          },
        },
        exit: { opacity: 0, y: -6 },
      }
    : {};

  return (
    <Component
      layout
      {...presence}
      transition={{
        // §10.1's curve and durations, which this component missed when §10 was rewritten
        // — it kept `ease-out` at 120/200ms while the rest of the site moved to
        // `ease-drift` and the decoupled pair, and that mismatch is most of why the
        // filter felt foreign. Scaled down from a section entrance because a filter click
        // is a repeated interaction rather than a one-time arrival: 260ms of opacity
        // against 420ms of movement, not 800/1800.
        duration: 0.42,
        ease: EASE_DRIFT,
        opacity: { duration: 0.26, ease: EASE_DRIFT },
      }}
    >
      {children}
    </Component>
  );
}
