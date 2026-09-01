"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

import { usePrefersReducedMotion } from "@/components/motion/use-reduced-motion";

type SignatureRevealProps = {
  children: ReactNode;
  /** Seconds before the wipe starts. */
  delay?: number;
};

/**
 * §10.3's hero signature reveal: the drawn name appears left to right, as if being
 * written.
 *
 * **Why a mask wipe and not a stroke draw.** The obvious technique for a signature is
 * `stroke-dasharray` / `stroke-dashoffset`, and it does not work here: `SIGNATURE.paths`
 * are *filled outlines*, not strokes. Animating a dash offset would trace the boundary
 * around each letterform rather than the letterform itself, which looks like a wire
 * diagram of the name being assembled. A gradient mask sweeping across the artwork gives
 * the effect the drawing actually wants, and it works on filled paths of any complexity.
 *
 * The mask is a linear gradient with a soft edge: the transition band is 12% wide rather
 * than a hard stop, so the ink appears to bleed into existence at the pen tip instead of
 * being uncovered by a moving rectangle. The whole thing is driven by animating
 * `mask-position` from right to left across a mask sized at 300% — which is what puts the
 * gradient's opaque tail behind the sweep.
 *
 * Duration is deliberately the longest single animation on the site (2.2s). It is the
 * first thing a visitor sees, it is the one moment the page is allowed to be theatrical,
 * and the content it reveals is a name rather than something anyone needs to act on.
 *
 * **Reduced motion is handled explicitly**, because `MotionConfig reducedMotion="user"`
 * cannot help here: it strips transforms, and this is a mask. Left alone it would run the
 * longest animation on the site — 2.2 seconds — for someone who asked for less motion. The
 * reduced path renders the drawing unwrapped and fully visible, with no mask at all, which
 * is the honest version of "no animation" for an effect that has no gentler setting.
 */
export function SignatureReveal({ children, delay = 0 }: SignatureRevealProps) {
  const reduced = usePrefersReducedMotion();

  // Not a zero-duration wipe: a mask that is applied at all can clip a glyph's antialiased
  // edge, so the drawing is better off never being masked than being masked instantly.
  if (reduced) return <>{children}</>;

  return (
    <motion.div
      // `initial` is the fully-masked state and `animate` the fully-revealed one. Both
      // sides declare every mask property, because animating `mask-position` alone
      // against an unset `mask-image` silently does nothing.
      // Only the standard `maskPosition` is animated. Motion's types do not carry the
      // vendor-prefixed key, and every browser that supports `mask-image` on an inline SVG
      // wrapper also supports the unprefixed property — the `-webkit-` fallbacks below are
      // in `style` for older Safari, where they resolve to the initial position and the
      // signature simply appears rather than wiping.
      initial={{ maskPosition: "100% 0" }}
      animate={{ maskPosition: "0% 0" }}
      transition={{ duration: 2.2, ease: [0.2, 0.7, 0.2, 1], delay }}
      style={{
        // 300% wide: one third is the soft gradient edge that does the revealing, and the
        // remaining two thirds is the opaque tail that keeps the already-revealed ink
        // visible as the sweep continues past it.
        WebkitMaskImage:
          "linear-gradient(to right, #000 0%, #000 55%, rgba(0,0,0,0.4) 63%, transparent 67%)",
        maskImage:
          "linear-gradient(to right, #000 0%, #000 55%, rgba(0,0,0,0.4) 63%, transparent 67%)",
        WebkitMaskSize: "300% 100%",
        maskSize: "300% 100%",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
      }}
    >
      {children}
    </motion.div>
  );
}
