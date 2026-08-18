# Decision log

Append-only. One entry per meaningful deviation from
[PORTFOLIO_SPEC.md](PORTFOLIO_SPEC.md). Newest at the bottom.

Format:

```
## YYYY-MM-DD — Short title
**Context:** what forced the decision
**Decision:** what we do
**Reason:** why this over the alternative
**Affects:** spec sections
```

Under v2 this log is lighter than it was under v1.0. Most choices no longer need a
committee. Record something here when future-you would otherwise wonder whether a
deviation was a choice or an oversight.

---

## 2026-08-15 — Split the dark-mode accent into two roles

**Context:** The original brief offered `#3B82F6` or `#2563EB` as the dark-mode accent
without choosing.
**Decision:** `#3B82F6` for links and accent text; `#2563EB` for filled button surfaces
only, always with white text.
**Reason:** Measured contrast. `#2563EB` on the dark canvas is 3.71:1, which fails AA for
body-size text, while `#3B82F6` reaches 5.21:1. White on `#2563EB` is 5.17:1, which makes
it a sound button fill. The two values are not interchangeable.
**Affects:** §6.1, §6.3

## 2026-08-15 — Added a `border-strong` token to both palettes

**Context:** The original border values measure 1.17 to 1.38:1 against their backgrounds.
**Decision:** Keep those values as `border-subtle` for decorative dividers, and add
`border-strong` (`#8A8279` light, `#6B7385` dark) for the visual boundary of controls.
**Reason:** WCAG 2.2 SC 1.4.11 requires 3:1 for the boundary of a user interface component.
Inputs, outline buttons, and filter chips are identified largely by their border.
**Affects:** §6.1, §6.2, §6.3, §6.8

## 2026-08-15 — v2.0 supersedes the v1.0 MASTERPLAN

**Context:** v1.0 locked in static export, a no-JavaScript rule, first-load-JS budgets, and
blocking CI gates. None of that was ever chosen deliberately; it was inherited from the
first draft's Cloudflare-Pages framing.
**Decision:** Replaced by `docs/PORTFOLIO_SPEC.md` v2.0. Full Next.js feature set is
available, performance work moves to a dedicated phase after the content is real, and
testing, accessibility, and performance checks are advisory rather than merge gates.
`docs/MASTERPLAN.md` deleted from the repo so there is one source of truth.
**Reason:** The spec was spending more of its weight on constraint enforcement than on the
product. Build the right product first, optimize it once it exists.
**Affects:** the whole document; see §2.1 for the constraint-by-constraint reversal

## 2026-08-15 — Dropped `shiki` and `sharp`, and the contrast checker with them

**Context:** Owner excluded both packages. v1.0 depended on `shiki` for build-time
highlighting and `sharp` for a custom image pipeline.
**Decision:** `prism-react-renderer` client-side for code (§12.4); `next/image` with
`images.unoptimized: true` for media (§12.2). `scripts/check-contrast.mjs` deleted along
with them, since it existed only to enforce a CI gate that no longer exists.
**Reason:** Both v1.0 choices bought bundle size and build-time optimization, which stopped
being constraints under v2. The measured ratios the checker produced are quoted inline in
§6.1 and remain accurate; restoring the script later is one file.
**Affects:** §2, §2.1, §12.2, §12.4

## 2026-08-15 — Domain is `mukeremshifa.com`

**Context:** §19 question 1 in the v2 draft was ambiguous: the value supplied read as an
email address rather than a domain.
**Decision:** Canonical origin is `https://mukeremshifa.com`, carried in
`NEXT_PUBLIC_SITE_URL` and consumed by `metadataBase`, `buildMetadata`, the sitemap,
structured data, and the contact endpoint CORS allowlist.
**Reason:** Owner confirmed the domain directly.
**Open sub-question:** which mailbox the site displays and the contact form delivers to is
still unresolved. See §19 question 1.
**Affects:** §2, §13, §14.1, §16.4, §17.2, §18 Phase 0

## 2026-08-15 — Hosting split: Vercel for the app, Cloudflare for the backend

**Context:** §19 question 2 was blocking Phase 0. The zone for `mukeremshifa.com` already
lives in Cloudflare DNS, and the contact endpoint needs somewhere to run.
**Decision:** The Next.js app deploys to Vercel. The contact Worker, object storage (R2),
and DNS stay on Cloudflare. `api.mukeremshifa.com` is reserved now and left unclaimed until
Phase 4. `deploy.yml` is not created; Vercel's GitHub integration builds every push, with
`main` as production and `dev` plus pull requests as previews.
**Reason:** Vercel supports the Next.js feature set with no configuration, which is what
made the v2 rewrite worth doing. Keeping the backend on Cloudflare avoids moving a zone that
already works and keeps R2 available for large assets. The cost of the split is that the
contact endpoint is cross-origin, so §14's CORS allowlist stops being a formality — that is
a known, contained cost. A `deploy.yml` alongside the Git integration would be a second path
to the same deploy with a token to rotate.
**Affects:** §2, §4, §14, §16.3, §16.4, §18 Phase 0, §19

