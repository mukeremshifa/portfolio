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

## 2026-08-18 — Every static route points at the root OG card, because the convention does not cascade

**Context:** §13.4 targets 1200×630 per route plus one per project, but the card it
specifies carries project title, category, and wordmark — content only projects have. The
plan was to let the five static routes fall through to `app/opengraph-image.tsx`.
**Decision:** They do not fall through, so `buildMetadata` defaults `image` to
`/opengraph-image` and takes `image: null` from the two routes that generate a card in
their own segment.
**Reason:** The `opengraph-image` file convention sets the image **for the segment it sits
in**, not for that segment's children. `app/opengraph-image.tsx` therefore covered `/`
alone, and `/projects`, `/experience`, `/about`, `/certifications`, and `/contact` were
emitting no `og:image` at all — worse than either option that had been weighed. Found by
reading `og:image` off the built HTML rather than by reasoning about the convention. The
alternative fix was five files re-exporting the root route, which generates five identical
PNGs at build time to say one thing.
**Cost:** The default URL carries no cache-busting hash, which only the convention can
append. It resolves either way; revalidation after a redeploy is weaker.
**Also:** When someone shares `/about`, the accurate thing to show is still the name and
the role, which is what the root card renders. Phase 6 can revisit per-route cards
deliberately rather than discovering the question.
**Affects:** §13.1, §13.4

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

## 2026-08-30 — Dark surfaces re-anchored on the landing-page-design B4 list

> **Superseded 2026-08-31** — "The palette had a blue axis in both themes". None of the
> values below is current; B4's list no longer governs the dark stack.

**Context:** The `landing-page-design` skill was added to the repo, and its B4 rule
permits exactly six dark background values: `#000000`, `#181818`, `#1F1F1F`, `#272727`,
`#313131`, `#131209`. The shipped espresso stack (`#141210` / `#1E1B18` / `#282420` /
`#191714`) used none of them.
**Decision:** `canvas` → `#131209`, `surface` → `#181818`, `surface-alt` → `#272727`,
`code-bg` → `#181818`, `border-subtle` → `#313131`. Light mode is untouched; B4's list is
dark-only.
**Reason:** The existing stack mapped onto the list almost 1:1 by luminance, so the
elevation ladder survives unchanged. `#131209` is B4's only warm value *and* its darkest,
so it can occupy exactly one slot — `canvas` — which is the one that covers the most
screen and carries the espresso character. The neutrals above it sit at L=0.0091 and
0.0203, where the temperature break against a 0.0059 canvas is not perceptible. The cost
is that a card no longer carries warmth on its own; on a page where cards are the majority
surface that would have been the wrong trade, and here it is not.
**Affects:** §6.1, §6.3, §6.4

## 2026-08-30 — Dark `border-strong` was failing the rule it was added to satisfy

**Context:** Re-measuring for the B4 change showed dark `border-strong` (`#524A42`) at
2.04:1 on `surface` and 1.72:1 on `surface-alt`. §6.1(a) added the token specifically to
hold 3:1 for WCAG 2.2 SC 1.4.11, and §6.1 claimed `#333333`, which measures worse still.
The token is the sole boundary on secondary buttons, the theme toggle, the mobile nav
toggle, the copy button, the skip link, and unselected filter chips.
**Decision:** Dark `border-strong` → `#7A7168`.
**Reason:** It is the lowest warm value that clears 3:1 against every surface it sits on
(3.93 canvas, 3.71 surface, 3.12 surface-alt), including the `surface-alt` hover state that
was the binding constraint. Going lighter would buy margin the rule does not ask for and
start reading as content rather than boundary. This is a pre-existing defect that the
token revision surfaced, not one it introduced.
**Affects:** §6.1, §6.3, §6.8

## 2026-08-30 — B4's background list does not govern brand tints

**Context:** Read literally, "dark mode background colors: use only these" would outlaw
`brand-soft` (`#172A21`) and `brand-solid` (`#184E38`), since both are painted as
backgrounds.
**Decision:** B4's list governs surface and page backgrounds. Brand tints and fills are
accent colour and are out of its scope.
**Reason:** The alternative reading deletes every tinted badge and every filled button from
the system, which is plainly not what a rule about *background colors* in a list of neutral
greys is reaching for. Recording the reading so a later audit does not re-open it — or
apply the rule to `brand-solid` and wonder why the primary button turned grey.
**Affects:** §6.1, §6.3

## 2026-08-30 — Hero heading is the system's one gradient

**Context:** B5 requires the hero heading to be gradient text: `#FFFFFF` → `#9B9B9B` dark,
`#000000` → `#666666` light. The hero `h1` was flat `text-text`.
**Decision:** Added `hero-from` / `hero-to` to both palettes, mapped them into
`@theme inline`, and applied them to the hero `h1` via `bg-clip-text`. A `.hero-heading`
rule restores a painted colour under `forced-colors` and `print`.
**Reason:** B4 forbids background gradients outright and B5 carves out exactly one
exception, on text. Keeping the stops as tokens rather than literals means the pairing is
re-measurable like every other value in §6.2 and §6.3 (`#666666` is 4.90:1 on the light
canvas, `#9B9B9B` is 6.76:1 on the dark one). The forced-colors fallback is not optional:
`bg-clip-text` makes the glyphs transparent, and a mode that discards backgrounds would
otherwise erase the largest heading on the site.
**Affects:** §6.2, §6.3, §6.4, §8.1

## 2026-08-30 — §6.2 and §6.3 re-derived from the stylesheet

**Context:** The spec described a cobalt light palette (`#0A39A6`) and an orange dark
accent (`#FF5100`) over a pure-black stack. The stylesheet had shipped deep emerald
(`#184E38`) and warm sage (`#52B788`) over espresso charcoal for some time, with no entry
here. Several measured ratios quoted in component comments were the orange palette's and
had outlived it — `brand` on `surface-alt` was documented at 4.17:1 and actually measures
6.04:1.
**Decision:** §6.1(b), §6.2, §6.3, and §6.4's code block now match `app/globals.css`.
Stale ratios in `ProjectCard`, `CertificationCard`, and `StatusBadge` were re-measured.
**Reason:** `globals.css` opens by saying the ratios behind its values are quoted in §6.1
and that changing a hex makes §6.1 a lie. §6.1 was already a lie, which made every quoted
number in the codebase untrustworthy at exactly the moment a token revision needed to trust
them. The palette change itself is not re-litigated here; only the record is corrected.
**Affects:** §6.1, §6.2, §6.3, §6.4

## 2026-08-30 — A drawn identity, and the font that is not in the repo

**Context:** The site had no brand assets at all: no favicon, no app icons, no manifest,
and an OG card that identified itself with the two letters in `site.wordmark`. A display
face (Halimun, Creatype Studio) was chosen for a monogram and a signature wordmark.
**Decision:** Every mark is generated once from the OTF by `scripts/build_brand.py` and
committed as outlines — SVG paths, a generated `lib/brand-marks.ts`, and PNG/ICO rasters.
The font is **not** vendored, is not a `next/font` family, and is not a build dependency.
`site.wordmark` moved from `MK` to `MS`.
**Reason:** The site needs eight fixed strings of this face, not the face. None of them is
authored content — they are artwork that happens to be lettering — so nothing is lost by
freezing them, and a fourth font family plus its weights is avoided entirely. The vector
marks total ~18 KB.

There is also a licence to respect, and it is the reason this entry exists rather than a
comment: **the file the outlines were drawn from is Creatype Studio's demo release, which
is personal-use only.** Outlining does not launder that — the artwork is still derived
from the face. A commercial licence (creatypestudio.co/halimun) is an **open obligation
before the site goes public**, and Phase 6's launch checklist should not pass without it.
Not vendoring the binary at least keeps the repo from redistributing it in the meantime.
**Affects:** §6.6, §13.4

## 2026-08-30 — The mark reduces to one letter below 48px

**Context:** Halimun is a ~29/1000em monoline. At a 32px favicon that stroke is under one
device pixel, and the interlocked `MS` — whose S is set 30% into the M's ink — loses the S
into the M's right stem entirely. Rendered at 16/32/48, it was a smudge.
**Decision:** A two-tier mark. `MS` is the identity and takes every surface with room:
header, hero, OG cards, apple-touch, the 192/512 manifest icons, the social avatar. The
single `M` takes `favicon.ico`, `app/icon.svg`, and the maskable icon. Rasters at or below
64px are additionally dilated by stroking each outline in its own colour, per
`DILATE_BY_PX`.
**Reason:** A mark that is not legible is not a mark, and the usual fix — thickening the
strokes until they read — closes this face's loops and turns the S into a blob well before
it turns it into a letter. Dropping to one letter is the standard responsive-logo answer
and costs nothing: the tab is not where anyone learns your initials. The maskable icon is
the `M` for a second reason — launchers crop it to an arbitrary shape, and two letters do
not survive a circular crop.
**Affects:** §6.7, §13.4

## 2026-08-30 — The hero heading became artwork, with the text kept underneath

**Context:** §6.6 fixes three families and B5 makes the hero `h1` the system's one
gradient. Setting the hero in a fourth, unvendored face contradicts both.
**Decision:** The `h1` renders `components/brand/Signature.tsx` — "Mukerem Shifa" as
outlines — with a `sr-only` copy of the name beside it and `aria-hidden` on the SVG. The
gradient survives the move: the `<linearGradient>` stops read `--hero-from` / `--hero-to`,
the same two tokens `bg-clip-text` consumed. The branch is guarded on
`site.name === SIGNATURE.text`; any other name falls back to the typeset gradient heading.
**Reason:** The accessible name, the copy-paste, and what a crawler indexes all stay real
text — the outlines are only what sighted users see, so this is a rendering change rather
than a content one. Keeping the stops as tokens means §6.2/§6.3 still own both themes;
had the SVG been referenced through `<img>`, they could not have reached inside it, which
is also why `lib/brand-marks.ts` exists next to the `.svg` files. The guard matters more
than it looks: the artwork spells one specific string, and without it a future edit to
`site.name` would leave the largest element on the page quietly asserting the old one.
Forced-colors and print are handled as B5's heading already was, one rule further down in
`globals.css`.
**Affects:** §6.6, §8.1

## 2026-08-30 — The header takes a word, not the initials

**Context:** The header home link drew the `MS` monogram at 36px. In a 64px bar it read as
incidental rather than delicate — 61px of hairline against five nav items. The full
signature was the obvious alternative and is worse: its -70 tracking is a display value,
and at the ~26px cap a header allows it welds "m Shifa" into one unreadable shape.
**Decision:** A third mark, `WORDMARK_FIRST` — "Mukerem." — set at -20 tracking and closed
with a period. The monogram moves to the footer; the full signature stays in the hero.
**Reason:** Tracking does not scale with type size, which is the whole reason the full name
fails up there and the reason this mark is generated separately rather than cropped out of
the signature. One word at 162px fills the slot without competing with the hero, and the
period stops it reading as a truncated first name. It also gives each mark one job — header
word, hero signature, footer monogram — so no page shows the same artwork twice.

