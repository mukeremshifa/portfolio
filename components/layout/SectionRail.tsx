"use client";

import { useEffect, useState } from "react";

export type RailSection = {
  /** The target's `id`. Must match a `data-rail-section` element rendered by the page. */
  id: string;
  /** The visible label, and the link's accessible name. Short: it sits in a 200px gutter. */
  label: string;
};

type SectionRailProps = {
  sections: RailSection[];
  /**
   * The rail is only worth its own chrome when there is somewhere to go. Two dashes are
   * a control that tells the reader what they can already see, so pages below this
   * render nothing — see the callers, none of which pass fewer.
   */
  minSections?: number;
};

/**
 * The scroll position indicator, replacing the native scrollbar that `globals.css`
 * removes.
 *
 * **Why it exists.** The platform scrollbar is the one element on the page the design
 * system does not get to draw: it is rounded where §6.7 says every edge is square, it
 * carries the OS's colours rather than the palette's, and its metrics change per
 * platform. It cannot be restyled into the system — `scrollbar-width` offers `thin` and
 * `none`, and the WebKit pseudo-elements still leave the platform's shape underneath. So
 * the indicator is rebuilt out of the system's own vocabulary instead: one dash per
 * section, in `BulletList`'s marker colour, flush right and vertically centred.
 *
 * **What it is not.** It is not a table of contents and not a second nav. It is
 * `<nav aria-label="Sections">` because that is what a set of in-page jump links is, but
 * it deliberately carries no surface, no border, and no background — at rest it is n
 * dashes in `border-strong`, and the only thing that ever changes is which one is the
 * ink colour.
 *
 * **Where the motion is not.** §21 forbids anything that moves while someone is reading,
 * and the scroll itself is deliberately left to CSS: no `scroll-behavior: smooth` is set
 * here, no scroll animation is driven from JS, and the label's appearance is a colour and
 * opacity transition on hover — a state change, not an entrance. The smooth-scroll pass
 * belongs to the animation phase, and it is one declaration on `html` when it comes,
 * which `prefers-reduced-motion` in `globals.css` already overrides back to `auto`.
 *
 * **Above `md` only.** Below it there is no gutter to sit in — the content runs to a
 * 20px margin — and mobile scrollbars are overlays that are already invisible at rest,
 * so there is nothing there to replace.
 */