## 2026-08-15 — The apex is the canonical host

**Context:** §19 question 7 left apex versus `www` open, and §13.3 could not describe
canonical URLs precisely without it.
**Decision:** `https://mukeremshifa.com` is canonical. `www.mukeremshifa.com` redirects to
it with a 30x, configured in Vercel. `NEXT_PUBLIC_SITE_URL` matches the canonical form
exactly: no `www`, no trailing slash.
**Reason:** Shorter to say and to print, and it matches how the domain has been written
everywhere in the spec already. Either choice works technically; leaving it open was the
only real cost.
**Affects:** §2, §13.3, §16.4, §17.2

## 2026-08-15 — Syntax highlighting deferred; code blocks are native

**Context:** v2.0 named `prism-react-renderer` as the replacement for `shiki`. Phase 0 is
the last point at which dropping it costs nothing, since nothing has been built against it.
**Decision:** No highlighter. `CodeBlock` renders `<pre><code class="language-{lang}">` with
the raw source as text, styled with IBM Plex Mono on the `code-bg` token, `overflow-x: auto`,
and every accessibility affordance already specified in §8.3. `lib/highlight.ts` is removed
from the repo layout. `language` becomes a plain label feeding the `class="language-*"` hook
and the filename chip, validated against nothing.
**Reason:** Snippets on a portfolio are short and captioned, so colour is decoration rather
than comprehension. Dropping the package removes a client component, a dual-theme
configuration to maintain against §6.2 and §6.3, and a language-id contract that content
would have had to honour. This is deferral, not refusal: the `class="language-*"` hook is
the seam, and adding a highlighter later is contained to `CodeBlock`.
**Affects:** §2, §2.1, §4, §5.3, §8.3, §9.1, §12.4, §18 Phase 0 and Phase 2, §19

## 2026-08-15 — `ci.yml` omits `next build`

**Context:** §16.2 sketches CI as install, quality, unit, build.
**Decision:** The Phase 0 workflow runs `format:check`, `lint`, and `typecheck` only. No
`next build` step, and no unit job until Vitest arrives in Phase 2.
**Reason:** Vercel builds every push already and reports the result on the commit and the
pull request. Repeating the build in Actions adds roughly a minute per push for a signal
that is already there. If Vercel builds ever stop being visible on PRs, this is one step to
add back.
**Affects:** §16.2

## 2026-08-15 — §6 token names reconciled; no colour value changed

**Context:** The token tables and the wiring block disagreed with each other in four places,
so there was no single source of truth to write `globals.css` from. §6.2 named
`surface-sunken`, §6.3 named `surface-raised`, and §6.4 used `--surface-alt` for both.
`brand-soft` was defined in §6.4's dark block but absent from the §6.3 table. `brand-cream`
and `code-bg` were in the tables but not in `@theme inline`.
**Decision:** `surface-alt` is the one name, in both palettes. `brand-soft` added to §6.3
with §6.4's `#16243D`. `@theme inline` gains `--color-brand-cream` and `--color-code-bg`.
`ring` deliberately stays out of `@theme inline` and `brand-cream` deliberately stays
undefined in `:root`; both omissions are now documented in §6.4.
**Reason:** §6.8 already referenced `surface-alt` for card hover and chip backgrounds, so the
wiring block was the half that was right. `ring` is consumed exactly once, as `var(--ring)`
in a raw `outline` declaration — a `ring-ring` utility would be a second spelling of the same
thing. `brand-cream` is dark-only by §6.3's binding rules, and leaving it undefined in light
mode makes misuse visible rather than silently beige-on-white.
**Not changed:** every hex value in §6.2 and §6.3 is untouched. Those ratios were measured
and are quoted in §6.1.
**Affects:** §6.2, §6.3, §6.4

## 2026-08-15 — `content/site.json` pulled forward from Phase 2 to Phase 1

**Context:** §18 puts content schemas in Phase 2, but `SiteFooter` (§7.3) needs identity,
location, and socials to render at all, and the footer ships in Phase 1.
**Decision:** A minimal `content/site.json` with placeholder values per §5.6, read through
`lib/site.ts`, which carries a narrow hand-written TypeScript type covering only the fields
the shell actually consumes. Phase 2 replaces that type with the Zod-derived one from
`lib/schemas.ts` and fills in real values.
**Reason:** The alternative is hard-coding identity into the footer and un-hard-coding it in
Phase 2, which is the same work done twice plus a violation of §9's rule that no component
holds copy. This is a contained pull-forward of one file, not a change to the content model:
no schema, no validation gate, no loader for any other content type.
**Affects:** §5.2, §5.6, §7.3, §18 Phase 1 and Phase 2

## 2026-08-15 — Typography roles confirmed as specified (§19 Q2)

