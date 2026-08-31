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
 *
 * That warning had already come true once: `brand` sat at the retired cobalt
 * `#0a39a6` long after §6.2 moved to emerald, so every card shipped an accent that
 * appeared nowhere on the site. Re-synced 2026-08-30. The dark-mode B4 revision of the
 * same date does not reach here, since the card never renders in dark.
 *
 * Re-synced again 2026-08-31, when `text` and `muted` were rotated off the blue axis
 * they had kept from the cobalt palette. That half of the change *does* reach here, and
 * nothing flagged it — which is the second time this file proved its own warning.
 */
export const OG_SIZE = { width: 1200, height: 630 } as const;

export const OG_CONTENT_TYPE = "image/png";

/** §6.2's light palette, by value, for the reason above. */
export const OG_PALETTE = {
  canvas: "#f3ece2",
  surface: "#ffffff",
  text: "#26211a",
  muted: "#6b6256",
  brand: "#184e38",
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

/** Intrinsic size of `og-monogram.png`, and the aspect the cards lay it out at. */
export const OG_MONOGRAM_SIZE = { width: 512, height: 512 } as const;

/**
 * The monogram, as a `data:` URI for the cards to place with a plain `<img>`.
 *
 * A PNG rather than the `monogram.svg` sitting next to it, for two reasons that both
 * come back to Satori: it will not resolve `currentColor` (there is no cascade to
 * resolve it against), and its SVG support wants intrinsic dimensions that a
 * `viewBox`-only document does not carry. The PNG is pre-coloured `brand` and
 * transparent everywhere else, which is all the card needs — it only ever sits on
 * `canvas`.
 *
 * Read from `public/` rather than `assets/`: `public/` is copied into the deployment
 * verbatim, so the file is present without depending on build-time file tracing to
 * notice a path that is assembled at runtime.
 */
export async function loadOgMonogram() {
  const data = await readFile(join(process.cwd(), "public", "brand", "og-monogram.png"));
  return `data:image/png;base64,${data.toString("base64")}`;
}