Note what this cost: **Halimun has no punctuation.** Its 71 glyphs are the Latin alphabet,
the digits, and `!$?@`. The period is drawn — a circle at the pen's weight on the baseline,
`Dot` in `scripts/build_brand.py`. That is the only letterform in this system that is mine
rather than the designer's, and it is deliberately the simplest possible shape.
**Affects:** §7.2, §13.5

## 2026-08-30 — The signature's gradient is not B5's, and the two themes are not symmetric

**Context:** The drawn signature inherited B5's hero stops: `#000000` → `#666666` light,
`#ffffff` → `#9b9b9b` dark. In dark the fade reads as the ink receding into the page. In
light it reads as nothing.
**Decision:** New `--signature-from` / `--signature-to` in both palettes. Dark keeps the
values that already worked. Light becomes `#000000` → `#8a8279`. B5's `--hero-*` pair is
untouched and still drives the typeset fallback heading.
**Reason:** The measurements say the opposite of what the eye does, which is why this is
worth recording. Light's original `#000000` → `#666666` is the *larger* drop in lightness
of the two, and its tail holds 4.90:1; dark's tail is 6.76:1, comfortably legible, and yet
dark is the one that looks dramatic. Against a cream ground both light stops simply read as
"a dark line" and the eye normalises the difference away, so matching the *appearance*
costs contrast that matching the *numbers* does not.

`#8a8279` is `border-strong`'s light value, not a new number: the lowest the palette
already trusts to be reliably perceivable. At 3.23:1 on canvas it clears SC 1.4.11's 3:1
for non-text, which is the correct bar — the signature is `aria-hidden` artwork and the
heading's real text sits beside it in a `sr-only` span. Borrowing B5's stops would have
meant holding artwork to a text threshold it does not owe, and looking wrong to do it.
**Affects:** §6.2, §6.3, §8.1

## 2026-08-30 — The monogram seals the footer

**Context:** The footer opened with `site.name` in serif and carried none of the identity.
**Decision:** The `MS` monogram sits above that line at 52px in `text-muted`. The name stays
set, in the line below it and again in the copyright.
**Reason:** It is where the monogram earns its place now that the header has a word: on
inner routes, which have no hero, the footer is the only drawn mark on the page. `text-muted`
and not `text` because it is a sign-off under the content rather than a second masthead, and
it carries no accessible name because the name is set twice within a few lines of it —
labelling the picture would only add a third.
**Affects:** §7.3, §13.5

## 2026-08-30 — The availability badge ships off, and one flag was never enough to silence it

**Context:** Phase 5's first pass asked the owner for the identity facts. Availability came
back as "hide the badge entirely." The swap matrix promised that was one edit: "`show: false`
and it disappears everywhere."
**Decision:** `availability.show: false`. `location.remote` stays `true`, so the footer still
reads "Based in Ras al-Khaimah, UAE · Available remotely". `state` and `label` keep their
Phase 3 stub strings and go inert.
**Reason:** The matrix was wrong, and the error is the reason this is worth an entry.
`SiteFooter` never reads `availability` at all — its remote line is `location.remote`. Hiding
the badge silences the hero and nothing else, so "does the site still say you are available?"
had a second answer nobody had noticed. Put to the owner as two separate claims — "open to
roles" versus "this is how I work" — the answer was to drop the first and keep the second,
which the one-flag model could not express.

`state` and `label` stay rather than being blanked because the schema requires both and there
is no honest value for a string that renders nowhere. The inventory records them as inert so
that flipping `show` back on is understood as writing them fresh, not as revealing something
already true.

**Cost:** one concept now lives in two objects with nothing enforcing agreement between them.
Going quiet site-wide is two edits in two places and easy to half-do — precisely the failure
that just happened in the docs. The alternative, folding `remote` into `availability`, would
collapse a distinction the owner used, so the split stays and the comment in `Hero.tsx` plus
both matrix rows now name the other half.
**Affects:** §5.2, §7.3, §8.1

## 2026-08-30 — The project page loses two sections and merges two more

**Context:** §8.3 gave a project page six body sections: Overview, What it does, Key features,
Code highlights, Screenshots, Lessons learned, then the case study. Phase 5 began authoring
real projects against that shape and it did not survive contact.
**Decision:** Three fields leave `ProjectSchema`. `capabilities` folds into `features`;
`codeSnippets` and `screenshots` are removed outright. A project carries one image, its
`cover`. The merged section keeps the name "Key features" and the title-plus-body shape, and
bullets are now reserved for "Lessons learned".
**Reason:** "What it does" and "Key features" were two headings over one idea. Rendered as a
bulleted list directly above a grid of titled blocks, the page asked the reader to find a
distinction the author had not drawn — and authoring real content is where that surfaced,
because the second list is only hard to write when the facts are real. Reserving bullets for
lessons leaves each list shape meaning one thing.

The screenshots went for a reason the stub set actively hid: six placeholder SVGs at mixed
aspect ratios exercise a column layout beautifully and look nothing like six real captures of
one application, which are near-identical rectangles of dense UI that no reader studies. One
cover, chosen deliberately, carries more than a gallery nobody scrolls.

**Cost, and it is real.** `CodeHighlight` and `ScreenshotGallery` are now reachable from no
page. Both are kept — the accessible `<pre>` scroll region and the mixed-ratio column layout
are correct and slow to rebuild — so the tree now contains two components nothing imports,
which every convention here otherwise treats as a defect. §9.3 and `lib/schemas.ts` both say
so at the point a reader would find them. `CodeSnippet` and `Screenshot` survive as standalone
schemas for the same reason: a component with no type does not compile.

`projectJsonLd` also loses `programmingLanguage`. It was derived from the snippet languages —
the honest answer, being the code actually on the page. The only remaining candidate is
`technologies`, a superset carrying databases and infrastructure, and asserting that is worse
than omitting the property.

Appendix B's golden sample is amended rather than deleted, and §5.3's intrinsic-dimensions
rule is restated rather than dropped: its original argument rested on mixed-ratio screenshots
that no longer exist, but the conclusion holds harder than before, since the cover is
`priority`, above the fold, and now the only image on the page.
**Affects:** §5.3, §8.3, §9.3, §13.2, Appendix B

## 2026-08-31 — The home page stops previewing a case study, and `cover` becomes optional

**Context:** The real project set landed: four projects the owner wrote, replacing six
synthetic ones. Two things did not survive the substitution. The home page's "Featured case
study" section promoted one project to a full `challenge`/`decision`/`outcome` block, and
`cover` was required on every project — including work too small to justify sourcing an
image for.
**Decision:** `<FeaturedCaseStudy>`, `getFeaturedCaseStudy()`, `site.featuredCaseStudySlug`,
and §5.5 invariant 4 are all removed; the component file is deleted. `cover` becomes
optional, which defines a second content shape — a *brief* project — without a second
schema. Templates for both shapes live in `docs/templates/`.
**Reason:** Every project page is now written as a case study, and `CaseStudySummary` renders
the same three fields under the same three labels on both pages. The home section was a
preview of a page that a card one section above it already linked to, and one content field
decided which project got told twice. Removing it also removed the invariant most likely to
take the site down: `getFeaturedCaseStudy()` threw when its slug stopped resolving, so
deleting a project file could break every route, including routes with no relationship to it.

Optional `cover` costs almost nothing to support because `ProjectCard` only ever rendered a
cover in its `featured` variant. A brief project is therefore indistinguishable on
`/projects/` — the absence shows on its own page and in its JSON-LD, not in the grid. The
alternative, a `kind: "full" | "brief"` discriminator, would have bought enforcement of a
convention that needs none and cost a second code path: as it stands, adding a `caseStudy`
block promotes a project and deleting one demotes it, with no migration in between.

**Cost.** `FeaturedCaseStudy.tsx` is deleted rather than retained, which is the opposite of
the treatment `CodeHighlight` and `ScreenshotGallery` got the day before. The distinction is
deliberate and worth stating: those two hold craft that is slow to rebuild — an accessible
`<pre>` scroll region, a mixed-ratio column layout — while `FeaturedCaseStudy` was a heading,
a `CaseStudySummary`, and a link. Retaining it would have made three orphans, and §9.3 says
two is already the limit.

`projectJsonLd` now omits `image` for a coverless project rather than falling back to the
site's OG card, which would assert that a generic graphic depicts specific work.
**Affects:** §5.2, §5.3, §5.5, §8.1, §13.2

## 2026-08-31 — One vocabulary across three pages, derived from the projects rather than aspiration

**Context:** The site described its own stack in three places and they disagreed. The home
page's `TechnologyList` advertised LangChain, TensorFlow and Keras; `skills.json` claimed
Kubernetes, Terraform, Grafana, OpenTelemetry, FastAPI and pgvector; the seven real project
files used 46 technology strings, 38 of which appeared in no skills group. All three were
written before the real projects existed.
**Decision:** `skills.json` and `focus.json` are rebuilt from `content/projects/` alone.
Eight skill groups covering exactly the 43 strings the projects use — nothing more, nothing
less. Three focus pillars derived from what recurs across the work. `TechnologyList` becomes
a curated 18 drawn from the same set, plus Next.js.
**Reason:** Invariant 8 now closes in both directions, which it never has before: no project
technology is missing from a group, and no group lists something no project uses. The second
half is the new part and the more useful one — the old file's failure was not that it omitted
Hono, it was that it claimed Kubernetes. A skills page is a claim a reader can check against
the case studies one click away, and that is the only reason to have one.

Four near-duplicate strings were normalised first, because otherwise the skills page would
have had to list both halves of each pair to satisfy the invariant: `React 19` → `React`,
`Groq LLM API` → `Groq`, `Supabase (Auth, RLS, Edge Functions)` and `Supabase PostgreSQL` →
`Supabase`, `Tailwind CSS v4` → `Tailwind CSS`, plus `ts-fsrs`, `AWS S3` and `RAG` losing
their parentheticals. Version numbers and feature lists belong in a project's prose, where
they can be qualified, not in a tag that has to match another page exactly.

**Next.js is the one entry on the home row no project supports**, and it is called out in
the file. It is defensible because this site is the evidence — but it is the bar, not a
precedent: the previous list's TensorFlow had no such backing.
**Cost:** `focus.json`'s three pillars are a claim about emphasis, not a fact derivable from
the files. The evidence supports them; another three could also be supported. That one is
the owner's to confirm, and the inventory says so rather than marking the row closed.