**Context:** §19 question 2 offered to swap the three-family role split before the type scale
was built.
**Decision:** Owner confirmed the default. Source Serif 4 for display and section headings,
Instrument Sans for body and all UI chrome, IBM Plex Mono for code, technology tags, and
eyebrows. §6.6's ten-step scale is implemented against exactly that.
**Reason:** The scale was already sized against this split; nothing had to move.
**Affects:** §6.6, §12.3, §19

## 2026-08-15 — Added `brand-solid-hover` to both palettes

**Context:** §6.8 gives `Button`'s primary variant a brand fill with `brand-contrast`
text, and §10.2 animates the background on hover — but neither §6.2 nor §6.3 defines what
that background hovers *to*. The obvious candidate, `brand-hover`, is defined as the
hover accent for text and links, and in dark mode it is *lighter* than `brand-solid`.
**Decision:** New token `brand-solid-hover`: `#082D85` light (same value as
`brand-hover`, where the roles happen to coincide) and `#1D4ED8` dark.
**Reason:** White on `#60A5FA` measures 2.60:1. Using `brand-hover` as a filled-button
hover would have put the most prominent control on the site below AA on every hover, in
the theme where it is hardest to notice during development. Measured for the new pairing:
`brand-contrast` on `brand-solid-hover` is 12.18:1 light and 6.70:1 dark.
**Known cost:** `#1D4ED8` measures 2.86:1 against the dark canvas, just under SC 1.4.11's
3:1 for a control boundary. It applies only while hovering, the resting state is 3.71:1,
and a solid fill carrying 6.70:1 text is not identified by its boundary. Worth revisiting
if the palette is ever re-measured.
**Affects:** §6.2, §6.3, §6.4, §6.8, §10.2

## 2026-08-15 — Nav active indicator is CSS, not a Motion `layoutId`

**Context:** §10.2 lists the nav active indicator as a Motion `layoutId` underline that
slides between items.
**Decision:** The active route gets `aria-current="page"` and a static 2px underline in
CSS, per §7.2. No `layoutId`, no shared layout animation.
**Reason:** §10's test is binding and it is the arbiter here: remove the animation and
ask whether the interface got harder to understand. It does not. By the time the
underline would slide, the navigation has already happened and the new page is rendering
— the animation describes a transition the user has already completed. The underline's
job is to say which route is active, which it does standing still.
**Also:** `SiteHeader` stays a server component per §9.2. The one thing that genuinely
needs the client is `usePathname`, so the links are split into `components/layout/MainNav.tsx`
as a thin island. §9.2's "islands" framing therefore stays accurate rather than becoming
a polite fiction — which is what the Phase 1 plan flagged as the risk.
**Affects:** §7.2, §9.2, §10.2

## 2026-08-15 — `MobileNavigation` is built on native `<dialog>`

**Context:** §7.2 requires a focus trap, Escape to close, scroll lock, a visible close
button, and focus returned to the trigger. The Phase 1 plan flagged this as the single
most likely thing in the phase to be subtly wrong.
**Decision:** `<dialog>` with `showModal()`, rather than a hand-rolled trap over a `div`.
**Reason:** Four of the five requirements then come from the platform and cannot drift —
the top layer traps focus and makes the background inert, Escape fires `cancel`, `close()`
restores focus to whatever opened it, and initial focus lands on the first focusable
child. Only scroll lock has to be written, and it is three lines. A hand-rolled trap
would be roughly eighty lines of querySelectorAll over a focusable-element list that goes
stale the first time someone adds a control to the panel.
**Cost:** the exit animation has to be sequenced before `close()` rather than after, so
`AnimatePresence`'s `onExitComplete` is what actually closes the dialog. That is the one
non-obvious line in the component and it is commented as such.
**Affects:** §7.2, §9.2, §10.2

## 2026-08-15 — Merge strategy fixed, and `main`'s squashed history reconciled into `dev`

**Context:** PR #1 squash-merged `feat/phase-0-foundations` into `dev`, and PR #2 merged
the result onto `main`. The squash commit carried no ancestral link to the five commits it
contained, so when `dev` was rebuilt on those commits, `merge-base(main, dev)` fell back to
the initial commit — 14 commits on one side, 2 on the other, with identical content.
**Decision:** Three parts.
1. `feat/*` merges into `dev` by **rebase**; `dev` merges into `main` by **fast-forward
   only**; nothing that outlives a merge is ever squashed. `dev` and `main` are never
   force-pushed — rewriting is confined to `feat/*` before it merges.
2. The existing divergence is repaired with a `-s ours` merge of `main` into `dev`. That
   records `main` as a second parent while taking `dev`'s tree verbatim: zero content
   change, verified by tree hash before and after, and `main` becomes an ancestor of `dev`
   so every future promotion is a real fast-forward.
3. Phase completions are tagged on `dev` (`phase-0`, `phase-1`, …) rather than kept alive
   as branches.
