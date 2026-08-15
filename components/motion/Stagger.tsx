"use client";

import { Children, type ReactNode } from "react";

import { Reveal } from "@/components/motion/Reveal";

type StaggerProps = {
  children: ReactNode;
  /** Milliseconds between children. §10.2 specifies 60. */
  step?: number;
  /**
   * The element each child is wrapped in. Not in §9.4's type, but `Reveal` already has
   * it and a stagger inside a `<ul>` has to produce `<li>`s or the list stops being a
   * list (§11.1). Additive, and it mirrors the sibling component rather than inventing
   * a second convention.
   */
  as?: "div" | "section" | "li";
};

// §10.2: 60ms between children, capped at 6. Past the cap the last card would be waiting
// most of a second for no reason anyone can perceive as sequence.
const MAX_STEPS = 6;

export function Stagger({ children, step = 60, as = "div" }: StaggerProps) {
  return (
    <>
      {Children.map(children, (child, index) => (
        <Reveal as={as} delay={(Math.min(index, MAX_STEPS - 1) * step) / 1000}>
          {child}
        </Reveal>
      ))}
    </>
  );
}
