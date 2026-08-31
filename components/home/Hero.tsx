import { Signature } from "@/components/brand/Signature";
import { Button } from "@/components/ui/Button";
import { Figure } from "@/components/ui/Figure";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { VisuallyHidden } from "@/components/ui/VisuallyHidden";
import { SIGNATURE } from "@/lib/brand-marks";
import type { Site } from "@/lib/schemas";

type HeroProps = { site: Site };

/**
 * The one string the signature artwork actually spells. Read off the generated mark
 * rather than typed here, so the guard below cannot fall out of step with the drawing
 * the next time `scripts/build_brand.py` runs.
 */
const SIGNED_NAME = SIGNATURE.text;

/**
 * §8.1's hero. Portrait left, name right, two type levels, one typeface, two buttons.
 *
 * Three constraints from owner review shape this, and each is easy to undo by accident:
 *
 * 1. **One typeface for every piece of type here.** The role and both buttons are
 *    Instrument Sans and nothing else; the drawn signature is the only other letterform
 *    in the section, and it is artwork rather than a font. Adding a mono eyebrow or a
 *    serif line would put the hero back where it started. The typeset fallback `h1`
 *    below is the one exception, and it is unreachable while `site.name` is the signed
 *    name — it stays `font-serif` because §6.6 pairs `display-1` with Source Serif, and
 *    a hero rendering somebody else's name has bigger problems than family consistency.
 * 2. **Two calls to action, total.** The GitHub and LinkedIn links used to sit here as a
 *    third and fourth control. They are in `SiteFooter` on every page and on `/contact`,
 *    so the hero was the third place to say the same thing and the one where it cost the
 *    most.
 * 3. **No stat row.** §1.5 and §21 forbid invented metrics, and the honest counts —
 *    seven projects, two of them deployed, two AI — are small enough that stating them
 *    reads weaker than the "Selected work" cards immediately below.
 *
 * **What §8.1 lists that this does not render:** the eyebrow, `site.intro`, and the
 * "PDF, updated …" caption. `site.intro` keeps its other consumer — it is still
 * `personJsonLd`'s `description`, so the paragraph written to be read cold by a stranger
 * is still the one search sees. See `docs/DECISIONS.md`.
 *
 * Three optional fields each render as absence rather than as an empty affordance, and
 * each is a row of the swap matrix in `docs/STUB-INVENTORY.md`:
 *
 * - no `portrait` → the row collapses to one column, which is §8.1's requirement. The
 *   text column is `flex-1`, so this needs no branch: it simply takes the width back.
 * - no `resume` → the secondary CTA is not rendered, not disabled
 * - `availability.show: false` → the badge disappears from this hero, and this is now the
 *   only place any of it renders. The footer used to carry a second, separately-flagged
 *   "· Available remotely" off `location.remote`, so going quiet site-wide took two edits;
 *   that field was deleted on 2026-08-31 and this flag is the whole switch.
 *
 * The portrait is first in the DOM, so the mobile stack is face-then-name and the desktop
 * row is portrait-left without an `order-*` override. It carries no information the text
 * does not already carry (§8.1), which is why removing it costs the page nothing but
 * width.
 */
export function Hero({ site }: HeroProps) {
  return (
    // The height floor is `--hero-min-height` (globals.css), which is derived rather than
    // picked: it is whatever is left of the viewport once the header, the page padding,
    // and the gap below this section are taken out, minus a heading's worth of peek. That
    // is what keeps "Selected work" showing above the fold on a tall window as well as a
    // short one, which a `60vh` cannot do — the chrome it competes with is fixed, so the
    // fraction that works at 900px leaves the next heading stranded at 1440px.
    //
    // `justify-center` then spends the surplus as space above and below rather than
    // pinning the content to the top of it. Below `md` the floor is omitted: a stacked
    // portrait and name already overflow a phone screen, so a minimum there could only
    // add dead space under the buttons.
    <section className="flex flex-col justify-center gap-12 md:min-h-(--hero-min-height) lg:flex-row lg:items-center lg:gap-20">
      {site.portrait ? (
        // Capped at both ends. Uncapped on mobile the 3:4 portrait is ~467px tall on a
        // 350px viewport and pushes the name itself below the fold; uncapped at `lg` two
        // fifths of a 1200px container is a ~590px slab that the lines beside it cannot
        // balance. 360px wide reads as 480px tall, which sits inside the floor above with
        // room to breathe rather than setting the section's height itself.
        <div className="w-full max-w-64 shrink-0 lg:w-2/5 lg:max-w-90">
          <Figure
            src={site.portrait.src}
            alt={site.portrait.alt}
            width={site.portrait.width}
            height={site.portrait.height}
            priority
            sizes="(min-width: 1024px) 22.5rem, 16rem"
          />
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col gap-12">
        {/* One block, because the badge, the name, and the role are one introduction.
            The badge sits above the name rather than below the role so that enabling it
            adds an eyebrow to the top of the stack instead of a third step to the middle
            of the hierarchy this hero exists to keep flat. */}
        <div className="flex flex-col gap-6">
          {site.availability.show ? (
            <div>
              <StatusBadge
                state={site.availability.state}
                label={site.availability.label}
              />
            </div>
          ) : null}

          {/* B5: the hero heading is the system's one gradient, and it is on text, not
              on a background. Both branches below honour that — the difference is only
              whether the gradient is clipped to glyphs or painted into outlines. */}
          {site.name === SIGNED_NAME ? (
            <h1>
              {/* The heading's text lives here, not in the artwork. `Signature` is
                  `aria-hidden`, so this is what the accessibility tree, search, and a
                  copy-paste all see, and there is exactly one copy of it. */}
              <VisuallyHidden>{site.name}</VisuallyHidden>
              <Signature className="w-full max-w-136 text-text" />
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

          {/* The hero's second and last type level, and the only typeset line in it.
              §8.1 still asks the hero to state role, specialty, and value in about five
              seconds, and this line is carrying that alone — which is why it stays at
              `heading-1` on full `text` rather than shrinking into a caption under the
              drawing. */}
          <p className="max-w-measure font-sans text-heading-1 font-medium text-text">
            {site.role}
          </p>
        </div>

        {/* Two controls. See the header comment before adding a third. */}
        <div className="flex flex-wrap items-center gap-3">
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
      </div>
    </section>
  );
}