**Reason:** Squash merges are right for a branch about to be deleted and wrong for one
that keeps existing, because git then treats the two lines as permanently diverged and
every later merge re-derives from their last true common ancestor. Squashing `dev` into
`main` at the end would also have discarded the granular history on the way in — the same
history the `dev` rebuild existed to recover.
**Alternative rejected:** force-pushing `main` to `dev`'s tip repairs the same divergence
and is tidier, but promotes Phase 1 to production as a side effect. When to deploy is a
deployment decision; it should not be forced by git plumbing.
**Affects:** §16.1, §16.3

## 2026-08-15 — Promote at phase boundaries, behind a crawl block

**Context:** The original intent was to hold `main` until every phase was finished.
**Decision:** `dev` is promoted to `main` at each phase boundary, starting at the end of
Phase 2. `app/robots.ts` disallows all crawling behind an environment flag until Phase 6
flips it.
**Reason:** §16.4 leaves `NEXT_PUBLIC_SITE_URL` unset on previews on purpose, so
`metadataBase` resolves to each deployment's own origin. Canonical URLs, the sitemap,
JSON-LD, and OG image URLs — all of which Phase 2 builds — therefore behave differently in
production than in any environment they are ever tested in. Promoting once at the end
makes launch day the first real exercise of that surface, with five other phases of change
landing simultaneously. A misconfigured environment variable is a five-second fix found
five months late.
**Cost:** an unfinished portfolio is reachable on the production domain. That is what the
crawl block is for: the answer to "do not index this yet" is `robots.ts`, not withholding
the deploy.
**Affects:** §13.3, §16.1, §16.4, §18 Phase 6

## 2026-08-15 — Line endings normalised to LF

**Context:** `core.autocrlf=true` is set on Windows checkouts and there was no
`.gitattributes`. Git stored LF and checked out CRLF, so `pnpm format:check` failed on all
28 tracked source files the moment a branch switch re-materialised the tree.
**Decision:** `.gitattributes` with `* text=auto eol=lf`, plus explicit `binary` rules for
image, font, and PDF extensions. SVG is deliberately left as text so Phase 2's placeholder
assets normalise like any other source.
**Reason:** It was invisible for two reasons that would not have held: files written
directly during Phase 1 already had LF and were never re-checked-out, and CI runs on
Ubuntu where `autocrlf` is off. A fresh clone on Windows would have hit it immediately.
`.gitattributes` overrides `core.autocrlf` regardless of local configuration, so this does
not depend on every machine setting the same git option.
**Affects:** §16.2

## 2026-08-18 — `cover` and `screenshots[]` gain required `width` and `height`

**Context:** §5.3's image objects were `{ src, alt, caption? }`. `next/image` requires
either intrinsic `width` plus `height`, or `fill` inside a sized parent. `images:
{ unoptimized: true }` (§12.2) removes the optimization pipeline; it does not remove that
requirement. A static import would supply the dimensions automatically, but `src` arrives
from JSON as a string, so every content image is dynamic.
**Decision:** Both fields are required positive integers in §5.3 and in
`lib/schemas.ts`. `Figure` takes them as props and renders at the intrinsic ratio.
**Reason:** The alternative is `fill` inside a fixed aspect-ratio box, and Appendix B
rules it out by construction: the golden sample carries six screenshots from 21:9 to 9:16
because mixed ratios are what break a grid, and a fixed box serves them only by
letterboxing or cropping. Dimensions are a fact the author already knows, they are the
only way to hold layout stable for content-driven images of unknown shape (§12.1), and
they keep `Figure`'s contract honest rather than making it guess.
**Cost:** Two more fields per image for whoever writes content, and a schema change that
every future project file has to satisfy. Phase 5 pays this when it captures real assets.
**Affects:** §5.3, §9.1, §12.1

## 2026-08-18 — OG image generation moved from Phase 3 into Phase 2

**Context:** §18 listed OG images under Phase 3, but §17.1 makes "metadata, canonical URL,
and OG image present" part of a page being finished, and Phase 2's exit criterion is that
adding a second project requires zero component changes.
**Decision:** `app/opengraph-image.tsx` and `app/projects/[slug]/opengraph-image.tsx` ship
in Phase 2, generated from content per §13.4.
**Reason:** If generation had landed in Phase 3, adding project #2 during Phase 2 would
have meant adding an OG asset by hand — which makes the exit criterion false on the day it
is written. §13.4 already specifies the card as generated from content, so it is a
component like any other and belongs with the components it depends on.
**Also decided, because it costs an hour otherwise:** `ImageResponse` renders in its own
context (Satori, then Resvg) and cannot see `next/font`'s CSS variables, the `@theme`
tokens, or any Tailwind utility. So the card loads an actual font binary —
`assets/fonts/SourceSerif4-SemiBold.ttf`, committed, because Satori reads `ttf`/`otf`/`woff`
and `next/font` caches `woff2` — and repeats §6.2's light palette as literals in
`lib/og.ts`. That is a real second copy of the palette with no compiler to keep it honest;
it is contained to one file and commented there. One family, not three: the card is
display type almost end to end.
**Affects:** §13.4, §17.1, §18 Phase 2 and Phase 3

