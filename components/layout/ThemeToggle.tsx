"use client";

import { useCallback, useEffect, useLayoutEffect } from "react";

import {
  THEME_PREFERENCES,
  THEME_STORAGE_KEY,
  type ThemePreference,
} from "@/components/layout/ThemeScript";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

/**
 * The one place a preference turns into a resolved theme. `system` is resolved *here*,
 * at apply time, and never written back to storage — which is what lets the next OS
 * theme change still reach the page.
 */
function applyPreference(preference: ThemePreference) {
  const resolved =
    preference === "system"
      ? window.matchMedia(DARK_QUERY).matches
        ? "dark"
        : "light"
      : preference;

  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.dataset.themePref = preference;
  // §6.5: keeps form controls, scrollbars, and the address bar in step.
  root.style.colorScheme = resolved;
}

/**
 * A cycling button, per §6.5: system, then light, then dark, then back.
 *
 * It holds no React state on purpose. The `<html>` attributes the inline script already
 * set are the source of truth, the icon and label are selected from them in CSS, and
 * the server renders all three options identically — so there is no hydration mismatch
 * to suppress and nothing to correct after mount. The accessible name stays accurate
 * because only the matching label is `display: block`; the other two are `display: none`
 * and therefore excluded from name computation.
 */
export function ThemeToggle() {
  // The inline script sets these during parsing, which is all production needs. In dev,
  // React's Strict Mode remount resets <html> to the attributes it manages from JSX and
  // wipes them, so re-apply before paint. No-op in production.
  useLayoutEffect(() => {
    applyPreference(readPreference());
  }, []);

  // The `system` half of the contract: follow the OS while the preference is `system`,
  // and ignore it entirely once the user has chosen a side.
  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY);
    const onChange = () => {
      if (readPreference() === "system") applyPreference("system");
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const cycle = useCallback(() => {
    const current = readPreference();
    const next =
      THEME_PREFERENCES[
        (THEME_PREFERENCES.indexOf(current) + 1) % THEME_PREFERENCES.length
      ] ?? "system";

    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private browsing, storage disabled — the toggle still works for this page view.
    }
    applyPreference(next);
  }, []);

  return (
    <button
      type="button"
      onClick={cycle}
      className="theme-toggle inline-grid min-h-11 min-w-11 place-items-center rounded-none border border-border-strong text-text transition-colors duration-(--duration-fast) ease-out hover:bg-surface-alt"
    >
      <span aria-hidden="true" className="grid size-5 grid-cols-1 grid-rows-1">
        <SystemIcon />
        <SunIcon />
        <MoonIcon />
      </span>
      {/* §6.5: the label names the *next* state, so the button says what it does rather
          than what it is. Only one is rendered; see the CSS in globals.css. */}
      <span className="sr-only">
        <span className="theme-label theme-label-system">Switch to light theme</span>
        <span className="theme-label theme-label-light">Switch to dark theme</span>
        <span className="theme-label theme-label-dark">Switch to system theme</span>
      </span>
    </button>
  );
}

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function SystemIcon() {
  return (
    <svg {...iconProps} className="theme-icon theme-icon-system">
      <rect x="2.5" y="4" width="19" height="13" rx="2" />
      <path d="M8 20h8" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg {...iconProps} className="theme-icon theme-icon-light">
      <circle cx="12" cy="12" r="4.25" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg {...iconProps} className="theme-icon theme-icon-dark">
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
    </svg>
  );
}
