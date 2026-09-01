import type { RefObject } from "react";

import { VisuallyHidden } from "@/components/ui/VisuallyHidden";
import type { ContactFieldName } from "@/lib/contact";

type ContactFieldProps = {
  name: ContactFieldName;
  label: string;
  /** `textarea` gets the message; everything else is a single-line input. */
  as?: "input" | "textarea";
  type?: "text" | "email";
  value: string;
  error?: string;
  /**
   * Shown as the control's placeholder *and* wired to `aria-describedby`.
   *
   * §11.4: a hint never replaces the label, and here it does not — the `<label>` above is
   * unconditional. The placeholder is the visible half and disappears on first keystroke;
   * the `aria-describedby` link is the half that survives, so a screen reader still gets
   * the hint after the text is gone from the field.
   */
  hint?: string;
  autoComplete?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
  /**
   * The control itself, so `ContactForm` can move focus to the first invalid field
   * (§8.7). It lands directly on the native `<input>`/`<textarea>` below.
   */
  controlRef?: RefObject<HTMLInputElement | null> | RefObject<HTMLTextAreaElement | null>;
};

/**
 * One row of §8.7's form: a visible `<label>`, the control, and the error beneath it.
 *
 * **The label is always a real `<label>` element and placeholders are never used as
 * one** (§8.7). A placeholder disappears the moment someone types, which takes the
 * field's name away exactly when they are checking what they wrote, and it is not
 * reliably announced.
 *
 * The border is `border-strong` rather than `border-subtle`, and that is a contrast
 * requirement rather than a style preference: SC 1.4.11 asks 3:1 of the boundary of a
 * user interface component, and `border-strong` exists in both palettes precisely to
 * hold it. See the 2026-08-15 entry in `docs/DECISIONS.md`.
 *
 * No focus styles here. `app/globals.css` sets one global `:focus-visible` treatment and
 * §6.8 says it is never suppressed or re-specified per component.
 */
export function ContactField({
  name,
  label,
  as = "input",
  type = "text",
  value,
  error,
  hint,
  autoComplete,
  disabled = false,
  onChange,
  onBlur,
  controlRef,
}: ContactFieldProps) {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;

  // §11.4: both the hint and the error describe the control, and the error comes first
  // so it is announced before the static help text a person has likely already heard.
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;

  const controlClasses =
    "w-full rounded-none border bg-surface px-3 py-3 font-sans text-body text-text transition-colors duration-(--duration-fast) ease-out placeholder:text-text-muted disabled:opacity-60 " +
    // The error border is the *second* signal, never the only one (§11.4) — the message
    // below carries the meaning, and someone who cannot separate these two colours still
    // gets told what is wrong in words.
    (error ? "border-danger" : "border-border-strong");

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="font-sans text-body-sm font-medium text-text">
        {label}
      </label>

      {as === "textarea" ? (
        <textarea
          id={name}
          name={name}
          rows={6}
          value={value}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.value)}
          placeholder={hint}
          onBlur={onBlur}
          ref={controlRef as RefObject<HTMLTextAreaElement | null>}
          className={`${controlClasses} resize-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          placeholder={hint}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          ref={controlRef as RefObject<HTMLInputElement | null>}
          className={controlClasses}
        />
      )}

      {/* The placeholder is not reliably announced and vanishes on first keystroke, so
          the same text lives here for `aria-describedby` to point at. Hidden visually
          because the field itself already shows it. */}
      {hint ? (
        <VisuallyHidden>
          <span id={hintId}>{hint}</span>
        </VisuallyHidden>
      ) : null}

      {/* Not a live region. The field errors are announced by the live region in
          `ContactForm` and by focus moving to the first invalid control; marking each
          error as its own region would announce three of them at once on a failed
          submit, on top of the summary. */}
      {error ? (
        <p id={errorId} className="font-sans text-body-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