Simple Icons was evaluated for replacement and kept: at 3445 icons it covers the entire real
stack including Hono, Drizzle, shadcn/ui, Deno, Cloudflare Workers and TanStack. It carries
no OpenAI, Groq, AWS or Java mark — all withdrawn over trademark policy — so those cannot
appear on the home row with an icon. `java` left `BrandIconName` for a related reason: it
was mapped to `siOpenjdk`, putting an OpenJDK duke on a chip labelled "Java". `Claude` now
uses `siClaude` rather than `siAnthropic`, the company mark having stood in for the product.
**Affects:** §5.4, §5.5, §8.1, §8.5, §13.5

## 2026-08-31 — The credential schema's `skills` floor met four credentials that have none

**Context:** The owner's eleven real certifications replaced five invented ones. Four of them
— HCIA-Security V4.0, Formal Languages and Applications, Operating Systems, and Advanced
Algorithms and Complexity — carry no skill tags at their source. `CertificationSchema`
requires between two and four.
**Decision:** Two skills were derived per credential from the credential's own title, and
every one is recorded in `docs/STUB-INVENTORY.md` as unverified. The schema floor stays.
**Reason:** The floor exists for the card: one chip under a credential title reads as a
rendering fault rather than a fact, and zero chips leaves a gap the layout has to absorb.
Lowering `min(2)` to fix four rows would weaken the constraint for every future credential to
accommodate the four that happen to be sparse today — the same trade §5.2 already refused for
`portrait.alt`, and refusing it consistently is the point.

Deriving from the title is a narrow enough operation to be defensible: "Operating Systems"
yields *Operating Systems* and *Concurrency*, "Advanced Algorithms and Complexity" yields
*Algorithms* and *Computational Complexity*. These restate the credential rather than
characterising what the holder can do with it. **They are still the only claims in that file
nobody has checked**, which is why they are inventoried rather than treated as done.

Two Huawei credentials carry a credential ID but no verify URL, so §13.2 keeps them out of
the JSON-LD while §8.6 still renders them in prose — nine of eleven reach the graph. That
split is the existing design working as specified, not a gap.
**Affects:** §5.4, §8.6, §13.2

## 2026-08-31 — Education left the experience timeline, and the enum member left with it

**Context:** `ExperienceSchema` carried `"education"` among its `type` values, so the AURAK
BSc and a secondary-school diploma rendered as timeline entries beside jobs, under a `role`
field holding "Bachelor of Science, Computer Science."
**Decision:** New `EducationSchema` and `content/education/education.json`, rendered by
`EducationList` in a new Education section on `/about/`. `"education"` is **deleted** from
`ExperienceSchema`'s `type` enum.
**Reason:** Moving only the rendering would have left the enum inviting the next degree
straight back into the timeline, where it would have looked deliberate. Deleting the member
makes the wrong placement a validation error instead of a judgement call, and because
`EXPERIENCE_TYPE_LABELS` is keyed by the enum, the compiler names the one other place that
had to change.

The new schema is not an experience entry with renamed fields. An experience entry has a
`role` you performed and `achievements` you can be credited with; a qualification has a
`credential` you were awarded and at most a note about it. Reusing the employment shape is
what produced "role: Bachelor of Science" in the first place. `highlights` caps at 3 with no
floor, because most qualifications are the credential and the dates, and a schema that
demands a bullet gets an invented one.

**Cost:** The BSc's `technologies: ["Python", "SQL", "Java"]` had nowhere to go and was
dropped. All three already appear in the Languages skill group, so §5.5 invariant 8 is
unaffected — but the degree no longer contributes to the technology vocabulary, and if it
ever should, that is a new field rather than a restored one. `/experience/` gained a
sentence saying where the degree went, so the omission reads as a decision rather than a gap.
**Affects:** §5.4, §5.5, §8.4, §8.5

## 2026-08-31 — `/certifications` became `/skills`, and grew into the label

**Context:** §7.2's nav labelled `/certifications/` **"Skills"** since Phase 3. The route
rendered credentials and nothing else, while the actual skills content — the tool groups and
the focus pillars — sat on `/about/`. The one link on the site promising skills delivered a
list of courses.
**Decision:** `app/skills/page.tsx` replaces `app/certifications/page.tsx`, composing focus
pillars, then tool groups, then the certification grid. A permanent redirect in
`next.config.ts` covers the old path. `components/certifications/*` keeps its name.
**Reason:** Two ways to end the mismatch: relabel the nav to "Certifications," or build the
page the label promised. The second is the better site — credentials alone are a weak answer
to "what can this person do," and the pillars and tools were doing nothing for `/about/`
except crowding out the personal content that page was missing.

The section order is the argument the page makes. A bare tool list is not evidence any of
those tools were used well, and shipping one to fix a bare credential list would have
reproduced the same defect one noun over. The pillars say what the tools are *for*; the
certificates are the only part a third party vouches for, so they close the page rather than
open it.

The components were not renamed along with the route. They render credentials, which is
still exactly what they do — only the page composing them moved, and renaming them would
have made a route change look like a component change in every future `git log`.
**Cost:** A live, linked URL changed. The redirect is permanent (308) so accumulated ranking
follows rather than splits, but anything outside this repo pointing at `/certifications` —
the résumé PDF included — is now one hop from its destination.
**Affects:** §7.1, §7.2, §7.4, §8.5, §8.6, §13.2, §13.4

## 2026-08-31 — `/about/` got a second voice, and a `bio` field to hold it

**Context:** `/about/` opened with `site.intro`, the same paragraph the home hero renders and
`personJsonLd` uses as `description`. It carried no personal information at all — no
languages, and the location already sitting in `site.json` was never rendered there.
**Decision:** New `site.bio` (first person, 700-char ceiling), `site.languages`, and
`site.avatar`. `/about/` opens with a circle avatar, an `h1` reading "Hi, I'm Mukerem", the
bio, and a `<dl>` of location, languages, and email. `site.intro` is untouched.
**Reason:** A new field rather than a rewrite, because `intro` has three consumers and two of
them are not this page. Editing it to warm up `/about/` would have silently rewritten the
home hero and the search snippet — the hero is scheduled for its own pass, and the JSON-LD
`description` should stay the paragraph written to be read cold by someone who has not met
the site yet. Two fields, two registers, two audiences.

`languages[].level` is a free optional string rather than an enum, for the reason §5.4
refuses proficiency scales on skills: a fixed ladder invites a self-assessment nobody can
check. It is omitted from `knowsLanguage` in the JSON-LD for the same reason — schema.org has
no property that would make "Conversational" machine-comparable, and emitting it would dress
an unverifiable claim as structured data. `alumniOf` does join the graph, since an
institution and its URL are checkable.

`avatar` is a second image field rather than a reuse of `portrait`, which is 4:5 and belongs
to the hero. Putting a 4:5 image behind `rounded-full` crops the top of a head off. The two
slots take two exports of one photograph.
**Cost:** The register now splits mid-site: `/about/` and `/skills/` are first person and
warm, the project case studies stay declarative. That is defensible — the case-study voice is
doing real work — but it is a seam, and the home hero is currently on the wrong side of it
until its own pass lands. `availability` is rendered on `/about/` behind the existing
`availability.show` flag rather than a new one, so the badge and the row stay one claim; the
flag is `false` today, which means the row is not visible yet.
**Affects:** §5.2, §5.4, §8.5, §13.2

## 2026-08-31 — The home hero lost three of its four type levels

**Context:** The previous entry closed by noting the home hero was on the wrong side of the
register seam and awaiting its own pass. This is that pass. Owner review of the built hero
named three faults: too many competing type sizes, a description too long to be read
standing up, and a layout nobody liked. The drawn signature was the one part singled out as
working.
**Decision:** The hero is the portrait on the left, and on the right the signature, one line
of `site.role`, and two buttons, on a derived height floor from `md` up. Removed: the
eyebrow, `site.intro`, the "PDF, updated …" caption, and the GitHub and LinkedIn links.
`site.headline`, `site.eyebrow`, and `site.intro` all stay in `site.json`.
**Reason:** The complaint about "three different fonts" was really about four stacked steps
of prominence — signature, `heading-1` role, `body-lg` paragraph, `body-sm` caption — in the
first screen of the site. Cutting to two makes the signature read as the display element it
was drawn to be, which was the only part the owner liked and the part the old stack was
competing with.

`site.intro` was cut rather than shortened because it already has a second consumer that
wants it long: `personJsonLd`'s `description` is written to be read cold by someone who has
not met the site, and the hero is read by someone looking straight at the name. Shortening
the field would have traded one problem for a worse search snippet; deleting the *render*
costs nothing, since §8.1's five-second test is a question `site.role` answers on its own.
The unused `headline` and `eyebrow` stay in the content file because they are cheap, and
because the next hero revision is more likely to want one of them than to want a new field.

Portrait-left rather than the old portrait-right is a real change and not a coin flip: it
puts the face at the start of the reading order, and it makes the mobile stack
face-then-name without an `order-*` override fighting the DOM.

The social links left the hero rather than moving within it. As buttons beside the two CTAs
they made four controls in one row, and they were the two that mattered least: `SiteFooter`
renders `site.socials` on every page and `/contact` renders it again, so the hero was the
third place to say the same thing and the one where it cost the most. Removing them also
disposes of a latent bug on the way out — they had been nested inside the `site.portrait`
conditional, so deleting the portrait, a documented swap-matrix operation, silently deleted
GitHub and LinkedIn from the home page too.

**A stat row was considered and rejected.** The proposal was "6+ projects deployed, 3+ AI
integrations, 3 professional certificates." Counted against `content/`, each number is
wrong: seven projects exist and **two** carry a `links.live` URL, **two** are category
`AI/ML`, and there are **eleven** certifications, not three. Two of the three would have
overstated and one understated. A row *derived* from `content/` at build time would not have
been an invented metric — it would be countable, clickable, and immune to drift, which also
keeps §1.3's "adding a project requires zero UI edits" true. It was still rejected: at
7/2/2 the honest numbers are small enough that stating them reads weaker than the project
cards one section down, which show the same thing and can be opened. Stat rows earn their
place at a scale this site does not have yet. §1.5's "verifiable scope" line remains the
available alternative if the hero later needs to say what the work *is*.
**Cost:** The home page no longer says anything about *what* the work is above the fold —
"AI Engineer & Full-Stack Developer" is a role, not a specialty, and §8.1 asks for both.
The specialty now lands one section down, in "Selected work." That is a deliberate bet that
the cards make the case better than a paragraph did, and it is the first thing to revisit if
the hero reads as thin rather than as calm. The portrait is also still the grey 4:5
placeholder, so this layout has been judged against a box, not a face.

The hero's height floor is `--hero-min-height` in `globals.css`, and it is derived rather
than chosen: `100svh` less the 4rem header, less `--spacing-section-lg` twice — once for the
page padding above the hero, once for the flex gap below it — less a 5rem peek. It started
as a flat `60vh` and that was wrong in a way worth recording, because the mistake is easy to
make again. The chrome between the hero and the fold is *fixed*, so a viewport fraction
cannot hold the relationship: `60vh` shows the next heading on a 900px window and buries it
on a 1440px one, where 40% of the viewport is 576px against 288px of chrome. Subtracting the
known quantities is the only form that works at every height.

