import { ImageResponse } from "next/og";

import { getSite } from "@/lib/content";
import { loadOgFonts, OG_CONTENT_TYPE, OG_PALETTE, OG_SIZE } from "@/lib/og";

export const alt = "Mukerem Shifa — portfolio";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * §13.4's default card, inherited by every route that does not generate its own. Built
 * from `content/site.json`, so the day the role or the wordmark changes the card follows
 * without anyone opening an image editor.
 */
export default async function Image() {
  const site = getSite();

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
      <div style={{ display: "flex", fontSize: 34, color: OG_PALETTE.brand }}>
        {site.wordmark}
      </div>

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
