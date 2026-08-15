import siteData from "@/content/site.json";

/**
 * Interim site identity type — Phase 1 only.
 *
 * §18 puts the content model in Phase 2, but `SiteFooter` (§7.3) needs identity,
 * location, and socials to render at all and the footer ships now. So this covers only
 * the fields the application shell actually consumes, hand-written, with no validation
 * gate behind it. Phase 2 replaces it with the Zod-derived type from `lib/schemas.ts`
 * and `content/site.json`'s placeholder values with real ones.
 *
 * See docs/DECISIONS.md — this is a contained pull-forward of one file, not a change to
 * the content model. Resist the urge to grow it: if another content type needs loading,
 * that is the signal that Phase 2 has started.
 */
export type SocialPlatform = "github" | "linkedin" | "email" | "x" | "other";

export type AvailabilityState = "available" | "open" | "unavailable";

export type SiteIdentity = {
  name: string;
  wordmark: string;
  role: string;
  email: string;
  location: { label: string; remote: boolean };
  availability: { show: boolean; state: AvailabilityState; label: string };
  socials: { platform: SocialPlatform; label: string; url: string }[];
};

export function getSite(): SiteIdentity {
  // The JSON import is inferred as wide string types; the assertion narrows the two
  // enum-shaped fields. Phase 2's schema parse replaces the assertion with a real check.
  return siteData as SiteIdentity;
}