It lives in `globals.css` rather than in the component because it reads
`--spacing-section-lg`, and the two must move together — raising the section rhythm without
lowering the hero floor is exactly how the peek would silently disappear. It is deliberately
not a `@theme` entry: it generates no utility and has exactly one consumer.

`svh` rather than `vh` so a mobile browser's retracting toolbars cannot make the floor taller
than the visible area. It is a floor and not a cap, so on a short window the calc goes small
or negative, `min-height` stops binding, and content sets the height as usual. It is applied
at `md` and up only: on a phone a stacked portrait and name already exceed it.
**Affects:** §1.3, §1.5, §8.1, §9.1, §21

---

## 2026-08-31 — Footer rebuilt as identity, handles, and three link columns

**Context:** The owner supplied a reference layout for the footer: identity block on the
left, social accounts beneath it, three unlabelled link columns on the right, and a
centred copyright under a space. §7.3 specifies the footer as four stacked lines, which is
what shipped in Phase 2.
**Decision:** Keep every string §7.3 names, and rearrange them. The monogram, the name,
and one role-and-place line stay left; the six routes split into two columns and §7.3's
"GitHub · LinkedIn · Email" becomes the third; a hairline closes the block, and under it
one baseline row carries the copyright at one end and `site.handles` as marks alone at the
other.
**Reason:** The stacked form put a full-width row of routes and a second full-width row of
links under a name that occupies a third of the measure, so two thirds of the footer was
empty at every width above `md`. Columns spend that width instead. Nothing was added: the
same links, in the same footer, arranged across rather than down.
**Affects:** §5.2, §7.3, §7.4

Five consequences worth recording, because each is a place a future edit could quietly
undo the reasoning:

**The role line is a new content field, not a shortened `role`.** `site.role` is the
hero's positioning sentence — it names the work *and* what the work is about, and it is
106 characters. Under a name in a third of the measure that is a paragraph, not a
sign-off. `roleShort` joins `intro`/`bio` and `portrait`/`avatar` as a second field for a
second register rather than a compromise that would have made editing the footer rewrite
the hero. The line is broken explicitly rather than left to the measure, because "in two
lines" was the instruction and a wrap point that moves with the column width is not that.
**Cost:** `role` and `roleShort` can now disagree about capitalisation, and currently do —
"Full-Stack" in one, "Full-stack" in the other, both as supplied.

**`location.remote` was deleted, not left unread.** The old line ended "· Available
remotely" when the flag was set; the replacement is one sentence with no room for a clause,
and the flag was `false`, so nothing changed on screen either way. The field is gone from
the schema, from `content/site.json`, and from the two component comments that explained
it. A boolean nothing reads is worse than no boolean: it survives as an unfalsifiable
claim waiting for whoever gives it a consumer next, and §1.5's whole objection to invented
metrics is that they arrive by accident rather than by decision. Site-wide quiet mode is
now one switch, `availability.show`, which the hero already owns.
**Cost:** Stating a remote-work arrangement again means adding a field back, and the right
place for it is `availability` rather than `location` — where a future editor who
remembers the old shape will not look first.

**`handles` is a separate content key from `socials`, and stays out of `sameAs`.** The
obvious move was four more entries in `socials`, and `ContactChannels` is written to
welcome exactly that — its own comment offers "adding an `x` entry" as the swap it exists
to satisfy. It would also have put seven links in the home page's contact callout, which
§8.1 asks for as a row of three, and a `wa.me` link into `personJsonLd`'s `sameAs`, which
is for pages that establish identity rather than for a phone number. Two keys, one
consumer each, and the contact page keeps saying three things.
**Cost:** X, Instagram, and Telegram are real profiles that a fuller `sameAs` would
legitimately list, and they are now absent from it. That is a search-visibility loss taken
to avoid a content-shaped exception in `structured-data.ts`.

**The handles are marks alone, and the accessible name carries the account.** They read
as icon-plus-username under the name for one revision before moving to the baseline row,
where text would compete with the copyright for the same line. Icon-only is what §7.4
warns about — "never hidden behind an icon without an accessible name" — so each one
announces "Instagram, @mukeemoha" rather than "Instagram": three of the four handles are
the same word, and the platform alone does not tell anyone which account they are about to
open. The row wraps rather than switching layout at a breakpoint, because four 18px marks
and one short sentence fit side by side well below `sm`.

**`ExternalLink` gained a `tone` prop, which is the first parameterised primitive.** §9
rule 2 has the primitives composing rather than parameterising, and the file's own comment
says `className` is the escape hatch. It is not one here: `cn` is a joiner, not
`tailwind-merge`, so a caller passing `text-text-muted` against the base `text-brand`
leaves the winner to stylesheet order. The footer's third column needs GitHub and LinkedIn
to look like the route links beside them, and §7.4 requires them to go through
`ExternalLink` — a two-value variant is the cheapest thing that satisfies both. The
alternative, adding `tailwind-merge`, is a pinned dependency bought for one call site.

## 2026-08-31 — The focus pillars become the owner's, and stop being an argument from the file tree

**Context:** `focus.json`'s three pillars were derived earlier the same day from
`content/projects/` alone — multi-tenancy with access control, grounded and swappable LLM
features, edge-first delivery. The entry that made that change recorded the open question
in as many words: the pillars are a claim about emphasis, not a fact derivable from the
files, and the choice was the owner's to confirm. They did not confirm it. They supplied
three of their own, and the reason given was that the derived set read as too technical and
too specific.
**Decision:** `content/focus/focus.json` now carries System Design, AI Integration, and
Full-Stack Development, with the owner's bodies. `EngineeringFocus` and the `/skills/`
section render them unchanged — no component, schema, or route was touched.
**Reason:** The derived pillars were accurate and answered the wrong question. They said
what the four projects have in common, which is a fact about a directory; a reader on the
home page is asking what this person does, which is a fact about a person. Three project
files sharing row-level security makes "multi-tenancy with access control" true, and still
narrower than the person it describes. Invariant 6 is what the section actually needs to
hold, and three pillars remain three pillars.

**Two edits were made to the supplied copy, both recorded in `STUB-INVENTORY.md`.**
`AI Integration`'s body arrived at 273 characters against `FocusPillarSchema`'s 260
ceiling. Rather than raise the ceiling — it exists so the home page's three columns stay
within a line or two of each other, and 273 is not where that breaks, but the next one
would be — "connecting applications to 11+ AI providers" became "connecting to 11+ AI
providers", which the sentence's own opening clause already establishes. It lands at
exactly 260. The `technologies` arrays are the draft's rather than the owner's, because the
supplied text named its tools in prose and the tag rows have to satisfy invariant 8.

**Amazon Bedrock, LangChain, and Next.js appear in the pillar prose and in no tag row.**
Invariant 8 governs technology strings, not sentences, so the prose carries them without an
allowlist entry and `skills.json` stays as it is: every item in it used by a project. The
backing is real but sits elsewhere — Bedrock and LangChain in the AWS Generative AI
credential, which renders two sections below the pillars on the same page, and Next.js in
this site, which is the exception `TechnologyList` already documents. Adding either to a
tag row would have meant putting a string in `skills.json` that no project uses, which is
the precise failure the 2026-08-31 vocabulary rebuild removed.
**Cost:** The pillar titles are Title Case where every other heading on the site is sentence
case, because they were supplied that way and they read as labels rather than as sentences.
`focus.json` is now the one content file whose three ids no longer describe project
behaviour, which makes it harder to check a pillar against the case studies — the trade the
change was asked for.
**Affects:** §5.4, §5.5, §8.1, §8.6

## 2026-08-31 — The portrait is 3:4, and the first real assets landed

**Context:** The owner supplied three photographs — a studio headshot at 720×960, the same
headshot cropped square at 360×360, and a ConverseKit title card at 1577×887 — and
instructed that the portrait be 3:4 rather than the 4:5 the schema, the components, and
§5.2 had all assumed since Phase 2.
**Decision:** `site.portrait` is `/images/portrait-3x4.jpeg` at 720×960, `site.avatar` is
`/images/avatar-1x1.jpeg` at 360×360, and `conversekit-ai-chatbot`'s `cover` is
`/images/projects/conversekit-ai-chatbot-cover-16x9.jpeg` at 1577×887. They are the first
files under `public/images/`, which §4 has designated since v2.0 and which had stood empty
until now. Comments in `lib/schemas.ts`, `components/home/Hero.tsx`, and
`components/about/ProfileHeader.tsx` were corrected from 4:5 to 3:4.
**Reason:** The ratio was never load-bearing. Nothing crops, letterboxes, or asserts an
aspect ratio in CSS: `Figure` sets `h-auto w-full` precisely so the rendered box follows the
file's own shape, and `width`/`height` come from content. So 4:5 was a description of the
expected asset rather than a constraint on it, and the honest fix is to change the
description. The reasoning that *depended* on the ratio survives unchanged — 3:4 is still
taller than it is wide, so centre-cropping it to a circle still takes the top off a head,
which is still why `avatar` is a separate field and a separate export.

**§5.3's numbers are now real numbers.** `width` and `height` were read off the files rather
than copied from the old declarations, which matters more than it sounds: all four project
covers previously declared a tidy 1600×900 for files that did not exist. ConverseKit's
actual card is 1577×887 — the same ratio to within a pixel, but not the number that was
written down. A wrong pair does not fail a build; it shifts the page under a reader.

**The ConverseKit cover is a title card, not a product capture.** Its `alt` therefore
carries the words printed on it rather than describing a UI, because under §11.4 an image of
text whose text is not in the alt is text nobody can read. Worth noting because the previous
`alt` on that field described a dashboard with vendor selection and a conversation interface
— a screenshot that was never taken, of a file that never existed.
**Cost:** §5.2's inline comment in the spec still reads "a 4:5 image in a circle loses a
head," and §5.3's example still shows 4:5. Both are now one ratio out of date. They are left
as written per the working agreement — the spec is the record of what was designed and this
log is the record of what changed — but anyone reading §5.2 cold will get the wrong number.

The square crop is 360×360 against a 320×320 target and the cover is 1577px against a
2400px one, so the avatar is slightly over and the cover is meaningfully under. With
`images: { unoptimized: true }` there is no pipeline to correct either. The cover will look
soft on a retina screen at full container width; that is accepted rather than fixed, on the
grounds that re-exporting a title card to chase sharpness is not where the next hour goes.

Three of the four project covers are still broken paths naming files that do not exist. This
entry closes one of them.
**Affects:** §4, §5.2, §5.3, §11.4, §12.2

## 2026-08-31 — The bullet stops being round, and stops being the default container

