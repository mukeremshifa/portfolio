"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

type CollapseProps = {
  /** Render the content, or collapse it away. */
  open: boolean;
  children: ReactNode;
};

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/**
 * Opens and closes a block by animating its height, so appearing content pushes what is
 * below it instead of teleporting into place.
 *
 * **This exists for the contact form's field errors**, which is the one place on the site
 * where content mounts *between* things the reader is looking at. A failed submit can add
 * three messages at once, and each one shoves every field below it down by a line the
 * instant it appears. That is layout jank on the only flow with a commercial outcome, and
 * height is the property that fixes it — a fade alone leaves the jump exactly as it was.
 *
 * **`height: auto` is animatable here only because Motion measures it.** CSS cannot
 * transition to `auto`; Motion reads the element's natural height and animates to that
 * number, which is why this is a Motion component rather than three lines of CSS.
 *
 * `overflow: hidden` is on the animating element and not on the child, so the text is
 * clipped by the box that is actually changing size. Without it the message renders at
 * full height inside a container that is still growing, and the animation reveals nothing.
 *
 * Durations are `fast`, not §10.2's decoupled entrance pair. An error message is feedback
 * on something the reader just did and is waiting on; the 800/1800 treatment is for
 * content arriving as they scroll, and applying it here would mean watching a validation
 * message drift for nearly two seconds before acting on it.
 */
export function Collapse({ open, children }: CollapseProps) {
  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          // `initial={false}` on the parent means a message present on first render is
          // not animated in — only ones that appear later. Nothing should animate because
          // the page loaded.
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{
            height: { duration: 0.12, ease: EASE_OUT },
            // Opacity trails the height slightly on the way in, so the text appears in a
            // box that already has room for it rather than fading in mid-expansion.
            opacity: { duration: 0.12, ease: EASE_OUT, delay: 0.04 },
          }}
          style={{ overflow: "hidden" }}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
