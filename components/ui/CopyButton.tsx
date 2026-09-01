"use client";

import { useEffect, useRef, useState } from "react";

import { VisuallyHidden } from "@/components/ui/VisuallyHidden";

type CopyButtonProps = {
  /**
   * The raw text to copy, passed in rather than read back off the DOM. `CodeBlock` is a
   * server component and already holds the source; reading `textContent` from a `<pre>`
   * would round-trip it through the rendered markup for no reason and break the moment
   * anything decorates the block.
   */
  value: string;
  /** Names the snippet in the button's accessible name. */
  label: string;
};

type CopyState = "idle" | "copied" | "failed";

const MESSAGES: Record<CopyState, string> = {
  idle: "",
  copied: "Copied",
  failed: "Copy failed",
};

/**
 * The one client island in `CodeBlock` (§12.4).
 *
 * The visible label stays "Copy" and the result is announced beside it rather than by
 * swapping the button's text. That keeps the accessible name stable and keeps the
 * visible label inside it (SC 2.5.3), which a button that relabels itself to "Copied"
 * does not.
 */
export function CopyButton({ value, label }: CopyButtonProps) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      // Insecure context, or permission refused. Say so rather than silently
      // pretending it worked — the source is on screen and selectable either way.
      setState("failed");
    }

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 3000);
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      {/* §11.2: one polite live region. It is rendered unconditionally and its text
          changes, because a region that appears at the same moment as its message is
          not reliably announced. */}
      <span
        role="status"
        aria-live="polite"
        className={
          state === "failed"
            ? "font-sans text-body-sm text-danger"
            : "font-sans text-body-sm text-text-muted"
        }
      >
        {/* The fade is on this inner span, never on the `role="status"` node above: that
            node has to stay mounted and unanimated for the announcement to be reliable,
            which is the whole reason it renders unconditionally. Opacity is driven off
            the state rather than a mount, so the text is always in the DOM and it is the
            *appearance* that changes — nothing here remounts. */}
        <span
          className={`inline-block transition-opacity duration-(--duration-fast) ease-out ${
            state === "idle" ? "opacity-0" : "opacity-100"
          }`}
        >
          {MESSAGES[state]}
        </span>
      </span>
      <button
        type="button"
        onClick={copy}
        // `active:scale-[0.98]` matches `Button.tsx` (§10.2's button row). This control
        // was the one pressable element in the system without it, and it is the one where
        // it matters most: the result is announced beside the button rather than by
        // relabelling it, so without a press state a copy that works and a copy that does
        // nothing look identical for the moment before the text changes.
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-none border border-border-strong px-3 font-sans text-body-sm font-medium text-text transition-[background-color,transform] duration-(--duration-fast) ease-out hover:bg-surface-alt active:scale-[0.98]"
      >
        Copy
        <VisuallyHidden> {label}</VisuallyHidden>
      </button>
    </div>
  );
}
