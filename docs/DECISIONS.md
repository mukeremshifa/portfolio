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