## 2026-08-18 — `ProjectRef` is derived, not a fourth content file

**Context:** §5.1's `getAdjacentProjects()` and §9.3's `CaseStudyNavigationProps` both
reference a `ProjectRef` type that §5.3 never declares.
**Decision:** `export type ProjectRef = Pick<Project, "slug" | "title">` in
`lib/schemas.ts`. No schema, no content file, no separate parse.
**Reason:** Prev/next navigation needs a URL and a label. That is a derived view of a
project, not stored content, and inventing a fourth content file to hold two fields that
already exist would create two places where a project's title lives. Deriving it means the
type follows `Project` automatically.
**Affects:** §5.1, §5.3, §9.3

## 2026-08-18 — Internal routes are linked without a trailing slash

**Context:** §4, §7.1, and §8 write every route with a trailing slash (`/projects/`), and
Phase 1 wired the header, footer, and every `Button href` that way. Next's default
`trailingSlash: false` therefore 308-redirected every internal navigation, which surfaced
the moment Phase 2 started emitting canonical URLs and sitemap entries.
**Decision:** Keep Next's default and strip the trailing slash from every internal `href`,
canonical, sitemap entry, and JSON-LD URL. `trailingSlash: true` was tried first and
reverted.
**Reason:** Two things settled it. `MainNav`'s active-route check is
`pathname.startsWith(`${item.href}/`)`, which only ever worked on the bare form —
`trailingSlash: true` silently broke the active indicator on every nested route. And the
`opengraph-image` file convention emits its URL without a trailing slash, so
`trailingSlash: true` put a 308 in front of the one asset that is fetched by third-party
crawlers I do not control. Redirects I own are cheap to remove; redirects other people's
crawlers have to follow are not.
**Cost:** The spec's prose still writes routes with a trailing slash. That is a directory
convention in a file tree, not a URL format, and the served form is now the one canonical
URLs, the sitemap, and the address bar all agree on.
**Affects:** §7.1, §7.2, §13.1, §13.3

## 2026-08-18 — The content gate reports every broken file, not the first

**Context:** §5.1 requires `lib/content.ts` to throw on malformed content with a precise
error. The simple implementation throws at the first failure.
**Decision:** Each file is parsed into a failure list, and one error is thrown at the end
naming every file that failed, each with `z.prettifyError()` output rather than a raw
`ZodError`.
**Reason:** A schema change breaks several project files at once, and fixing them one
build at a time is one build per file. The parse is eager at module evaluation, so the
throw happens once at first import with the offending path named rather than on whichever
selector call happened to touch it first. Verified by breaking two files deliberately and
confirming `next build` names both, then by breaking a file's JSON syntax and confirming
that path is reported the same way.
**Affects:** §5.1

## 2026-08-18 — `noindex` ships alongside `robots.txt`, behind the same flag

**Context:** §13.3, as amended, makes `app/robots.ts` disallow all crawling behind an
environment flag so `dev` can be promoted to `main` at every phase boundary without an
unfinished portfolio being indexed.
**Decision:** `ALLOW_INDEXING` is read once in `lib/metadata.ts`. `app/robots.ts` blocks
everything while it is unset, and `app/layout.tsx` emits `robots: { index: false, follow:
false }` from the same flag. Phase 6 sets it to `true` in Production and both go away
together. The flag opts *in*: unset means blocked.
**Reason:** `robots.txt` stops a crawl. It does not stop a URL that someone links to from
being indexed anyway — Google will index a disallowed URL it cannot fetch if it finds the
link elsewhere. "Do not index an unfinished portfolio" is a claim about the page, and the
meta tag is the mechanism that actually makes it true. One flag, two mechanisms, one thing
to flip.
**Affects:** §13.1, §13.3, §18 Phase 6

## 2026-08-18 — Code blocks carry their scroll affordances unconditionally

**Context:** §8.3 requires `tabindex="0"`, `role="region"`, and an `aria-label` on code
blocks *that overflow*. Whether a block overflows is a property of the viewport, not of the
content: the same snippet scrolls at 320px and does not at 1280px.
**Decision:** `CodeBlock` applies all three to every block. `eslint.config.mjs` widens
`jsx-a11y/no-noninteractive-tabindex` to allow `role="region"` alongside its default
`tabpanel`, once, with the reasoning in the config rather than a suppression at each site.
**Reason:** A measurement at mount is wrong the moment someone resizes, and a measurement
at build time is wrong immediately. A `<pre>` with `overflow-x: auto` *is* a scrollable
region regardless of whether this particular snippet exceeds this particular viewport. The
cost is a tab stop on a block that may not need one; the alternative is content a keyboard
user cannot reach at exactly the widths where it is hardest to read. Verified at 320px: all
four blocks report `scrollWidth > clientWidth`, and the page's own `scrollWidth` is 305px
against a 320px viewport, so the code blocks are §11.5's single permitted exception and
nothing else overflows.
**Affects:** §8.3, §11.2, §11.5, §12.4