export function SectionRail({ sections, minSections = 3 }: SectionRailProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  /**
   * What the effect below actually depends on: the identity of the stops, not the array
   * object holding them. `app/contact/page.tsx` builds its list in the component body
   * because one stop is conditional, so the array is a new object on every render even
   * when it describes the same sections. Keying on the ids means the observer is rebuilt
   * when the stops change and never merely because the caller re-rendered.
   */
  const sectionKey = sections.map((section) => section.id).join("|");

  useEffect(() => {
    // Rebuilt from the key, so the effect closes over nothing that changes identity
    // per render and the dependency list stays exhaustive without an escape hatch.
    const ids = sectionKey.split("|");
    if (ids.length < minSections) return;

    /**
     * Every section currently intersecting the band, kept across observer callbacks. The
     * callback only reports what *changed*, so deciding the active section from `entries`
     * alone would make the answer depend on which sections happened to cross a boundary
     * in that one frame. Holding the full set means the rule below reads the same state
     * every time.
     *
     * Scoped to the effect and closed over by the callback, rather than held in a ref:
     * its lifetime is exactly the observer's, and it is an input to the decision rather
     * than something rendered — state would re-render on every scroll for a value nothing
     * displays.
     */
    const visible = new Set<string>();

    const targets = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (targets.length === 0) return;

    // Order is by page position, not by the order the observer reports things in.
    const order = new Map(ids.map((id, index) => [id, index]));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }

        // The topmost visible section wins. "Most visible" — picking by intersection
        // ratio — is the other obvious rule and it is worse here: a short section is
        // fully visible at ratio 1 while the tall one the reader is actually in sits at
        // 0.4, so the marker jumps forward to a section that occupies less of the screen.
        // Topmost matches what a scrollbar reports: where the viewport is, not what is
        // biggest inside it.
        const next = [...visible].sort(
          (a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0),
        )[0];

        // Between two sections — the gap between them filling the band — nothing is
        // intersecting. Keeping the last active dash lit is correct: the reader has not
        // left that section for another one, and blanking the rail would make it flicker
        // through every `gap-section` on the page.
        if (next !== undefined) setActiveId(next);
      },
      {
        /**
         * A horizontal band across the viewport, not the whole viewport: 20% from the
         * top, 65% up from the bottom, leaving a 15%-tall strip a little above centre.
         * A section is "current" when it crosses that strip.
         *
         * The whole viewport would report three sections at once on a tall screen and
         * make the topmost rule pick whichever merely peeks in at the top. A single
         * line (`-50% 0px -50%`) is the other end of that trade and goes blank whenever
         * a section boundary happens to sit on it. A band is the version with no dead
         * zone and no ambiguity.
         */
        rootMargin: "-20% 0px -65% 0px",
      },
    );

    for (const target of targets) observer.observe(target);

    return () => observer.disconnect();
  }, [sectionKey, minSections]);

  if (sections.length < minSections) return null;

  return (
    <nav
      aria-label="Sections"
      /**
       * `fixed` and vertically centred, in the gutter beside the 1200px content column.
       * `hidden md:flex` because below `md` there is no gutter. `pointer-events-none` on
       * the container with `pointer-events-auto` on each link keeps the empty column
       * between the dashes and the content from swallowing clicks and text selection —
       * the strip is 200px wide to give the labels room, and none of that width is the
       * rail's to intercept.
       */
      className="pointer-events-none fixed top-1/2 right-0 z-30 hidden -translate-y-1/2 flex-col items-end gap-3 pr-5 md:flex xl:pr-8"
    >
      {sections.map((section) => {
        const isActive = section.id === activeId;

        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            /**
             * `aria-current="true"` rather than `"location"`: the rail marks where the
             * reader is *within* this page, which is what `true` means on a link that is
             * not the current page. It is also the hook the label's active styling reads,
             * so the visible state and the announced state cannot drift apart.
             */
            aria-current={isActive ? "true" : undefined}
            className="group pointer-events-auto flex items-center justify-end gap-3 py-1"
          >
            {/*
              The label. Hidden by `opacity` and not by `display` so it stays in the
              accessibility tree as the link's name — a dash on its own is nameless, and
              `group-hover` cannot help a screen reader. `whitespace-nowrap` because the
              gutter is not wide enough to wrap into, and the rail must never reflow the
              page.

              Shown on `group-hover` and on `group-focus-visible`, so the keyboard path
              is the mouse path. It is `text-body-sm` in mono, matching the eyebrow
              vocabulary the section headings already use.
            */}
            <span className="pointer-events-none font-mono text-eyebrow whitespace-nowrap text-text-muted opacity-0 transition-opacity duration-(--duration-fast) ease-standard group-hover:opacity-100 group-focus-visible:opacity-100">
              {section.label}
            </span>

            {/*
              The dash. 16×2 — `BulletList`'s square stretched along the axis it is
              indicating, which is what makes it read as a position on a scale rather
              than as a bullet in a list.

              Active is a colour change and nothing else: `border-strong` → `text`. The
              width stays fixed so the stack never reflows as the reader scrolls, which
              is the thing §21 rules out — a rail whose dashes resize is motion running
              while someone is reading, driven by the reading itself.
            */}
            <span
              aria-hidden="true"
              className={`h-0.5 w-4 shrink-0 transition-colors duration-(--duration-fast) ease-standard ${
                isActive ? "bg-text" : "bg-border-strong group-hover:bg-text-muted"
              }`}
            />
          </a>
        );
      })}
    </nav>
  );
}
