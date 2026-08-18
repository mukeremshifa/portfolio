import { ImageResponse } from "next/og";

import { getProjectBySlug, getProjectSlugs, getSite } from "@/lib/content";
import { loadOgFonts, OG_CONTENT_TYPE, OG_PALETTE, OG_SIZE } from "@/lib/og";
import { formatYearRange } from "@/lib/utils";

export const alt = "Project card";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

/**
 * §13.4, and the reason OG generation is in this phase rather than Phase 3 (see
 * docs/DECISIONS.md). The card is generated from content — title, category, wordmark —
 * so adding a second project adds a second card without adding an asset, which is what
 * "adding a project requires zero component changes" has to mean to be true.
 *
 * Title sizing steps down for long titles rather than being clipped. The golden sample's
 * is exactly 80 characters, the schema maximum, so the smallest step is the one that has
 * actually been looked at.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = getSite();
  const project = getProjectBySlug(slug);
  const titleSize = project.title.length > 64 ? 62 : project.title.length > 40 ? 76 : 88;

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 32,
          color: OG_PALETTE.muted,
        }}
      >
        <div style={{ display: "flex", color: OG_PALETTE.brand }}>{project.category}</div>
        <div style={{ display: "flex" }}>
          {formatYearRange(project.year.start, project.year.end)}
        </div>
      </div>

      <div style={{ display: "flex", fontSize: titleSize, lineHeight: 1.1 }}>
        {project.title}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          fontSize: 30,
          color: OG_PALETTE.muted,
          borderTop: `2px solid ${OG_PALETTE.border}`,
          paddingTop: 24,
        }}
      >
        <div style={{ display: "flex" }}>{site.name}</div>
        <div style={{ display: "flex", fontSize: 34, color: OG_PALETTE.brand }}>
          {site.wordmark}
        </div>
      </div>
    </div>,
    { ...size, fonts: await loadOgFonts() },
  );
}