## 2026-08-18 — The screenshot gallery is CSS columns, not a grid

**Context:** Appendix B demands six screenshots of mixed aspect ratios, from 21:9 to 9:16.
**Decision:** `ScreenshotGallery` uses `columns-1 md:columns-2` with `break-inside-avoid`,
not `grid`.
**Reason:** A grid puts cells on a shared row height, so mixed ratios either letterbox
inside a fixed box or leave large gaps beside the short ones — and the fixed box is exactly
what the `width`/`height` decision above exists to avoid. Multi-column flow lets every
figure keep its intrinsic height. Reading order stays top-to-bottom within a column, which
is the order the DOM is in, so nothing diverges between what is seen and what is announced.
**Cost:** Column balancing can leave one column short when heights differ sharply. That is
visible with six ratios this extreme and is the honest result of not cropping anything.
**Affects:** §8.3, §9.3

## 2026-08-18 — Invariant 8's vocabulary covers technologies only

**Context:** §5.5 invariant 8 says every technology string must appear in at least one
skills group. `Certification.skills` is also an array of strings.
**Decision:** The test checks `Project.technologies`, `ExperienceEntry.technologies`, and
`FocusPillar.technologies`. `Certification.skills` is out of scope.
**Reason:** Certification skills are competencies ("Cloud architecture"), not technologies.
Forcing them into `skills.json` would make the shared vocabulary the invariant protects
less precise rather than more, and §5.4 deliberately keeps skills grouped by use context
with no proficiency dimension. Noted here so Phase 3 does not re-open it.
**Affects:** §5.4, §5.5

## 2026-08-18 — Phase 2 additions outside §4's file tree

**Context:** Three files exist that §4's repository layout does not list.
**Decision:** `components/ui/CopyButton.tsx` (the `"use client"` island `CodeBlock` needs,
since a server component cannot contain one), `lib/og.ts` (the OG palette and font loader,
shared by two `opengraph-image.tsx` routes), and `assets/fonts/` (the committed `ttf` those
routes read). `vitest.config.mts` rather than `.ts`, because Vite warns that ESM syntax in
a config loaded as CommonJS will break in a future major.
**Reason:** Each is the smallest file that makes an already-specified thing work. The
alternative to `lib/og.ts` is the palette and the font path duplicated across two routes,
which is the drift §6's token discipline exists to prevent.
**Also:** `public/og/` in §4's tree is not created. OG cards are generated at build time by
`ImageResponse`; there is no static asset to put there.
**Affects:** §4, §9.1, §12.4, §13.4

## 2026-08-18 — Stub content becomes the permanent operating assumption

**Context:** Phase 3 builds five pages against a design the owner has not seen, and every
resource they would eventually supply changes anyway: the résumé gets updated, the address
changes, projects are added and retired, credentials expire.
**Decision:** Treat stubs as the operating assumption rather than as a wait state. The
requirement is not "use placeholders until the real thing arrives" but "every resource the
owner would ever supply is swappable by editing `content/` or dropping a file into
`public/`, and nothing they change requires touching a component." `docs/STUB-INVENTORY.md`
carries the swap matrix and the inventory of what is currently synthetic.
**Reason:** Phase 2 proved this for exactly one resource (adding a project) and tested it
literally. Extending it to all of them turns four open §19 questions from blockers into
values. Verified by performing every row: change the value, rebuild, confirm the site
follows, confirm `git status` shows nothing outside `content/` and `public/`, revert. All
rows pass, including removing `portrait` and `resume` entirely and adding and deleting a
project file.
**Cost:** Structurally realistic stubs are hard to tell from real content, which makes
Phase 5's sweep larger and less visible rather than smaller. The inventory is the whole
mitigation, and it stops being one the day it drifts. `tests/unit/stubs.test.ts` holds the
half a machine can check.
**Affects:** §5.2, §5.6, §18 Phases 3 and 5, §19

## 2026-08-18 — `resume.url` accepts a root-relative path; `socials[].url` does not

**Context:** §5.2 typed `resume.url` as `z.url()`, which `/placeholders/placeholder-resume.pdf`
fails.
**Decision:** A shared `AssetPathOrUrl` union accepts an absolute URL or a root-relative
path, and `resume.url` uses it. `socials[].url` stays `z.url()`.
**Reason:** The résumé is a same-origin asset. The only alternative was writing the
production origin into a content file, which hard-codes the value `SITE_ORIGIN` exists to
derive exactly once — it would break on localhost and emit a production URL from every
preview (§16.4). The union is deliberately not applied to socials: those destinations are
genuinely external, and a relative social link is always a mistake rather than a case worth
admitting.
**Affects:** §5.2, §16.4

## 2026-08-18 — `site.portrait` added, and its optionality is the feature

