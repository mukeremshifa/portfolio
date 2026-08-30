import { Button } from "@/components/ui/Button";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { Figure } from "@/components/ui/Figure";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { VisuallyHidden } from "@/components/ui/VisuallyHidden";
import type { Site } from "@/lib/schemas";
import { formatMonth } from "@/lib/utils";

type HeroProps = { site: Site };
type HeroSocial = Site["socials"][number] & {
  platform: "github" | "linkedin";
};

/**
 * §8.1's hero, and the site's one `display-1`.
 *
 * Three optional fields each render as absence rather than as an empty affordance, and
 * each is a row of the swap matrix in `docs/STUB-INVENTORY.md`:
 *
 * - no `portrait` → the grid collapses to one column, which is §8.1's requirement
 * - no `resume` → the secondary CTA is not rendered, not disabled
 * - `availability.show: false` → the badge disappears here and in the footer together
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
          <h1 className="max-w-measure font-serif text-display-1 font-semibold text-text">
            {site.name}
          </h1>
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
