"use client";

import { Children, useSyncExternalStore, type ReactNode } from "react";

import { Reveal } from "@/components/motion/Reveal";

type StaggerProps = {
  children: ReactNode;
  /** Milliseconds between children. §10.1's `--step-item` is 70. */
  step?: number;
  /**
   * The element each child is wrapped in. Not in §9.4's type, but `Reveal` already has
   * it and a stagger inside a `<ul>` has to produce `<li>`s or the list stays a list
   * (§11.1). Additive, and it mirrors the sibling component rather than inventing a
   * second convention.
   */
  as?: "div" | "section" | "li";
  /**
   * Items per row above `md`, for grids that should sequence by row rather than by child.
   *
   * At two or three columns a per-child offset makes the second card of a row land 70ms
   * after the first, which reads as the row assembling itself left to right — an
   * animation about the grid's internal ordering rather than about content arriving.
   * Giving a row one delay makes it land as a unit, which is how a reader parses a
   * multi-column grid anyway.
   *
   * Below `md` every grid in this codebase collapses to one column, and the hook below
   * follows it, so on a phone each card is its own row and this changes nothing.
   */
  perRow?: number;
};

// §10.1: 70ms between steps, capped at 6. Past the cap the last item would be waiting
// most of a second for no reason anyone can perceive as sequence. With `perRow` the cap
// counts rows, which is the same rule applied to the unit actually being sequenced.
const MAX_STEPS = 6;

// Tailwind's `md`. Every multi-column grid here is single-column below it, so one query
// covers the whole codebase; a grid that ever breaks somewhere else has to say so.
const MD = "(min-width: 48rem)";

/**
 * True once the viewport is at `md` or wider.
 *
 * `useSyncExternalStore` rather than `useState` plus an effect, because `matchMedia` *is*
 * an external store and this is the API for reading one: it subscribes, reads the current
 * value during render on the client, and takes a separate server snapshot — so there is
 * no effect writing state on mount, which is both a wasted render and the thing
 * `react-hooks/set-state-in-effect` correctly objects to.
 *
 * The server snapshot is `false`, matching the single-column layout below `md`. A wide
 * viewport therefore computes single-column delays for the server render and corrects on
 * hydration, before anything has scrolled into view.
 */
function useWideViewport(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(MD);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(MD).matches,
    () => false,
  );
}

export function Stagger({ children, step = 70, as = "div", perRow }: StaggerProps) {
  const wide = useWideViewport();

  // One column below `md`, so each child is its own row and `perRow` is inert there.
  const columns = perRow && wide ? perRow : 1;

  return (
    <>
      {Children.map(children, (child, index) => {
        const position = Math.floor(index / columns);

        return (
          <Reveal as={as} delay={(Math.min(position, MAX_STEPS - 1) * step) / 1000}>
            {child}
          </Reveal>
        );
      })}
    </>
  );
}