**Context:** §8.1 names `ProfileVisual` and requires the hero to collapse to a single
column when it is absent, but §5.2 gave it no source at all.
**Decision:** An optional `portrait` on `SiteSchema`, shaped like §5.3's images and
carrying the same required `width`/`height`. Placeholder at
`public/placeholders/placeholder-portrait-4x5.svg`, 1000×1250.
**Reason:** Optional is load-bearing rather than incidental. Absence has to be reachable by
deleting the field, because that is the state the owner lands in when the real photograph
does not arrive, and §8.1 specifies what the layout does there. Verified by deleting the
field and rebuilding: the hero renders one column and the `Person` graph carries no
`image`.
**Also:** The schema's `alt: z.string().min(10)` will want revisiting in Phase 5. A
portrait beside its subject's own name and role is arguably decorative under §11.4, which
would want `alt=""`, and the schema forbids it. Noted rather than weakened for a
placeholder.
**Affects:** §5.2, §8.1, §11.4

## 2026-08-18 — `/contact/` ships in Phase 3, without the form

**Context:** §18 gave `/contact/` to Phase 4, but §7.1 lists it as a route, Phase 3's exit
criterion is that every route in §7.1 is built, and the header CTA, the footer, and every
`ContactCallout` link to it.
**Decision:** Build the page now on §8.7's degraded path: `h1`, lead, the direct `mailto:`,
LinkedIn, GitHub. No form, no honeypot, no submission live region. Phase 4 adds
`ContactForm` behind `site.contact.endpoint` at a marked slot, and nothing else moves.
**Reason:** Shipping a phase whose most prominent call to action is a 404 is worse than
shipping the page. This is not a Phase 4 behaviour built early: §8.7 already specifies that
the form renders only when the endpoint exists and that without it the page shows the
direct channels alone, and `content/site.json` carries no endpoint. §21 forbids "coming
soon" sections, and the direct channels are a finished way to make contact rather than a
stand-in for one.
**Affects:** §8.7, §18 Phases 3 and 4

## 2026-08-18 — The section rhythm is §6.7's, and the section dividers go

**Context:** §6.7 specifies 64px mobile and 112px desktop section padding, and a 32px gap
between a section heading and its content. Phase 2's `/projects/[slug]/` shipped 48 and 24.
With one page that was invisible; with seven it is the thing that makes a site look
unconsidered.
**Decision:** Keep §6.7's numbers unchanged, name them once as `--spacing-section`,
`--spacing-section-lg`, and `--spacing-heading` so every page spells the rhythm as
`py-section md:py-section-lg` and `gap-heading`, and retrofit `/projects/[slug]/` in the
same commit. Remove that page's per-section `border-t`.
**Reason:** The alternative was re-deciding a design number the owner has not seen yet,
which is exactly what this phase exists to let them do. Naming the values means changing
the rhythm later is three lines in `globals.css` rather than a search. The dividers go
because at 112px the space is already the break, and a rule on top of it made a long
technical page read like a settings screen — §6.7 asks for a border on cards, not between
sections. The one divider that survives is `CaseStudyNavigation`'s, where it separates the
article from the way out of it.
**Affects:** §6.7, §8.3

## 2026-08-18 — The project filter is a toolbar with `aria-pressed`

**Context:** §8.2 conveys selection with text weight, a border change, and `aria-pressed`,
which is toggle-button semantics. §11.2 wants arrow keys between options with Enter or
Space selecting, which is radiogroup or toolbar semantics. `aria-pressed` and a radiogroup
are incompatible; the radiogroup spelling is `aria-checked`.
**Decision:** `role="toolbar"` with `aria-pressed` buttons and a roving `tabindex`. One
button holds `tabindex="0"` and the rest `-1`; arrow keys move focus, Home and End jump to
the ends, and Enter and Space select by native button behaviour.
**Reason:** It honours §8.2's explicit `aria-pressed` and gets §11.2's arrow keys from the
pattern toolbars exist for, without either section having to give. Focus is moved
imperatively only in response to a key press, never on mount — a component that focuses
itself when it renders takes focus from wherever the reader actually was.
**Also:** ESLint needed no widening. The `no-noninteractive-tabindex` rule that `CodeBlock`
ran into is about non-interactive elements, and these are buttons.
**Affects:** §8.2, §11.2

## 2026-08-18 — §10.2's filter animation gets a third motion wrapper

**Context:** §10.2 specifies that the project filter uses Motion `layout` so cards
reposition over `base`. §9.4 makes `components/motion/*` the only importers of
`motion/react`, and neither `Reveal` nor `Stagger` exposes `layout`.
**Decision:** Add `components/motion/LayoutItem.tsx`, a thin `motion.div` or `motion.li`
with `layout` and the `base` duration. `ProjectGrid` composes it and does not import Motion.
**Reason:** §10's binding test first: remove the repositioning and filtering becomes a grid
whose contents are replaced in place, with nothing to tell the reader which cards survived
the filter from which are new. That is movement carrying information, unlike Phase 1's nav
underline, which described a navigation the user had already completed. Given that it
ships, it needs a home — §9.4's islands framing stops being true the moment one domain
component reaches past it, and Phase 1 already paid to keep that honest once.
**Also:** `MotionConfig reducedMotion="user"` covers reduced motion, since a `layout`
animation is a transform: filtered cards jump rather than glide.
**Affects:** §9.4, §10.2

