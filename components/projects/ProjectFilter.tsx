"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import type { Category } from "@/lib/schemas";

export type FilterValue = Category | "all";

type ProjectFilterProps = {
  categories: { value: FilterValue; label: string; count: number }[];
  value: FilterValue;
  onChange: (next: FilterValue) => void;
};

/**
 * §8.2's filter, reconciled with §11.2.
 *
 * The two sections describe different patterns. §8.2 wants selection carried by "text
 * weight, a border change, **and** `aria-pressed`", which is toggle-button semantics.
 * §11.2 wants "arrow keys move between options, Enter/Space selects", which is
 * radiogroup or toolbar semantics. `aria-pressed` and a radiogroup are incompatible —
 * the radiogroup spelling is `aria-checked` — so one of them had to give.
 *
 * **Resolved to `role="toolbar"` with `aria-pressed` buttons and a roving tabindex.**
 * That keeps §8.2's explicit `aria-pressed` and gets §11.2's arrow keys from the toolbar
 * pattern, which is what toolbars are for. Enter and Space then select by native button
 * behaviour rather than by a handler that has to reimplement it.
 *
 * The roving tabindex is the fiddly half. One button holds `tabindex="0"` and the rest
 * hold `-1`, so the whole group is a single tab stop; arrow keys move focus within it and
 * Home/End jump to the ends. Focus is moved imperatively after the render that changes
 * which button is tabbable, because setting `tabindex` alone moves nothing.
 *
 * §11.4: three cues, never colour alone. Weight, border, and `aria-pressed` each carry
 * the selection independently, and the count is inside the button text so it is part of
 * the accessible name rather than a decoration beside it.
 */
export function ProjectFilter({ categories, value, onChange }: ProjectFilterProps) {
  const selectedIndex = Math.max(
    categories.findIndex((category) => category.value === value),
    0,
  );
  const [focusIndex, setFocusIndex] = useState(selectedIndex);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  // Focus is only moved in response to a key press, never on mount or on a click. A
  // component that focuses itself when it renders steals focus from wherever the reader
  // actually was.
  const shouldFocus = useRef(false);

  useEffect(() => {
    if (!shouldFocus.current) return;
    shouldFocus.current = false;
    buttons.current[focusIndex]?.focus();
  }, [focusIndex]);

  function moveTo(index: number) {
    const wrapped = (index + categories.length) % categories.length;
    shouldFocus.current = true;
    setFocusIndex(wrapped);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        moveTo(index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        moveTo(index - 1);
        break;
      case "Home":
        event.preventDefault();
        moveTo(0);
        break;
      case "End":
        event.preventDefault();
        moveTo(categories.length - 1);
        break;
      default:
        break;
    }
  }

  return (
    <div
      role="toolbar"
      aria-label="Filter projects by category"
      aria-orientation="horizontal"
      className="flex flex-wrap gap-2"
    >
      {categories.map((category, index) => {
        const selected = category.value === value;

        return (
          <button
            key={category.value}
            ref={(node) => {
              buttons.current[index] = node;
            }}
            type="button"
            aria-pressed={selected}
            tabIndex={index === focusIndex ? 0 : -1}
            onClick={() => {
              setFocusIndex(index);
              onChange(category.value);
            }}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={`inline-flex min-h-11 items-center rounded-none border px-3 font-sans text-body-sm transition-[background-color,border-color,color,transform] duration-(--duration-fast) ease-out active:scale-[0.97] ${
              selected
                ? "border-brand bg-brand-soft font-semibold text-brand dark:text-brand-cream"
                : "border-border-strong bg-transparent font-normal text-text-muted hover:bg-surface-alt hover:text-text"
            }`}
          >
            {category.label} ({category.count})
          </button>
        );
      })}
    </div>
  );
}
