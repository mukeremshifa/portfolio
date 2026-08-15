export const THEME_STORAGE_KEY = "theme";

/** §6.5: `system` is a real third state, not a resolved value we happened to compute. */
export type ThemePreference = "system" | "light" | "dark";

export const THEME_PREFERENCES: ThemePreference[] = ["system", "light", "dark"];

/**
 * The stored *preference* and the *resolved* theme are different things, and conflating
 * them is the bug this whole file exists to avoid. `localStorage` holds one of three
 * preferences; `.dark` on `<html>` and `data-theme-pref` hold the consequences.
 *
 * Storing a resolved "light" when the user picked `system` looks identical until their
 * OS switches to dark at sunset and the site does not follow.
 */
const script = `(function(){try{
var k="${THEME_STORAGE_KEY}",p=localStorage.getItem(k);
if(p!=="light"&&p!=="dark")p="system";
var r=p==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):p;
var e=document.documentElement;
e.classList.toggle("dark",r==="dark");
e.dataset.themePref=p;
e.style.colorScheme=r;
}catch(_){}})();`
  .split("\n")
  .join("");

/**
 * Inline, blocking, and in `<head>` — all three matter. The browser runs it while
 * parsing, before the first paint, which is the only point at which the correct theme
 * can be applied without a flash. A component that ran after hydration would be too
 * late by exactly the amount of time the user notices.
 *
 * `data-theme-pref` is set here as well as the class, because the toggle's icon and its
 * accessible label are driven off it in CSS. That way the control is painted in the
 * right state before React has loaded, not corrected once it has.
 */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
