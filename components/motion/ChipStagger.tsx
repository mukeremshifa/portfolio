"use client";

import { motion } from "motion/react";
import { Children } from "react";
import type { ReactNode } from "react";

type ChipStaggerProps = {
  children: ReactNode;
  /** Seconds between neighbours. Much finer than `Stagger`'s per-card step. */
  step?: number;
};

const EASE_DRIFT = [0.2, 0.7, 0.2, 1] as const;

// Seconds. The whole wave, from first chip to last, regardless of how many there are —
// so adding tools to the list changes the density of the wave and never its length.
const MAX_SWEEP = 0.75;

/**
 * A wave across many small items, for §10.3's technology chips.
 *
 * **Why not the shared `Stagger`.** That component caps its offset at six children, so a
 * card grid's seventh card does not sit waiting through a sequence nobody is counting.
 * That is right for six cards and wrong for twenty-two chips: the cap would stagger the
 * first six and drop the remaining sixteen in at once, which reads as a short sequence
 * followed by everything else falling over at the same instant.
 *
 * So this one never caps. Instead it holds the *total* duration fixed and divides it by
 * however many children there are, which is the same trick `SplitText` uses for a long
 * string. A wave that crosses the group in 750ms reads as one gesture no matter whether
 * the group holds eight chips or thirty.
 *
 * **The travel is smaller than a section entrance's** — 14px against §10.1's 32px — and
 * that is deliberate. These are small elements sitting a few pixels apart; a chip lifting
 * 32px would travel further than its own height and cross its neighbours' positions on
 * the way. Entrance distance should scale with the thing entering.
 *
 * Each child is wrapped in an `li`, because this renders inside a `<ul>` and a list whose
 * children are `div`s is not a list (§11.1).
 */
export function ChipStagger({ children, step }: ChipStaggerProps) {
  const items = Children.toArray(children);
  const count = items.length;

  // Fall back to an even spread across MAX_SWEEP unless a caller names a step.
  const effectiveStep = step ?? (count > 1 ? MAX_SWEEP / (count - 1) : 0);

  return (
    <>
      {items.map((child, index) => (
        <motion.li
          key={index}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          // One viewport trigger per chip. They are laid out in a wrapping row, so the
          // group crosses the threshold together and the delays below — not the observer
          // — are what produce the sequence.
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            opacity: {
              duration: 0.5,
              ease: EASE_DRIFT,
              delay: index * effectiveStep,
            },
            y: {
              duration: 1.1,
              ease: EASE_DRIFT,
              delay: index * effectiveStep,
            },
          }}
        >
          {child}
        </motion.li>
      ))}
    </>
  );
}
