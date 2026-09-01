"use client";

import { motion } from "motion/react";

type SplitTextProps = {
  children: string;
  /** Seconds before the first character starts. Used to stage one line after another. */
  delay?: number;
  /** Per-character step, in seconds. §10.1's `--step-char` is 26ms. */
  step?: number;
  className?: string;
  /** Rendered element. A heading passes its own level in. */
  as?: "span" | "h1" | "h2" | "p";
};

// §10.1's tokens in Motion's units.
const STEP_CHAR = 0.026;
const DURATION = 1.2;
const EASE_DRIFT = [0.2, 0.7, 0.2, 1] as const;

/**
 * The longest the whole sweep may take, in seconds, before the last character starts.
 *
 * A fixed per-character step does not survive a long string: this component's first use is
 * a 108-character role line, and 108 × 26ms is 2.8 seconds before the final glyph even
 * begins its 1.2s fade. The line reads as broken rather than as animated, because for the
 * first several seconds it is mostly invisible.
 *
 * So the step is the *smaller* of §10.1's value and whatever fits the budget. A short
 * heading gets the full 26ms and the intended texture; a long line compresses toward a
 * sweep. This is the one number that keeps the effect honest across content the owner
 * will edit without thinking about timing.
 */
const MAX_SWEEP = 0.9;

/**
 * §10.3's character split: a line of text that arrives one character at a time.
 *
 * **Opacity only. No per-character transform.** This is the single decision that separates
 * an elegant split from a gimmicky one, and it is what okc.media does — the characters
 * fade up in sequence while staying exactly where they belong. Sliding or scaling each
 * glyph individually reads as a text effect; fading them in sequence reads as the line
 * being written. The former is the thing people mean when they say an animation looks
 * cheap.
 *
 * Each character gets a long fade (1.2s) and a short step between neighbours (26ms), so
 * at any instant a dozen characters are mid-fade and the line resolves as a soft sweep
 * rather than as a row of individually blinking letters.
 *
 * **Accessibility.** The split text is `aria-hidden` and a visually-hidden copy of the
 * original string sits beside it, so assistive technology, search, and copy-paste all get
 * one clean string rather than a stream of single-character spans. This is the same
 * arrangement `Hero` already uses for the drawn signature.
 *
 * **Whitespace.** Spaces render as a non-breaking space inside their own span so the
 * browser cannot collapse them, and words are allowed to break normally because the spans
 * are `inline-block` only at the character level, not the word level. Long headings still
 * wrap.
 */
export function SplitText({
  children,
  delay = 0,
  step = STEP_CHAR,
  className,
  as: Component = "span",
}: SplitTextProps) {
  const characters = [...children];

  // See MAX_SWEEP. Never longer than the requested step, so short strings are unaffected.
  const effectiveStep =
    characters.length > 1 ? Math.min(step, MAX_SWEEP / (characters.length - 1)) : step;

  return (
    <Component className={className}>
      {/* The real string, for anything that reads rather than looks. */}
      <span className="sr-only">{children}</span>

      <span aria-hidden="true">
        {characters.map((character, index) => {
          if (character === " ") {
            // A bare space between two inline-blocks is collapsible and would let the
            // line lose its word gaps. It also needs no animation of its own.
            return <span key={index}>&nbsp;</span>;
          }

          return (
            <motion.span
              key={index}
              className="inline-block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: DURATION,
                ease: EASE_DRIFT,
                delay: delay + index * effectiveStep,
              }}
            >
              {character}
            </motion.span>
          );
        })}
      </span>
    </Component>
  );
}
