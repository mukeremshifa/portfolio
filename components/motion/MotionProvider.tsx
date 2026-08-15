"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * §10.3 requires `MotionConfig reducedMotion="user"` around the tree. `MotionConfig` is
 * a client component, and `app/layout.tsx` must stay a server component, so this thin
 * provider is the boundary: it takes server-rendered children as a prop and passes them
 * straight through, which keeps everything inside it server-rendered.
 *
 * Do not put anything else in here. It exists to hold one prop.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
