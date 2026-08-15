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