**Context:** §6.7 says every marker in the system has square edges, and every radius token
is `0px`. Bullet lists were `list-disc`, so the one round thing on the site was the marker
that appeared on four surfaces. In the experience timeline it was visible as a
contradiction rather than a detail: `ExperienceTimeline` draws each entry's rail node as
`size-2 bg-border-strong`, a square, and the achievements belonging to that same entry
rendered as circles 24px to its right.

Reviewing the four surfaces for the marker turned up the larger problem. §8.4 required
"1 to 5 achievement bullets", and a floor of one does not make an entry say more — it makes
the entry find a sentence. What it found was the summary again, one line down and in the
past tense. Two of six entries had nothing under the summary the summary had not already
said; the student ambassador entry's two bullets were both paraphrases of its own first
sentence. Education was worse: of three highlights, one repeated the date range printed in
the eyebrow directly above it, and one repeated its note verbatim.

**Decision:** A `BulletList` primitive in `components/ui/` owns the marker, in two variants.
`square` is the timeline's marker at 6px — the list-of-peers marker, and the default. It
takes project lessons, experience achievements, and the contact page's "What helps". `star`
is a filled five-pointed star, drawn as a ten-vertex polygon so that every vertex is a
corner and every edge is straight, used on education highlights and nowhere else.

`ExperienceSchema.achievements` loses its `min(1)`: 0 to 5, not 1 to 5. `BulletList` renders
nothing for an empty array, so an entry with nothing to add is a summary and a tag row.
Content followed the schema — experience went from 14 bullets to 8, two entries to none,
with the surviving facts folded into the summaries that were already circling them.
Education's highlights went from three to two, one per credential.

`Prose` keeps `list-decimal` for `ol` — a numeral has no radius to be wrong about — and
gets the same 6px square as a `::before` for `ul`.

**Reason:** The marker is drawn rather than styled because `::marker` takes a colour and a
font but not a shape. `list-[square]` is the only square CSS offers and its size is the
browser's, so it cannot be tied to `size-1.5`/`bg-border-strong` the way the rail node is,
and the two squares would drift apart per browser. §11.1's "lists are lists" is unaffected:
these are still real `ul`/`li`, with the marker `aria-hidden` beside the text.

Two variants rather than one because the education entries carry exactly one highlight each.
A square — this system's marker for a list of peers — in front of a lone item reads as a
list with one row in it, which is the shape a reader then looks for a second row of. A star
marks the item out rather than enumerating it, and both highlights are a distinction, not
one of a series.

**Both variants were originally a chevron, and it shipped to nobody.** The first draft gave
the chevron to education and to the contact page's "What helps", on the argument that the
contact items ask something of the reader rather than record something done. That reading
was fine and the glyph was not: a column of right-pointing chevrons is the disclosure
control every accordion on the web uses, so three of them stacked under a heading read as
collapsed sections waiting to be clicked. A marker that invites a click that does nothing
has told the reader something false about the page, which outranks the distinction it was
drawn to carry. Contact went to the square — three items that are peers of one another
get the peer marker, and the second marker was never worth its own vocabulary there.

Fixing the marker without cutting the content would have been the worse half of the job. A
sharper bullet in front of a sentence the reader has just read is a better-drawn redundancy.

**Cost:** §8.4 still reads "1 to 5 achievement bullets" and is now one number out of date.
Left as written, per the convention this log already follows for §5.2's aspect ratio — the
spec records what was designed, this log records what changed.

The timeline is less uniform than it was: two entries now end at the summary while four
carry bullets, so the rhythm down the page varies in a way it did not when every entry was
padded to the same shape. That is the intended trade and it is still a cost.

The star is the one icon in the system that is neither a brand mark nor chrome, so it sets a
precedent `BrandIcon` and `MobileNavigation` do not cover: filled, no stroke, sized in `size-*`
rather than by a `size` prop. Nothing in the codebase states that rule, and the next
content icon will have to pick a side by looking at this one.

A star is also the most connotation-heavy marker available — it reads as a rating anywhere
it appears beside something that could be scored. It is defensible here because both
highlights genuinely are distinctions, and it would stop being defensible the moment
`highlights` carried something ordinary.

The square/star distinction is inferred, never labelled. A reader will not be told that one
means "peer" and the other means "distinction", and a future entry adding a second education
highlight will silently make the star wrong there — it is a marker for a lone item, and the
schema still permits three.

`BulletList` takes `items: string[]`, so a list item cannot carry inline markup — a link
inside a project lesson would need the prop widened to `ReactNode[]`. No content needs it
today.

**Affects:** §6.7, §6.8, §8.3, §8.4, §11.1

## 2026-08-31 — The palette had a blue axis in both themes, from two different causes

**Context:** Cards read blue in dark mode and ink read blue in light mode. Measuring every
token in OKLCH found two unrelated faults wearing the same symptom.

In light mode it is literal. `text` `#1E2229` sits at hue 262 and `text-muted` `#5C6470` at
hue 258, in a palette where `canvas` is 77, `border-subtle` 73, `border-strong` 71, and
dark-mode ink 77. They are slate-greys left over from the cobalt accent §6.1(b) retired,
and nothing moved them when the accent moved. Light mode was running cool ink on a warm
ground while dark mode ran warm ink on a warm ground.

In dark mode nothing is blue. `#181818`, `#272727`, and `#313131` measure **C = 0.0000** —
perfectly achromatic — on a canvas at C = 0.0173. That is chromatic induction: the eye
adapts to the warm ground and an achromatic patch swings toward the complement. The
2026-08-30 entry below predicted the temperature break would be imperceptible at these
luminances and was right; it did not consider that a *neutral* would not stay neutral. That
revision also inverted the chroma ladder — the stack it replaced ran 0.005 → 0.007 → 0.010
upward from the ground, and B4 left the page background as the most saturated thing on
screen.

**Decision:** Light `text` → `#26211A`, `text-muted` → `#6B6256`. Dark `canvas` → `#161109`,
`surface` → `#1B1813`, `surface-alt` → `#2A2722`, `border-subtle` → `#34312C`, `code-bg` →
`#1B1813`. Light `--overlay-shadow` → `rgb(38 33 26 / 0.28)` and `OG_PALETTE` in
`lib/og.ts` follow `text` and `text-muted`. This supersedes "Dark surfaces re-anchored on
the landing-page-design B4 list" (2026-08-30): no dark background value is on B4's list
any more.

**Reason:** Every replacement is a hue rotation holding OKLab L, so the fix costs no
contrast. Of the thirteen ratios §6.1 and §6.3 quote, six are unchanged to the hundredth
and seven moved by 0.01–0.02; none crosses a threshold, and the two that matter most —
`border-strong` at 3.70 on `surface` and 3.11 on `surface-alt` — still clear the 3:1 that
§6.1(a) exists to guarantee. That property is why this was worth doing at all: the
stylesheet header warns that changing a hex makes §6.1 a lie, and rotating hue at fixed
lightness is the one edit that does not.

The dark values leave B4's list, and B4's own Scope section is what permits it: *"When the
user's explicit prompt conflicts with a rule, the user wins."* The owner reported the
artifact and chose the correction, so this is the precedence path the skill specifies, not
a deviation from it. Worth stating plainly because the repo cites B4 as an authority in
three places (§6.1(c), §6.3, §6.5) and recorded nowhere that the authority defers to the
owner — which is why the 2026-08-30 revision read the list as absolute and rebuilt the
stack around its one warm value.

The substantive reason the owner's call is right: B4's list cannot express the requirement.
Six values containing exactly one warm entry cannot furnish a warm four-step ladder; any
stack built from it puts neutrals above a warm ground, which is precisely the arrangement
that produces the artifact. B4's other provisions are untouched, including its ban on
background gradients.

Light ink was rotated to the palette's chroma rather than halfway to it, so light and dark
are now mirrors: warm ink on warm ground in both. Dark `canvas` was rotated 102.6 → 79.1
at identical chroma, which fixes a second oddity — it was the only token in either theme
outside the 67–81 band.

**Affects:** §6.1(a), §6.1(c), §6.1(d) (new), §6.2, §6.3, §6.4, §13.4

## 2026-09-01 — The real covers arrived as 8K pairs; derivatives are built and committed

**Context:** The owner supplied the four remaining project covers as light/dark pairs of 8K
PNGs — 7680×4320, ConverseKit 8000×4500, ~28 MB for the eight files — having deliberately
exported at that size for crispness, since the covers render full-width. Three of the four
projects were pointing at `cover.src` paths that did not exist at all (see
`STUB-INVENTORY.md`), so they were rendering broken images, not stubs.

Two things made the raw files unusable as-is. `images: { unoptimized: true }` (§12.2) means
the committed file is the delivered file: nothing resizes it, nothing converts it, and there
is no `srcset` — so a phone would have downloaded a 7.7 MB PNG to paint it at 360 CSS px.
And `cover` held a single `src`, so the schema could not express a pair at all.

**Decision:** Three parts.

1. `scripts/build_covers.py` converts the renders to **2400×1350 AVIF, q65, 4:4:4 chroma**,
   written to `public/images/projects/<slug>-cover-16x9-{light,dark}.avif`. The sources stay
   outside the repo; the derivatives are committed. All eight come to **515 KB**, from 28 MB.
2. `ProjectSchema.cover` gains an optional `srcDark`. `src` stays canonical — JSON-LD, OG,
   and anything else needing one image are untouched.
3. `Figure` renders both renditions and swaps them with the `dark:` variant.

`site.resume` also went real in the same pass: `/Mukerem-Shifa-Resume.pdf`, `updated`
bumped to `2026-08`. The URL is deliberately **undated** — a dated filename breaks every
link, QR code and emailed copy already in circulation on each revision, and the date is
already a rendered field.

**Reason:** Covers render at 1200px max (`--container-content`), so 8K carried roughly 130×
more pixels than any display can use. AVIF at 2400px was checked against 1:1 crops of the
densest render (the LMS dashboard) and is indistinguishable from the Lanczos source before
the 2× downscale even applies. It measured ~25% under WebP q80 and ~60% under JPEG q82 at
matched appearance. 4:4:4 costs ~5% over 4:2:0 and keeps coloured UI text from bleeding —
these are interface renders, so chroma detail *is* the subject. The accepted cost of AVIF is
that with the optimizer off there is no automatic fallback; support is every evergreen
browser and Safari 16+.

**A script producing committed assets is not the `sharp` pipeline §12.2 rules out.** Nothing
in `pnpm build` processes an image, and the precedent is already in the repo:
`build_brand.py` does exactly this for the brand marks, from a source that is likewise not
vendored. This also keeps localhost and Vercel byte-identical and spends no metered image
transformations. Turning the optimizer on later is still the one-line change §12.2 promises,
because every consumer still goes through `Figure`.

