import { Signature } from "@/components/brand/Signature";
import { Fade } from "@/components/motion/Fade";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { SignatureReveal } from "@/components/motion/SignatureReveal";
import { SplitText } from "@/components/motion/SplitText";
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
 * §10.3's page-load sequence, in seconds, all measured from first paint.
 *
 * The hero is the one place on the site that gets a choreographed entrance rather than a
 * single reveal, because it is the only screen where nothing else is competing for
 * attention and the reader has not yet started reading anything. Four stages, in the
 * order a person meets someone: their face, their name, what they do, what you can do
 * next.
 *
 * The gaps are deliberately uneven and deliberately overlapping. The name starts drawing
 * while the face is still resolving, and the role line starts while the signature is only
 * half wiped — two things arriving in lockstep reads as a slideshow, and waiting for each
 * stage to *finish* before starting the next makes the hero take five seconds to say four
 * things. Every stage here begins before its predecessor ends.
 *
 * The whole sequence is settled by roughly 2.5s. That is the ceiling: it is the one moment
 * on the site allowed to be theatrical, and it is still short enough that a visitor who
 * scrolls immediately loses nothing they needed.
 *
 * Keep this table as the single source of the timing. The individual delays used to be
 * scattered across the JSX and every adjustment meant re-deriving the whole sequence.
 */
const HERO_STAGE = {
  portrait: 0.1,
  signature: 0.3,
  role: 1.1,
  controls: 1.7,
} as const;

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
          {/* Stage 1. The face arrives first and it is the only image on the site that
              uses `ImageReveal` on mount rather than on scroll — it is already in view. */}
          <ImageReveal delay={HERO_STAGE.portrait} onMount>
            <Figure
              src={site.portrait.src}
              alt={site.portrait.alt}
              width={site.portrait.width}
              height={site.portrait.height}
              priority
              sizes="(min-width: 1024px) 22.5rem, 16rem"
            />
          </ImageReveal>
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
              {/* §10.3: the name draws itself in, left to right. Stage 2 of the hero
                  sequence — it starts after the portrait has begun resolving, so the two
                  are not competing for attention in the same instant. */}
              <SignatureReveal delay={HERO_STAGE.signature}>
                <Signature className="w-full max-w-136 text-text" />
              </SignatureReveal>
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
          {/* §10.3's character split. This line, not the `h1`, is where the split lives:
              the heading above is drawn artwork with no characters to split, and this is
              the hero's only typeset line — so it is both the natural place for the
              effect and the one line whose arrival the reader is actually reading. */}
          <SplitText
            as="p"
            delay={HERO_STAGE.role}
            className="max-w-measure font-sans text-heading-1 font-medium text-text"
          >
            {site.role}
          </SplitText>
        </div>

        {/* Two controls. See the header comment before adding a third. */}
        {/* Stage 4, and the last: the controls arrive once the name and the role have
            said who this is. A button that fades in before the sentence explaining it is
            an affordance offered before its context. */}
        <Fade delay={HERO_STAGE.controls}>
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
        </Fade>
      </div>
    </section>
  );
}
