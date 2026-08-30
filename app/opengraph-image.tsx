import { ImageResponse } from "next/og";

import { getSite } from "@/lib/content";
import {
  loadOgFonts,
  loadOgMonogram,
  OG_CONTENT_TYPE,
  OG_PALETTE,
  OG_SIZE,
} from "@/lib/og";

export const alt = "Mukerem Shifa — portfolio";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * §13.4's default card, inherited by every route that does not generate its own. The
 * name, role, and location are read from `content/site.json`, so the day any of them
 * changes the card follows without anyone opening an image editor.
 *
 * The monogram at the top is the one fixed element: it is artwork, not content, and it
 * is composited from a PNG rather than set as text — see `loadOgMonogram`.
 */
export default async function Image() {
  const site = getSite();
  const monogram = await loadOgMonogram();

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: 80,
        backgroundColor: OG_PALETTE.canvas,
        color: OG_PALETTE.text,
        fontFamily: "Source Serif 4",
        borderTop: `16px solid ${OG_PALETTE.brand}`,
      }}
    >
      {/* The monogram replaced `site.wordmark` here. The card is the one surface where
          the mark is doing the identifying on its own — a thumbnail in a feed, at a size
          where nobody reads a two-letter caption — so it is worth the pixels the text
          was not. `alt` is empty because the name is set in full below it. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- `next/image` does not
          exist inside an ImageResponse. This tree is rendered by Satori, not by a
          browser: there is no DOM, no loader, and no LCP to optimise. `<img>` with a
          data URI is the only image primitive available here. */}
      <img src={monogram} alt="" width={132} height={132} />

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", fontSize: 84, lineHeight: 1.05 }}>{site.name}</div>
        <div style={{ display: "flex", fontSize: 40, color: OG_PALETTE.muted }}>
          {site.role}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          fontSize: 28,
          color: OG_PALETTE.muted,
          borderTop: `2px solid ${OG_PALETTE.border}`,
          paddingTop: 24,
        }}
      >
        {site.location.label}
      </div>
    </div>,
    { ...size, fonts: await loadOgFonts() },
  );
}