**The theme swap is CSS, not `<picture>`.** This is the part worth not rediscovering: the
obvious implementation is `<source media="(prefers-color-scheme: dark)">`, and it is wrong
here. This site's theme is a *three-state preference* resolved against `.dark` on `<html>`
(`ThemeScript`), not the OS setting — so a `prefers-color-scheme` source would serve a dark
screenshot on a light page to any visitor on a dark OS who had explicitly chosen light.
`<picture>` cannot see a class. The cost is that both files are fetched, since `display:
none` does not cancel an `<img>` request; at ~60 KB each, with at most one cover per page
(`/projects` renders none), that is cheaper than the bug. `priority` applies to both for the
same reason: the theme resolves on the client, so the server cannot know which rendition
will be the LCP element.

`sizes` on both call sites remains inert under `unoptimized: true` and was left in place
deliberately — it is what makes re-enabling the optimizer a config change rather than a
component change.

**Affects:** §5.3, §9.1, §12.1, §12.2, Phase 5, Phase 6

## 2026-09-01 — `content/site.json` is the contact endpoint's only switch

**Context:** Phase 4a found two switches for one behaviour. `.env.example` documented
`NEXT_PUBLIC_CONTACT_ENDPOINT`, and `SiteSchema` carried `contact.endpoint`. **Neither was
read by any code, and nothing bridged them** — the env var had been written in Phase 0 as
the anticipated mechanism and then superseded by the schema field without being removed.
**Decision:** `site.contact.endpoint` is the switch. The `NEXT_PUBLIC_CONTACT_ENDPOINT`
block is deleted from `.env.example`.
**Reason:** §8.7, the Phase 3 note in `app/contact/page.tsx`, and the STUB-INVENTORY swap
matrix all already name the content field — three places against the env var's one. It is
also the better of the two on its merits: `content/` is parsed through `lib/content.ts` and
validated by Zod at build, so a malformed endpoint fails the build with the file named,
while a malformed env var fails at runtime on a visitor's submit. Keeping both would have
meant two ways to turn the form on and no answer for which wins.
**Affects:** §8.7, §14, `docs/STUB-INVENTORY.md`

## 2026-09-01 — One live region that swaps role, not two regions

**Context:** §8.7 asks for one `role="status" aria-live="polite"` region announcing pending,
success, and failure. §14.1 asks for the hard-failure path to be a `role="alert"`. A single
element cannot hold both roles, and the two clauses are both normative.
**Decision:** One always-mounted node in `ContactForm`, whose `role` and `aria-live` swap to
`alert`/`assertive` when `status` is `error` or `rate_limit`, and are `status`/`polite`
otherwise.
**Reason:** The property that actually decides whether a message is announced is that the
region exists in the DOM *before* it has text — a region mounted at the same moment as its
content is unreliable across screen readers. `CopyButton` already records this and solves it
the same way. Two regions would satisfy both spec clauses literally while making the failure
case worse: two live nodes competing to announce one event, one of them empty. The role swap
keeps a single announcement point and gives failures the assertive treatment §14.1 wants.
**Affects:** §8.7, §11.2, §14.1

## 2026-09-01 — `renderedAt` is stamped in an effect, never during render

**Context:** §14.1's payload carries `renderedAt`, "epoch ms, set when the form mounted,"
feeding §14.2's 3s–30min time trap.
**Decision:** `useRef(0)` plus a mount effect, re-stamped on a successful submit.
**Reason:** `Date.now()` in a render body is a hydration mismatch, and on a statically
rendered page it is *build* time — which the 30-minute ceiling would then reject for every
visitor, turning an anti-spam check into a total outage of the contact path. The re-stamp on
success matters for the same reason in miniature: without it, a second message in one
session is still measured from the first mount and trips the same ceiling.
**Affects:** §14.1, §14.2

## 2026-09-01 — The contact endpoint is a Next route, not a Cloudflare Worker

**Context:** §2 and §14 put the contact endpoint on a Cloudflare Worker at
`api.mukeremshifa.com`, with the subdomain reserved in Phase 0. Phase 4a shipped the form
against that contract. Before 4b was built, the owner chose to drop the Worker and
implement §14 as a Next route handler on Vercel instead.
**Decision:** `app/api/contact/route.ts`. `site.contact.endpoint` is `/api/contact`,
same-origin. No `worker/` package, no wrangler, no second deploy. Resend is unchanged.
**Reason:** Same-origin removes §14.1's CORS allowlist entirely — the clause the spec
called "load-bearing rather than a formality" only existed because the endpoint was
cross-origin. It also removes a second toolchain and a second deploy from a one-form
feature. §14.1's wire contract, §14.2's checks and §14.3's logging rules all survive the
move; what changes is where the code runs.

**What it costs, recorded because it is a real gap and not a detail.** §14.2 item 5, the
per-IP rate limit, is **not implemented.** A Vercel function holds no state between
invocations, so a counter needs an external store (Upstash, Vercel KV) and the owner chose
on 2026-09-01 not to add one yet. The honeypot and the time trap are the spam defence
until then. `ContactForm` already renders the 429 path in full and `ContactResponse` still
carries `rate_limit`, so adding a store later is one file — the seam is marked in the
route.

**Two consequential details.** `SiteSchema.contact.endpoint` moves from `z.url()` to
`AssetPathOrUrl`, because `/api/contact` is not a URL — the same widening `resume.url`
needed, for the same reason: writing the absolute origin into a content file would break
localhost and post every preview's form at production. And the route answers 400s from
`lib/contact.ts`'s `messageFor` rather than Zod's own strings, since the client renders the
`fields` map verbatim under the inputs.
**Affects:** §2, §5.2, §14, §14.1, §14.2, §18 Phase 4

## 2026-09-01 — Hints render as placeholders, and the message field does not resize

**Context:** Owner's direction after seeing the form.
**Decision:** `ContactField`'s `hint` renders as the control's `placeholder` as well as
being wired to `aria-describedby`; the paragraph beneath the field is gone. The textarea
takes `resize-none` and hides its scrollbar.
**Reason:** Owner's call on the visual, made with the accessibility cost stated. Recorded
because both halves are deliberate deviations someone will otherwise read as mistakes.
A placeholder disappears on first keystroke, so the hint is no longer visible while
someone writes — the `aria-describedby` link survives that, which is why the text is kept
in a visually hidden node rather than deleted, and the `<label>` above is untouched (§8.7's
"placeholders are not labels" still holds: they are not labels here, they are hints).
Removing the resize handle takes away a real affordance for anyone writing a long message
in a six-row box, and hiding the scrollbar removes the cue that there is more text above.
Both were accepted knowingly.
**Affects:** §8.7, §11.4

## 2026-09-01 — Rate limiting: two windows, Upstash, and it fails open

**Context:** §14.2 item 5 asks for "basic rate limiting per IP" without naming a
mechanism, and the move to a Vercel route handler removed the Worker's native KV. Phase 4b
had to choose a store and a policy.
**Decision:** `lib/rate-limit.ts`, using Upstash Redis via `@upstash/ratelimit`. **Two**
sliding windows: five per IP per ten minutes, and fifty across all IPs per day. It fails
open. `UPSTASH_REDIS_REST_URL` / `_TOKEN` are the switch; absent, the route logs one
warning per cold start and allows every request.

**Why two limits and not one.** A per-IP limit alone is a speed bump for anyone with a
proxy pool: each address stays under the ceiling and the limiter never fires. The global
counter is what catches a distributed flood, and it is one extra Redis key. They stop
different attacks, so neither substitutes for the other.

**Why sliding and not fixed.** A fixed window lets someone spend the whole allowance at
09:59 and again at 10:00 — twice the intended rate, at the boundary, for free.

**Why it fails open, which is the arguable part.** If Upstash is unreachable the
submission is allowed rather than refused. Failing closed would mean a real message is
lost during an outage the sender cannot see or act on; failing open means a flood gets
through during that same outage. For a portfolio contact form the first is worse: the
honeypot and time trap still apply, the mailbox survives a bad afternoon, and a lost
message is gone for good. A payment endpoint would choose the opposite.

**Order matters.** The limiter runs *after* the parse, honeypot, and time trap. A crude
flood is turned away without spending a Redis command, so the quota is left for the
careful attacker the limiter actually exists to stop.

**Also in this change:** `AbortSignal.timeout(8_000)` on the Resend call. Vercel's Hobby
tier kills a function at 10s, and a hung provider would take the whole invocation with it
— returning no JSON, which costs the client the specific failure copy it would otherwise
show and leaves the visitor with a dead request instead of the direct address.
**Affects:** §14.2, §14.3

## 2026-09-01 — `formatRetry` speaks hours and days, not just minutes

**Context:** `ContactForm` rendered every retry window as minutes. With the global daily
cap added, a visitor who tripped it was told to try again in "1440 minutes".
**Decision:** The formatter steps through minutes, hours, and days.
**Reason:** The two limits are orders of magnitude apart — ten minutes and one day — and a
single unit cannot serve both. Caught by a unit test of the formatter rather than by
reading it, which is worth noting: the bug was invisible in the code and obvious in the
output.
**Affects:** §8.7

## 2026-09-01 — The native scrollbar is removed, and a rail renders the position instead

**Context:** §6.7 makes every edge in the system square and §6.2/§6.3 define every surface
colour. The scrollbar obeys neither: it is rounded, it carries the OS palette, and its
metrics change per platform. It was the only element on the page the design system did not
draw.
**Decision:** Remove it on the viewport — `scrollbar-width: none` on `html`, plus the
WebKit pseudo-element on `html`/`body` — and render a `SectionRail` in the right gutter as
the position indicator.
**Reason:** It cannot be restyled into the system. `scrollbar-width` accepts `thin` and
`none` and nothing else, and the WebKit pseudo-elements let you paint a track and thumb
whose shape and metrics still belong to the platform. So the options were to accept one
foreign element on every page or to rebuild the indicator in the system's own vocabulary.
The rail is the second: one dash per section, `BulletList`'s square stretched along the
axis it indicates, in the marker colour.

**Scoped to the viewport, deliberately.** Removal is on `html`/`body` only. Code blocks
scroll horizontally and §11.2 requires a visible affordance for that; a global rule would
have deleted the only signal that there is more to the right. Every inner scroll region
keeps its scrollbar untouched.

**What is not lost.** The page still scrolls by wheel, touch, keyboard and the rail. What
is gone is the painted indicator, which is the thing the rail replaces. Below `md` the rail
does not render and nothing is missing either: mobile scrollbars are overlays, already
invisible at rest.
**Affects:** §6.7, §7.5, §11.2

## 2026-09-01 — The rail marks the topmost visible section, not the most visible one

**Context:** `SectionRail` decides which dash is lit from an `IntersectionObserver`. Two
rules were available and they disagree often.
**Decision:** The topmost section intersecting a band 20% from the top and 65% up from the
bottom wins. Between two sections, the last active dash stays lit.
**Reason:** Picking by intersection ratio — "most visible" — fails on unequal sections: a
short section fully on screen sits at ratio 1 while the tall one the reader is actually
inside sits at 0.4, so the marker jumps forward to the section occupying *less* of the
screen. Topmost matches what a scrollbar reports, which is where the viewport is rather
than what is biggest inside it.

