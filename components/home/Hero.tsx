import { Button } from "@/components/ui/Button";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { Figure } from "@/components/ui/Figure";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Site } from "@/lib/schemas";
import { formatMonth } from "@/lib/utils";

type HeroProps = { site: Site };

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
  return (
    <section className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        {/* Presentational. §11.1: an eyebrow is a paragraph and never substitutes for a
            heading in the outline. */}
        <p className="font-mono text-eyebrow text-text-muted uppercase">{site.eyebrow}</p>

        <h1 className="max-w-measure font-serif text-display-1 font-semibold text-text">
          {site.headline}
        </h1>

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

        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 font-sans text-body-sm">
          {site.socials.map((social) => (
            <li key={social.url}>
              <ExternalLink href={social.url}>{social.label}</ExternalLink>
            </li>
          ))}
        </ul>
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
        </div>
      ) : null}
    </section>
  );
}
