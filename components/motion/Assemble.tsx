"use client";

import { motion } from "motion/react";
import { Children, createElement, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";

type AssembleProps = {
  children: ReactNode;
  /** Seconds before the first part moves. */
  delay?: number;
  /** Seconds between parts. */
  step?: number;
};

const EASE_DRIFT = [0.2, 0.7, 0.2, 1] as const;

/**
 * §10.3's card assembly: an element whose *parts* arrive in sequence rather than as a
 * finished block.
 *
 * `Stagger` sequences siblings in a list — several cards, one after another. This
 * sequences the pieces *within* one thing, so a card appears to build itself.
 *
 * **It adds no wrapper elements, and that is the design constraint that shapes it.**
 * Every other motion component here inserts a `div`, which is harmless around a section
 * and destructive inside a card: `ProjectCard` is `flex flex-col gap-5` and its featured
 * variant is `md:flex-row`, so a wrapper per child would apply the gap to wrappers rather
 * than content and collapse the row layout. Instead each child is re-created as its
 * `motion.*` equivalent — same tag, same props, same position in the flex flow — so the
 * animated element *is* the original element.
 *
 * Children that are components rather than plain tags (`<Figure />`, `<StatusBadge />`)
 * are passed through untouched, because a component cannot be promoted to a `motion`
 * element from outside. A card that gains such a child degrades to "that part does not
 * animate" rather than to a crash.
 *
 * **Where this is worth spending.** Assembly is the most elaborate motion in the system
 * and it earns its place only on the featured work: three cards, above the fold, seen once
 * per visit. The `/projects` grid — seven cards that also filter — would run seven
 * simultaneous assemblies on load and another on every filter click, which is the same
 * effect turned into noise.
 *
 * The step is 45ms against `Stagger`'s 70ms, and the travel 10px against 32px: these parts
 * sit inches apart inside one bordered box, and internals sliding as far as the card
 * itself look detached from it. The whole assembly finishes inside 500ms, so a fast
 * scroll shows a card rather than a construction sequence.
 */
export function Assemble({ children, delay = 0, step = 0.045 }: AssembleProps) {
  let index = 0;

  return (
    <>
      {Children.map(children, (child) => {
        if (!isValidElement(child) || typeof child.type !== "string") return child;

        const at = delay + index++ * step;
        const element = child as ReactElement<Record<string, unknown>>;

        return createElement(
          // `motion.div`, `motion.p`, `motion.ul` … chosen from the child's own tag, so
          // the rendered element keeps its semantics as well as its layout position.
          motion[child.type as "div"],
          {
            ...element.props,
            key: element.key,
            initial: { opacity: 0, y: 10 },
            whileInView: { opacity: 1, y: 0 },
            // One trigger per part rather than a parent orchestrator: the parts of a card
            // cross the viewport edge together, so the sequence comes from the delays and
            // the observer only decides when the group starts.
            viewport: { once: true, amount: 0.1 },
            transition: {
              opacity: { duration: 0.4, ease: EASE_DRIFT, delay: at },
              y: { duration: 0.75, ease: EASE_DRIFT, delay: at },
            },
          },
        );
      })}
    </>
  );
}