**The band, rather than the viewport or a line.** The whole viewport reports three sections
at once on a tall screen, which makes "topmost" pick whichever merely peeks in at the top.
A single line (`-50% 0px -50%`) goes blank whenever a section boundary lands on it. The
band has neither failure.

**Holding the visible set across callbacks** is what makes the rule stable: the observer
reports only what *changed*, so deciding from `entries` alone would make the answer depend
on which sections happened to cross a boundary in that one frame.
**Affects:** §7.5

## 2026-09-01 — Rail stops are wrappers on the page, not ids inside components

**Context:** Each rail stop needs an element with an `id`. The obvious place was inside the
section components themselves — `ContactCallout` renders a section, so let it own
`id="contact"`.
**Decision:** Pages wrap each stop in a `div` carrying the `id` and `data-rail-section`.
Components never carry a page-level anchor id. Stop lists are module constants in page
order, except `/contact/`, which builds its list in the component body because the form
stop exists only when `site.contact.endpoint` does.
**Reason:** A component owning a page-level id can only be used once per page, and
`ContactCallout` already appears on four routes. The wrapper also gives `globals.css` a
single hook — `[data-rail-section]` — for the `scroll-margin-top` that keeps the sticky
header off a heading the reader just jumped to, so the offset is declared on the target
rather than computed by every caller.

**The rail renders after its content** in the DOM so it never sits between the skip link and
the page. It is `fixed`, so its position in the flow costs nothing.
**Affects:** §7.5, §11.2

## 2026-09-01 — The rail is accessibility-first: `aria-current`, and labels always in the tree

**Context:** A rail of bare dashes is a set of nameless links, and the labels only appear on
hover.
**Decision:** Each label is in the DOM at `opacity: 0` rather than `display: none`, so it is
always the link's accessible name, and it is revealed on `group-focus-visible` as well as
`group-hover`. The active dash is marked `aria-current="true"`.
**Reason:** `group-hover` cannot help a screen reader, and hiding the label with `display`
would leave the link with no name at all. Revealing on focus is §21's no-hover-only rule:
the keyboard path is the mouse path. `aria-current="true"` rather than `"location"` because
the rail marks position *within* this page, which is what `true` means on a link that is not
a different page — and the visible styling reads the same attribute, so painted and
announced state cannot drift apart.
**Affects:** §7.5, §11.2, §21

## 2026-09-01 — The rail deliberately does not animate, and smooth scroll is deferred

**Context:** A scroll-position indicator is the obvious place to reach for motion —
dashes that grow, a marker that slides, smooth scrolling on jump.
**Decision:** None of it, for now. The active state is a colour change over `fast` and
nothing else; the dash width is fixed; no `scroll-behavior: smooth` is set and no scroll is
driven from JS.
**Reason:** §21 forbids animation that runs while someone is reading. A rail whose dashes
resize as the reader scrolls is exactly that — motion driven by the reading itself — and a
fixed width also guarantees the stack never reflows. Smooth scroll is a different question
and a defensible one, but it is one declaration on `html` and belongs to the motion pass
rather than to this change; §10.3's reduced-motion block already overrides it back to
`auto`, so the accessibility half is done in advance.
**Affects:** §7.5, §10.2, §10.4, §21

## 2026-09-01 — Below three stops the rail renders nothing

**Context:** `/contact/` has four stops with the form enabled and three without. A rail can
be given any number.
**Decision:** `minSections` defaults to 3; below it the component returns `null`.
**Reason:** Two dashes are a control that tells the reader what they can already see —
the whole page is on screen, so there is nothing to indicate and nowhere to go. The
threshold is a prop rather than a constant so a page with an argument for a lower one can
make it explicitly, but no caller passes it today.
**Affects:** §7.5

## 2026-09-01 — The spec is reconciled against the tree, and the drift is recorded rather than erased

**Context:** The spec header still said "Phase 2 — golden sample" while Phase 4 was
complete. §4's file tree named a `worker/` directory, a `tests/` tree, a `public/og/`
directory and an `app/certifications/page.tsx`, none of which exist. §10.2 still specified a
Motion `layoutId` nav underline that was replaced with CSS on 2026-08-15 by an entry in this
very log. Appendix A listed six commands, of which two exist.
**Decision:** Re-derive the spec from the tree, and add §4.2 listing each divergence with
whether it was a decision or an oversight, rather than silently editing the tree into the
document.
**Reason:** The spec is used as the source of truth by anyone picking the project up,
including agents, and a document that is confidently wrong in six places is worse than one
that is visibly incomplete. Marking *which* gaps were chosen — the Worker, the OG
directory, the rename — and which were simply never done — the tests, `ci.yml` — is the
information a reader actually needs, and it is exactly what this log's opening paragraph
asks for. §10.2 gains a build-status column for the same reason: "specified" and "shipped"
had quietly become different things, and the two rows where they differ are the entire
remaining motion backlog (§10.4).
**Affects:** §4, §7.5, §8.2, §8.3, §9.2, §9.4, §10, §14, §15.3, §16.2, §18, §19, Appendix A

## 2026-09-01 — The motion system drops to one easing curve

**Context:** §10.1 defined two curves: `--ease-out` for entrances and `--ease-standard`
for things already on screen that move — repositions, hovers, colour changes. Applying
§10.4's outstanding motion work meant deciding, per animation, which of the two it was.
**Decision:** `--ease-standard` is deleted. `--ease-out` (`cubic-bezier(0.16, 1, 0.3, 1)`)
is the system's only curve, and every one of the 31 usages across 25 files now points at
it, including the two Motion wrappers that carried `[0.2, 0, 0, 1]` as a numeric literal
(`LayoutItem`, `MobileNavigation`).
**Reason:** Owner call, and the honest version is that the distinction was real in theory
and invisible in practice. Both curves ended at the same place over the same 120–320ms;
the difference between them is perceptible when you put the two side by side and run them
against each other, which is not a thing any reader of this site will ever do. A token
whose two values cannot be told apart in the product is a decision imposed on every future
change for no return — every new transition had to answer "is this an entrance?" before it
could be written. One curve deletes the question.
**Cost:** The hover and colour-change transitions now run on a curve tuned for arrival,
which has a longer settle than `ease-standard` did. At `--duration-fast` (120ms) this is
not visible; if a future hover ever feels slow to leave, this entry is why, and the fix is
a shorter duration rather than a second curve. Also: the comment in `globals.css` and
`LayoutItem`'s docblock both had to be rewritten, because a mechanical find-and-replace
turned the sentences *explaining* the distinction into sentences comparing the surviving
curve to itself.
**Affects:** §10.1, §10.2

## 2026-09-01 — The project filter animated only the cards that stayed

**Context:** §10.2 listed the filter row as shipped. `LayoutItem` gave `ProjectGrid` a
`layout` prop and a slug key, so cards surviving a filter change repositioned correctly.
Nothing wrapped the list in `AnimatePresence`, so React unmounted filtered-out cards
immediately and mounted arrivals immediately.
**Decision:** Add `components/motion/Presence.tsx` — the fourth wrapper, on the same §9.4
reasoning that produced `LayoutItem` — and give `LayoutItem` an opt-in `animatePresence`
prop supplying the opacity halves.
**Reason:** The row was two-thirds true and read as a glitch: survivors glided gracefully
around neighbours that popped in and out, which is worse than either animating everything
or animating nothing. A reader cannot tell "these cards moved" from "the grid broke".
**Also:** opacity only, no translate. `Reveal` translates because a section arriving from
below the fold has a direction to arrive from; a filtered card does not — it is already
where it belongs, and its neighbours are mid-reposition. A slide would put two different
movements on one element at one moment. The fade runs at `fast` under the `base`
reposition rather than matching it, so arrivals do not appear to lag the layout settling
around them.
**Affects:** §9.4, §10.2

## 2026-09-01 — `ProjectGrid` takes a `filterable` prop, because its two animations exclude each other

**Context:** Applying §10.2's stagger row to the card grids ran into `ProjectGrid` having
two callers with opposite needs: `/projects` filters it (wants reposition and fade), the
home page does not (wants an entrance stagger).
**Decision:** `filterable` selects one. `ProjectExplorer` passes it; `FeaturedProjects`
does not. Never both animations on the same cards.
**Reason:** A stagger is an entrance — it runs once, on first scroll-in. The filter
animation runs on every click, indefinitely. Combining them means a filter click re-runs a
60ms-per-card cascade on top of the reposition and the fade: three animations on one
element for one click, and the cascade describes an entrance that already happened. The
alternative — always stagger, never filter-animate — would have undone the fix above.
**Cost:** One more prop on a component whose contract §9.3 already fixes, and the two
callers now have to know which they are. The prop is documented at the type and the
component explains why the branches exist, because "why does this grid animate differently
over here" is exactly the question a future reader will have.
**Affects:** §9.3, §10.2

## 2026-09-01 — The contact form's live region is amended from "never animated" to "region never animated"

**Context:** §10.2's contact-form row said the live region is never animated, and
`StatusMessage`'s docblock said the same. Applying the motion pass meant deciding whether a
status change — four quite different sentences swapping in one position — should transition.
**Decision:** The `role="status"` / `aria-live` node stays mounted, unanimated, and
unkeyed. A span *inside* it fades over `fast`. `CopyButton` gets the same treatment.
**Reason:** The original rule was protecting a real property — a region that animates,
remounts, or appears alongside its own content announces unreliably — but it was stated
one level too broadly. Nothing about that property requires the *text* to snap. Splitting
the rule keeps the guarantee and drops the constraint that was incidental to it.
**Cost:** The rule is now a two-part rule, and the difference between the parts is exactly
the kind of thing a later edit flattens back into "don't animate the status". Both
components carry a comment at the animated span saying which half is which.
**Affects:** §10.2, §10.4

## 2026-09-01 — Smooth scrolling is on

**Context:** §10.4 deferred `scroll-behavior: smooth` to the motion pass. This is that pass.
**Decision:** One declaration on `html` in `globals.css`.
**Reason:** The rail scrolls by moving focus to a section, and without this the page
teleports — on a seven-stop page that is the difference between navigating and being
relocated, since the reader is given no indication of distance or direction. Declared on
`html` rather than passed per call because it has to cover both paths the rail uses,
`scrollIntoView` and the focus scroll, and a `behavior` option only covers the first.
**Reduced motion:** already handled. §10.3's block sets `scroll-behavior: auto !important`
on `*`, which matches `html` and outranks this.
**Affects:** §7.5, §10.2, §10.4

## 2026-09-02 — The project filter remounts the grid instead of animating a rearrangement