## 2026-08-18 — `headingLevel` widens to include `h2`

**Context:** §9.3 types `headingLevel` as `"h3" | "h4"`, written when the only consumer was
a section on the home page. Walking the heading outline of the built HTML showed
`/projects/`, `/experience/`, and `/certifications/` each skipping from `h1` to `h3`.
**Decision:** One shared `HeadingLevel = "h2" | "h3" | "h4"`, used by `ProjectCard`,
`ProjectGrid`, `CertificationCard`, `CertificationGrid`, `ExperienceEntry`, and
`ExperienceTimeline`. The three index routes pass `h2`.
**Reason:** On an index route the item *is* a top-level item under the page `h1`, so `h2`
is the correct level, and §11.1's "heading levels never skip" is not otherwise satisfiable.
The alternative was a visually hidden `h2` above each list, which puts a real element into
the accessibility tree purely to fill a gap in a prop type.
**Affects:** §9.3, §11.1

## 2026-08-18 — Every static route keeps the root OG card

**Context:** §13.4 targets 1200×630 per route plus one per project, but the card it
specifies carries project title, category, and wordmark — content only projects have.
**Decision:** The five static routes fall through to `app/opengraph-image.tsx`. Only
projects get a generated card of their own.
**Reason:** When someone shares `/about`, the accurate thing to show is the name and the
role, which is exactly what the root card already renders. Five near-identical cards
differing only in a page title is five build steps for no gain. Logged so Phase 6 revisits
it deliberately rather than discovering it.
**Affects:** §13.4

## 2026-08-18 — `jsonLdScript`'s escape was a no-op, and had been since Phase 2

**Context:** `jsonLdScript` replaced `<` with a replacement written as a unicode escape. In
a JavaScript source file that evaluates to the character `<`, so the call replaced `<` with
itself.
**Decision:** The replacement is now the escape sequence as literal characters. A test in
`tests/unit/structured-data.test.ts` asserts on the serialised output rather than on the
intent.
**Reason:** Worth recording because the broken version reads exactly like the working one
and survived review twice. It only mattered once content could contain markup — a snippet
containing a closing script tag would have ended the JSON-LD block early — and Phase 3's
snippets contain plenty of angle brackets. Logged so nobody simplifies it back.
**Affects:** §13.2

## 2026-08-18 — Phase 3 additions outside §4's file tree

**Context:** Four modules exist that §4's repository layout does not list.
**Decision:** `components/projects/ProjectExplorer.tsx` is the one client island holding
filter state, so `app/projects/page.tsx` can stay a server component that reads content and
passes it down. `components/projects/CaseStudySummary.tsx` is the challenge, decision, and
outcome list, extracted when the home page needed the same three rows as
`/projects/[slug]/`. `components/motion/LayoutItem.tsx` is above. `getCategoryFilters`
lives in `lib/content.ts` rather than `lib/utils.ts` because it needs the `Category` enum at
runtime, and `lib/utils.ts` is imported by client components — a value import of the schema
module there would pull Zod into the browser bundle for a three-element array.
**Reason:** Each is the smallest file that makes an already-specified thing work, which is
the test `CopyButton` and `lib/og.ts` passed in Phase 2.
**Also:** `ContactCallout` stays in `components/home/` where §4 puts it, even though three
routes render it. One component is what stops the closing call to action saying one thing
at the bottom of the home page and something else at the bottom of a project.
**Affects:** §4, §5.1, §9.3

## 2026-08-18 — `brand` on `surface-alt` fails AA in dark mode, so card links brighten on card hover

**Context:** §6.8 shifts a card's background to `surface-alt` on hover, and Phase 3 is the
first phase to put brand-coloured links *inside* cards. Measured across every pairing this
phase introduces: `brand` (`#3b82f6`) on dark `surface-alt` (`#1d2536`) is **4.17:1**, under
AA for body-size text. At rest, on `surface`, the same link is 4.63:1 and passes.
**Decision:** Links inside a hover-shifting card carry `group-hover:text-brand-hover`, so
they brighten with the background instead of being left behind by it. `brand-hover` on
`surface-alt` measures 6.03:1 dark and 9.75:1 light. Applied in `ProjectCard` and
`CertificationCard`.
**Reason:** The failure only exists in the hover state, which is exactly the state a
contrast check done by eye never catches — the pointer is on the element and the reviewer is
looking at the cursor. It was found by computing all 36 pairings this phase introduces from
the token values in `globals.css` rather than by inspection.
**Also, for whoever adds the next card:** `brand` on `surface-alt` is not a usable pairing
in dark mode. Anything brand-coloured that can end up on `surface-alt` needs `brand-hover`,
which is the same shape of problem `brand-solid-hover` was added for in v2.1.2.
**Affects:** §6.1, §6.3, §6.8, §11.4
