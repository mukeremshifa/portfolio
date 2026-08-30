import { Signature } from "@/components/brand/Signature";
import { Button } from "@/components/ui/Button";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { Figure } from "@/components/ui/Figure";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { VisuallyHidden } from "@/components/ui/VisuallyHidden";
import { SIGNATURE } from "@/lib/brand-marks";
import type { Site } from "@/lib/schemas";
import { formatMonth } from "@/lib/utils";

type HeroProps = { site: Site };
type HeroSocial = Site["socials"][number] & {
  platform: "github" | "linkedin";
};

/**
 * The one string the signature artwork actually spells. Read off the generated mark
 * rather than typed here, so the guard below cannot fall out of step with the drawing
 * the next time `scripts/build_brand.py` runs.
 */
const SIGNED_NAME = SIGNATURE.text;

/**
 * §8.1's hero, and the site's one `display-1`.
 *
 * Three optional fields each render as absence rather than as an empty affordance, and
 * each is a row of the swap matrix in `docs/STUB-INVENTORY.md`:
 *
 * - no `portrait` → the grid collapses to one column, which is §8.1's requirement
 * - no `resume` → the secondary CTA is not rendered, not disabled
 * - `availability.show: false` → the badge disappears from this hero, and only from here.
 *   The footer reads `location`, never `availability`, so its "· Available remotely" line
 *   survives this flag; that string is `location.remote`. Silencing both is two edits.
 *
 * `ProfileVisual` is the portrait and it carries no information the text does not already
 * carry (§8.1), which is why removing it costs the page nothing but width.
 */
export function Hero({ site }: HeroProps) {
  const heroSocials = site.socials.filter(
    (social): social is HeroSocial =>
      social.platform === "github" || social.platform === "linkedin",
  );

  return (
    <section className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <div className="flex flex-col gap-2">
          {/* B5: the hero heading is the system's one gradient, and it is on text, not
              on a background. Both branches below honour that — the difference is only
              whether the gradient is clipped to glyphs or painted into outlines. */}
          {site.name === SIGNED_NAME ? (
            <h1 className="max-w-measure">
              {/* The heading's text lives here, not in the artwork. `Signature` is
                  `aria-hidden`, so this is what the accessibility tree, search, and a
                  copy-paste all see, and there is exactly one copy of it. */}
              <VisuallyHidden>{site.name}</VisuallyHidden>
              <Signature className="w-full max-w-[34rem] text-text" />
            </h1>
          ) : (
            // The signature is a fixed drawing of one string. If `site.name` is ever
            // something else, the artwork would be quietly asserting the wrong name, so
            // it steps aside for the typeset heading it replaced rather than shipping a
            // lie. `hero-heading` (globals.css) restores a painted colour under
            // forced-colors, where a clipped background leaves nothing to read.
            <h1 className="hero-heading max-w-measure bg-linear-to-r from-hero-from to-hero-to bg-clip-text font-serif text-display-1 font-semibold text-transparent">
              {site.name}
            </h1>
          )}
          <p className="font-sans text-heading-1 font-semibold text-text">{site.role}</p>
        </div>

        <p className="max-w-measure font-sans text-body-lg text-text-muted">
          {site.intro}
        </p>

        {site.availability.show ? (
          <div>
            <StatusBadge
              state={site.availability.state}
              label={site.availability.label}
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-3">
            <Button href="/projects">Explore selected work</Button>
            {site.resume ? (
              // `external` because the target is a file rather than a route: it opens in
              // a tab and says so, and it behaves identically whether `resume.url` is the
              // root-relative placeholder or an absolute URL on object storage later.
              <Button href={site.resume.url} external variant="secondary">
                Download résumé
              </Button>
            ) : null}
          </div>
          {site.resume ? (
            <p className="font-sans text-body-sm text-text-muted">
              PDF, updated {formatMonth(site.resume.updated)}.
            </p>
          ) : null}
        </div>
      </div>

      {site.portrait ? (
        <div className="w-full max-w-sm shrink-0 lg:w-2/5">
          <Figure
            src={site.portrait.src}
            alt={site.portrait.alt}
            width={site.portrait.width}
            height={site.portrait.height}
            priority
            sizes="(min-width: 1024px) 40vw, 100vw"
          />
          {heroSocials.length > 0 ? (
            <nav aria-label="Social profiles" className="mt-4">
              <ul className="flex flex-wrap gap-2">
                {heroSocials.map((social) => (
                  <li key={social.url}>
                    <ExternalLink
                      href={social.url}
                      className="inline-flex min-h-11 min-w-11 items-center justify-center border border-border-strong no-underline transition-[background-color,color] duration-(--duration-fast) ease-standard hover:bg-surface-alt hover:no-underline"
                    >
                      <BrandIcon name={social.platform} />
                      <VisuallyHidden>{social.label}</VisuallyHidden>
                    </ExternalLink>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