**Context:** Filtering `/projects` ran a `layout` reposition on surviving cards plus an
enter/exit fade on the ones changing, via `LayoutItem` and `Presence`. The owner reported
it as "odd to what's used elsewhere" and, after it was brought onto §10.1's curve, still
as jarbled — the survivors slide, the newcomers fade, and the two happen at once.
**Decision:** `ProjectExplorer` keys `<ProjectGrid>` on the filter value. Changing the key
tears the grid down and mounts a new one, so every card runs the ordinary entrance stagger
— the same motion the page shows on first load. `LayoutItem.tsx` and `Presence.tsx` are
deleted; nothing else used them.
**Reason:** Owner's suggestion, and it is better than what it replaced on every axis. A
rearrangement animation asks the eye to track several cards moving different distances in
different directions while others fade — three simultaneous motions describing one click.
"Here is the new list" is both easier to read and a truer description of what a filter
does. It also removes the last interaction on the site with bespoke motion: the grid now
has one behaviour instead of two mutually exclusive ones selected by a `filterable` prop.
**Cost:** Cards present in both the old and new filter are unmounted and rebuilt rather
than tracked across the change. That is precisely what makes the effect work, and at seven
cards of static content it costs nothing measurable. If this grid ever holds images that
must not re-request, or state that must survive a filter, this is the decision to revisit.
**Affects:** §9.3, §9.4, §10.3

## 2026-09-02 — `Stagger` sequences by grid row, not by child

**Context:** A two-column grid staggering per child makes the right-hand card land 70ms
after the left-hand one, which reads as the row assembling itself left to right.
**Decision:** `perRow` gives children sharing a row one delay, so rows land as units and
the sweep runs down the grid. `ProjectGrid` and `CertificationGrid` pass 2.
**Reason:** Owner's suggestion. A reader parses a multi-column grid by row, so a
left-to-right offset inside one row animates the grid's internal ordering rather than the
content arriving.
**Cost, stated because it is a real inaccuracy:** the row width is read from one media
query at `md`, not from the full responsive scale. `CertificationGrid` goes to three
columns at `lg`, where the third card of each row shares a beat with the next row's first.
At 70ms that is a rounding error in the sweep, and modelling the whole grid system inside
a motion component to fix something invisible is the wrong trade. `useSyncExternalStore`
reads the query rather than `useState` plus an effect, because `matchMedia` is an external
store and the effect version writes state on mount for nothing.
**Affects:** §9.4, §10.3

## 2026-09-02 — Field errors collapse; the dialog backdrop fades

**Context:** An animation sweep turned up two defects rather than polish gaps. A failed
contact submit mounts up to three error messages at once, each shoving every field below
it down by a line. And the mobile nav's scrim appeared instantly while its panel slid over
`--duration-slow`, so one event was described at two speeds.
**Decision:** `components/motion/Collapse.tsx` animates height 0 → auto with opacity over
`fast`, used by `ContactField`. `dialog::backdrop` gets an opacity transition over `slow`,
replacing the `backdrop:bg-black/50` utility that could not be transitioned from.
**Reason:** Both are §10's second clause — motion that prevents a jarring change rather
than decorating one. The form case is the only flow on the site with a commercial outcome
and it was the one with visible layout jank.
**Note:** the error `<p>` carries its own `pt-2` rather than relying on the parent's
`gap-2`, because a parent gap is a fixed step between flex children and would appear at
full size the instant the wrapper mounts — reintroducing a smaller version of the jump.
**Affects:** §10.3

## 2026-09-02 — `MotionConfig reducedMotion="user"` was not covering blur or mask

**Context:** A review pass over the finished motion work checked what
`reducedMotion="user"` actually strips. It removes *transform* animations — `x`, `y`,
`scale`, `rotate` — and nothing else. `ImageReveal` animates `filter: blur(12px)` and
`SignatureReveal` animates `mask-position`, so both ran at full length for a visitor who
had asked for reduced motion: a blur clearing over 900ms on every photograph, and the
site's single longest animation, a 2.2-second wipe, on the hero. §10.4 claimed images
appeared "without blur or scale", which was half true and had been since the wrapper was
written.
**Decision:** Add `components/motion/use-reduced-motion.ts`, read it in both components,
and drop the non-transform property by hand. `SignatureReveal` returns its children
unwrapped rather than running a zero-length wipe, because a mask applied at all can clip a
glyph's antialiased edge.
**Reason:** This is the accessibility guarantee §10.4 makes, and it was not being kept.
Everything animating only opacity and transform is genuinely covered by `MotionConfig`;
the gap was exactly the two components that reach past it.
**Two things are deliberately kept:** `SplitText`'s per-character fade, which is pure
opacity and involves no movement at all, and `Collapse`'s height animation, which exists
to stop a field error from shoving the form — removing it restores the jump it was built
to prevent, which is the opposite of what the preference is asking for.
**Cost:** the server snapshot is `false`, the animated path, so a reduced-motion visitor
gets the blurred markup on first paint and it corrects on hydration. The alternative —
assuming reduced motion on the server — sends every visitor the stripped version and then
animates, which is worse for both audiences.
**Affects:** §9.4, §10.4

## 2026-09-04 — GitHub and LinkedIn return to the hero, as handles on the portrait

**Context:** §8.1 lists social links in the hero; they were removed on 2026-08-30 as "a
third and fourth control" because `SiteFooter` carries them on every page and `/contact`
lists them again. That removal was right about the duplication and wrong about what the
duplication cost. The footer's copy sits a full page-scroll below the fold, and the
visitor most likely to want the GitHub link is a recruiter a few seconds into the home
page — the one position on the site where the links are furthest from the person who
wants them.
**Decision:** `components/home/HeroSocialLinks.tsx`, rendered under the portrait as two
monospace handles — `github.com/mukeremshifa`, `in/mukeremshifa` — beneath a
`border-strong` rule, with `BrandIcon` marks and `ExternalLink` doing the tab
announcement. The portrait column narrows from `lg:w-2/5 lg:max-w-90` to
`lg:w-1/3 lg:max-w-80`, and a `brand-soft` panel is offset up-right behind the photograph.
**Why this does not break "two calls to action, total."** The links are not styled as
controls: muted mono text, no fill, no border, no button padding, `text-eyebrow` against
the buttons' `text-body-sm`. A visitor scanning the hero for something to click still
finds exactly two things. The rule that was protecting the hero's flat hierarchy is
intact; what changed is that a *destination* is no longer being counted as an *action*.
**Why handles rather than platform names.** "GitHub" is what the footer column already
says. `github.com/mukeremshifa` is the string someone copies into a browser or a candidate
note, so the link shows the thing it is for. The handle is derived from `socials[].url` at
render rather than stored: adding a `handle` field would put the same substring in two
places for the schema to let drift.
**Why a panel instead of colour-grading the photograph.** The portrait is a studio shot on
neutral grey — the one large achromatic area on a page whose surface tokens all sit
between hue 67 and 81 — and beside the warm canvas it reads faintly blue, by the same
induction §6.1(c) documents for the dark surfaces. A filter would fix the hero and leave
the OG card, the `/about/` avatar, and any future consumer showing a different photograph.
The panel surrounds two edges with `brand-soft` and neutralises the cast environmentally,
so every surface keeps the same unmodified file.
**The deviation from §8.1, stated plainly:** §8.1 requires the hero to collapse to a
single column when `ProfileVisual` is absent, and the links now hang off the portrait. Read
literally, deleting the photograph would delete the GitHub and LinkedIn links with it —
one optional field silently taking an unrelated one down. The section still collapses to
one column exactly as specified; the links relocate into the text column as an `inline`
variant instead of vanishing. Authorised by the owner on 2026-09-04, who asked for the
right behaviour for the repo over the literal reading.
**Cost:** a second layout variant in `HeroSocialLinks` that only renders when `portrait`
is absent, which is a state no shipped configuration currently reaches. It is covered by
the swap matrix in `docs/STUB-INVENTORY.md` and was verified by rendering the hero without
the field before this was committed.
**Affects:** §8.1, §7.4

## 2026-09-04 — Screenshots stay out of v1; the gallery path stays open

**Context:** §20's intake checklist allots up to 8 screenshots per project, and
`docs/STUB-INVENTORY.md` carried capturing them as Phase 5 work. None of the seven real
projects has any, and `public/placeholders/` still holds six screenshot placeholders at
ratios nothing consumes. The gap is silent: an absent gallery renders correctly, so
nothing surfaces it.
**Decision:** v1 ships with no project screenshots, by the owner's call. `ScreenshotSchema`
and `ScreenshotGallery` stay where they are — typed, compiling, unreferenced — and no
project gains the field.
**Reason:** Screenshots are the most expensive content left and the least load-bearing:
every project already carries a cover, prose, and a live link where one exists, and four
of seven have real 2400×1350 light/dark cover pairs doing the visual work. Capturing,
redacting (§20's content warnings), exporting at 2× under `unoptimized: true`, and writing
alt text for up to 56 images is a sprint on its own, and it would gate a launch that is
otherwise content-complete. Keeping the schema and the component is the same call already
made on 2026-08-30 for `CodeHighlight`: the cost of retaining them is two exported types,
and the cost of deleting them is rebuilding a gallery from scratch when a project earns
one. This entry exists so the absence reads as a decision rather than an oversight — which
is precisely what the stub inventory warned about for the three coverless projects.
**Affects:** §5.3, §17.1, §20; `docs/STUB-INVENTORY.md`

## 2026-09-04 — Restored the scripts and the test suite that `b4d5d05` removed

**Context:** `b4d5d05` ("Refactor code structure for improved readability and
maintainability") deleted `.github/workflows/ci.yml`, all six files under `tests/unit/`,
`vitest.config.mts`, and the `build`, `start`, `lint`, `format`, `format:check`,
`test:unit` and `check` scripts from `package.json` — while also carrying an unrelated
content change (the location swap the stub inventory already flags) and adding two
unreferenced PNGs to `public/`. §16.2 and §15.3 were subsequently written as though none
of it had ever existed, recording `ci.yml` and the invariant tests as work never done.
**Decision:** Restore the seven scripts, minus `test:unit`, and drop it from `check` until
the suite is back. Delete `public/portrait.png` and `public/project_cover.png`. Correct
§16.2 and §15.3 to say the work was removed rather than never written.
**Reason:** The spec was describing the wrong failure. "Never built" invites rebuilding
from scratch; "deleted in a refactor" points at `b4d5d05^`, where the real `ci.yml` and a
`links.test.ts` that catches exactly the apex-URL bug `176e8fc` later fixed by hand are
still recoverable. `AGENTS.md` already invoked `pnpm format:check` as though it existed.
The two PNGs were unreferenced from `content/`, `components/`, `app/` and `lib/`, are PNG
photographs the export table forbids, and sit outside the `public/images/` naming rule.
**Affects:** §15.3, §16.2, §18
