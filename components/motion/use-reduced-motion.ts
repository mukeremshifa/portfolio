"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Whether the viewer has asked for reduced motion.
 *
 * **Why this exists when `MotionConfig reducedMotion="user"` is already mounted.** That
 * setting strips *transform* animations — `x`, `y`, `scale`, `rotate` — and keeps
 * everything else, which is the right default and covers most of this codebase. It does
 * not touch `filter` or `mask-position`, so `ImageReveal`'s 12px blur and
 * `SignatureReveal`'s 2.2-second wipe both ran at full length for someone who had
 * explicitly asked for less motion. A blur resolving over most of a second is exactly the
 * kind of thing the preference exists to switch off.
 *
 * Components that animate those properties read this and drop them by hand. Anything
 * animating only opacity and transform needs nothing — `MotionConfig` still handles it.
 *
 * `useSyncExternalStore` rather than `useState` plus an effect, because a media query is
 * an external store: it subscribes, reads during render on the client, and takes a
 * separate server snapshot. The server snapshot is `false` — the animated path — because
 * assuming reduced motion on the server would send every visitor the stripped version and
 * then animate on hydration, which is worse for both audiences.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(QUERY);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
