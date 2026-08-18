import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Shared pieces of §13.4's Open Graph cards.
 *
 * **`ImageResponse` cannot see anything from `globals.css`.** It runs in its own
 * rendering context (Satori, then Resvg), so `next/font`'s CSS variables, the `@theme`
 * tokens, and Tailwind utilities are all invisible to it. Colours are therefore repeated
 * here as literals and the font is loaded as an actual binary. That is a real, if small,
 * second copy of the palette: if §6.2's light values ever change, this file changes with
 * them, and there is no compiler that will say so.
 *
 * The card is light-mode only. An OG image has no viewer theme to follow.
 */
export const OG_SIZE = { width: 1200, height: 630 } as const;

export const OG_CONTENT_TYPE = "image/png";

/** §6.2's light palette, by value, for the reason above. */
export const OG_PALETTE = {
  canvas: "#f3ece2",
  surface: "#ffffff",
  text: "#1e2229",
  muted: "#5c6470",
  brand: "#0a39a6",
  border: "#e4dbd0",
} as const;

/**
 * One family, not three. Satori accepts `ttf`, `otf`, and `woff` only — `next/font`
 * caches `woff2`, which it cannot read — so the binary is committed under
 * `assets/fonts/` and read at generation time. Source Serif 4 SemiBold is the site's
 * display face (§6.6), and the card is display type almost end to end.
 */
export async function loadOgFonts() {
  const data = await readFile(
    join(process.cwd(), "assets", "fonts", "SourceSerif4-SemiBold.ttf"),
  );

  return [
    { name: "Source Serif 4", data, style: "normal" as const, weight: 600 as const },
  ];
}
