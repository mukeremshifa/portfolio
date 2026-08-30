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
        {MESSAGES[state]}
      </span>
      <button
        type="button"
        onClick={copy}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-none border border-border-strong px-3 font-sans text-body-sm font-medium text-text transition-colors duration-(--duration-fast) ease-standard hover:bg-surface-alt"
      >
        Copy
        <VisuallyHidden> {label}</VisuallyHidden>
      </button>
    </div>
  );
}
