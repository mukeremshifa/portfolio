import { BrandIcon, type BrandIconName } from "@/components/ui/BrandIcon";
import { ExternalLink } from "@/components/ui/ExternalLink";
import type { Site } from "@/lib/schemas";

type HeroSocialLinksProps = {
  socials: Site["socials"];
  /**
   * `portrait` hangs the list off the photo above it: a `border-strong` rule across the
   * full column, handles beneath. `inline` is the no-portrait fallback, where there is no
   * photo edge to anchor to and the rule would be drawing a line under nothing — it sits
   * in the text column as a row instead. See the header comment for why the links survive
   * a missing portrait at all.
   */
  variant?: "portrait" | "inline";
};

/**
 * The two platforms this renders, in the order §7.3's footer column already uses.
 *
 * `socials` is `.min(2)` and carries `email`, `x`, and `other` in its `platform` enum, so
 * it is not safe to assume the array is exactly the professional pair. The hero wants the
 * two profiles a stranger looks for by name and nothing else: an email row here would
 * duplicate the contact callout at the bottom of the same page, and a personal handle
 * belongs in `site.handles`, which the footer renders and this deliberately does not.
 */
const HERO_PLATFORMS = ["github", "linkedin"] as const;

type HeroPlatform = (typeof HERO_PLATFORMS)[number];

/**
 * The display string, derived from `url` rather than stored beside it.
 *
 * `socials[]` has `platform`, `label`, and `url` and no handle field, and adding one
 * would put the same substring in two places for the schema to let drift — `label` is
 * already the platform noun ("GitHub"), and the handle is the tail of the URL. So it is
 * read off the URL: host plus path, with `www.` and any trailing slash removed.
 *
 * LinkedIn is special-cased to its `/in/<handle>` tail because the full
 * `linkedin.com/in/mukeremshifa` sets this column's width on its own and pushes the
 * portrait narrower than the layout wants. GitHub stays fully qualified — `github.com/…`
 * is the string people recognise, and it is short enough to fit.
 *
 * Returns `null` rather than throwing on a URL that will not parse. A malformed social
 * URL should cost the site one row, not the whole page — and `z.url()` at the schema
 * boundary means this is a defensive branch rather than an expected one.
 */
function toHandle(url: string, platform: HeroPlatform): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "");
  const path = parsed.pathname.replace(/\/+$/, "");

  if (platform === "linkedin") {
    // "/in/mukeremshifa" → "in/mukeremshifa". The leading slash is dropped rather than
    // the segment split off, so a company or profile URL shaped differently still
    // renders something truthful instead of an empty string.
    return path.replace(/^\//, "") || host;
  }

  return `${host}${path}`;
}

/**
 * The hero's GitHub and LinkedIn profiles, rendered as handles under the portrait.
 *
 * **Why these are in the hero at all, when `SiteFooter` already carries them.** The
 * footer's copy is a full page-scroll away, and the visitor most likely to want the
 * GitHub link is a recruiter who has been on the page for a few seconds. That is a
 * distance argument, not a content one, and it is the reason the hero's own comment
 * about "a third and fourth control" does not apply here: these are not controls. The
 * two `Button`s remain the hero's only calls to action, and nothing below is styled like
 * one — muted mono text, no fill, no border, no button padding. A visitor scanning for
 * something to click still finds exactly two things.
 *
 * **Why handles rather than platform names.** "GitHub" is what the footer column says,
 * and repeating it here would be the same row in two places. `github.com/mukeremshifa`
 * is the string a recruiter copies into a browser or a candidate note, so the link shows
 * the thing it is actually for. The mark beside it is what makes the platform readable at
 * a glance; the text is what makes it useful.
 *
 * §7.4's rule — never an icon without a name — is satisfied visibly rather than through
 * `VisuallyHidden`: every row here has readable text next to its mark, and `BrandIcon` is
 * `aria-hidden` so the accessible name is the handle alone. `ExternalLink` adds the
 * "(opens in a new tab)" suffix, which is why these are not hand-rolled anchors.
 */
export function HeroSocialLinks({ socials, variant = "portrait" }: HeroSocialLinksProps) {
  const rows = HERO_PLATFORMS.map((platform) => {
    const social = socials.find((entry) => entry.platform === platform);
    if (!social) return null;

    const handle = toHandle(social.url, platform);
    if (!handle) return null;

    return { platform, handle, url: social.url };
  }).filter((row) => row !== null);

  // Nothing to hang a rule under. `socials` is `.min(2)` but says nothing about *which*
  // two, so a site.json listing only `email` and `x` lands here rather than rendering an
  // empty bordered box.
  if (rows.length === 0) return null;

  return (
    <ul
      className={
        variant === "portrait"
          ? "mt-4 flex flex-col border-t border-border-strong pt-3"
          : "flex flex-wrap items-center gap-x-6 gap-y-1"
      }
    >
      {rows.map((row) => (
        <li key={row.url}>
          <ExternalLink
            href={row.url}
            tone="inherit"
            // `min-h-11` is §11's 44px touch target. The row is `flex` rather than
            // `inline-flex` in the portrait variant so the whole column width is
            // clickable, which is the difference between a comfortable target and a
            // 12px-tall strip of text on a phone.
            className={`group ${
              variant === "portrait" ? "flex" : "inline-flex"
            } min-h-11 items-center gap-2 font-mono text-eyebrow text-text-muted hover:text-brand`}
          >
            <BrandIcon name={row.platform as BrandIconName} size={14} />
            {row.handle}
            {/* Decorative: the row's accessible name is the handle, and `ExternalLink`
                already announces the new tab. The arrow is a hover affordance, so it is
                painted rather than spoken. `opacity` rather than a mount/unmount so the
                row's width never changes under the cursor. */}
            <span
              aria-hidden="true"
              className="ml-auto opacity-0 transition-opacity duration-(--duration-fast) ease-out group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              ↗
            </span>
          </ExternalLink>
        </li>
      ))}
    </ul>
  );
}
