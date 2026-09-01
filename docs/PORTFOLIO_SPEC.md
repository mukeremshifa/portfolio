# Portfolio — Specification v2.1 (Quality-First)

**Owner:** Mukerem Shifa · **Repo:** `mukeremshifa/portfolio` · **Domain:** `mukeremshifa.com` · **Status:** Phase 4 complete — next is Phase 5 (content sweep)
**Spec version:** 2.1.6 · **Supersedes:** MASTERPLAN v1.0 (removed from the repo) · **Drafted:** 2026-08-15 · **Last reconciled against the tree:** 2026-09-01

## Why this version exists

v1.0 optimized hard for a specific delivery mode: static export, zero client JS, tight
performance budgets, and CI gates that block a merge. That mode is legitimate, but it was
never actually chosen; it was inherited from the first draft's Cloudflare-Pages framing and
then treated as locked. The result was a spec that spent more of its weight on constraint
enforcement than on the product itself.

This version keeps everything that made v1.0 good (the content model, the design system,
the page specifications, the accessibility bar) and removes the machinery that was
sacrificing quality for performance before there was any product to measure. **Build the
right product first. Optimize it once it exists.**

Normative language in this document is softer than v1.0 on purpose: **MUST** now marks only
things that are genuinely load-bearing (content/UI separation, accessible semantics, no
invented metrics). Everything else is a strong default you can deviate from without a
committee. Just leave a one-line note in `docs/DECISIONS.md` so future-you knows it was a
choice, not an oversight.

---

## Table of contents

1. [Product definition](#1-product-definition)
2. [Technical decisions](#2-technical-decisions)
3. [Architecture & rendering approach](#3-architecture--rendering-approach)
4. [Repository layout](#4-repository-layout)
5. [Content model](#5-content-model)
6. [Design system](#6-design-system)
7. [Information architecture & routes](#7-information-architecture--routes)
8. [Page specifications](#8-page-specifications)
9. [Component contracts](#9-component-contracts)
10. [Motion system](#10-motion-system)
11. [Accessibility](#11-accessibility)
12. [Performance & media — guidance, not gates](#12-performance--media--guidance-not-gates)
13. [SEO, metadata & structured data](#13-seo-metadata--structured-data)
14. [Contact backend](#14-contact-backend)
15. [Testing — lightweight and non-blocking](#15-testing--lightweight-and-non-blocking)
16. [CI/CD & deployment](#16-cicd--deployment)
17. [Definition of done](#17-definition-of-done)
18. [Delivery plan](#18-delivery-plan)
19. [Open questions for the owner](#19-open-questions-for-the-owner)
20. [Content intake checklist](#20-content-intake-checklist)
21. [Guardrails](#21-guardrails)
- [Appendix A — Command reference](#appendix-a--command-reference)
- [Appendix B — Golden sample definition](#appendix-b--golden-sample-definition)
- [Appendix C — Change log](#appendix-c--change-log)

---

## 1. Product definition

### 1.1 Goal

A production-grade personal portfolio that convinces a technical hiring manager, a
recruiter, or a prospective client, within roughly two minutes, that the owner can design
and ship AI-enabled products and dependable full-stack systems.

### 1.2 Primary audiences, in priority order

| # | Audience | What they need in the first 30 seconds | Path they take |
|---|---|---|---|
| 1 | Engineering hiring manager / tech lead | Evidence of real systems, architectural judgment, code quality | Home → featured project → project detail → code highlights |
| 2 | Recruiter / non-technical screener | Role, stack, seniority signals, contact route, résumé | Home hero → experience → contact |
| 3 | Prospective freelance client | Can this person solve my problem, and are they available | Home → selected work → contact |
| 4 | Peer engineer | Depth, taste, whether the source is worth reading | Projects index → detail → GitHub |

### 1.3 Success criteria

- The site reads as finished, considered, and specific. Never templated or generic.
- Accessibility and keyboard operability are strong throughout (target: WCAG 2.2 AA, see
  §11). This is a bar we aim for and verify, not a CI gate that blocks shipping.
- Adding a new project requires only adding a JSON file and its images, with zero UI edits.
- No claim on the site is unverifiable, and no metric is invented.
- Performance, bundle size, and deployment topology are **explicitly deferred**. They get
  addressed once the product is real, in a dedicated hardening pass, not before.

### 1.4 Non-goals (v1)

- A blog or CMS.
- Internationalization.
- User accounts, comments, or persisted visitor state beyond a theme preference.
- A design-token theme switcher beyond light/dark.
- Deep multi-thousand-word case studies. Project pages are substantive but short.

Unlike v1.0, this list is **not** a technical-feature blocklist. It is scope, not
architecture. See §3.

### 1.5 Voice & content principles

Binding on all copy on the live site:

- First person where ownership matters: "I designed," "I built," "I chose."
- Lead with the constraint and the outcome; mention a technology only where its use was a
  real decision.
- **Never invent a metric.** Where numbers are unavailable, use verifiable scope: "three-role
  RBAC model," "35+ relational tables," "background processing pipeline for uploaded
  documents."
- No "passionate developer," "tech enthusiast," "problem solver" without concrete context.
- Attribute team work accurately; state your own contribution.
- Redact client data, credentials, and proprietary architecture.
- **Em dashes are rare.** Use them only when no other punctuation does the job as cleanly.
  Most sentences that reach for one are better served by a period, a comma, a colon, or a
  parenthetical. This applies to real site copy; it does not apply retroactively to this
  document's own prose.
- All assets, copy, and layout are original. The reference portfolio informs *information
  hierarchy only*, never visual design, wording, or components.

---

## 2. Technical decisions

| Area | Decision | Notes |
|---|---|---|
| Runtime | Node.js LTS (22.x) | Pin via `.nvmrc` + `engines`; upgrades are deliberate, separate PRs |
| Package manager | pnpm | Pin via `packageManager` field |
| Framework | Next.js, App Router | Full feature set available, see §3 |
| UI runtime | React 19 | |
| Language | TypeScript, `strict` | Stay on whatever `create-next-app` scaffolds unless there is a specific reason to move |
| Styling | Tailwind CSS v4, CSS-first `@theme` | Design tokens live in CSS, consumed by Tailwind and raw CSS alike |
| Validation | Zod | Build-time and runtime content validation; types derived from schemas |
| Motion | Motion for React (`motion/react`) | `MotionConfig reducedMotion="user"` gives a global a11y guarantee |
| UI primitives | shadcn/ui (selective) | Copy in only what is needed; the rest is ours |
| Syntax highlighting | **None for now.** Plain `<pre><code>` | Styled with the `code` token, no colouring, no dependency. Revisit only when a real need appears. See §12.4 |
| Images | `next/image`, `unoptimized: true` for now | Replaces the `sharp` build pipeline. See §12.2 |
| Testing — unit | Vitest | Lightweight, advisory, see §15 |
| Testing — e2e & a11y | Playwright + `@axe-core/playwright` | Advisory, not a merge gate |
| Lint / format | ESLint + Prettier | Flat config; Prettier owns formatting, ESLint owns correctness |
| Domain | `mukeremshifa.com`, apex canonical | Resolved 2026-08-15. `www` redirects to the apex. Drives `metadataBase`, canonical URLs, sitemap, OG cards, and contact CORS |
| Hosting | **Vercel** | Resolved 2026-08-15. Git integration deploys `main` to production and every other branch to a preview; no `deploy.yml` (§16.3) |
| Backend & storage | **Cloudflare** (Workers, R2) | Resolved 2026-08-15. The zone already lives in Cloudflare DNS. The contact endpoint is therefore cross-origin, which makes §14's CORS allowlist load-bearing rather than a formality |
| Contact backend | Cloudflare Worker on `api.mukeremshifa.com` | §14. Subdomain reserved in Phase 0, built in Phase 4 |
| Large assets | Repo `public/` for now, Cloudflare R2 when they outgrow it | Not worth moving until there is a real résumé PDF and real images |

### 2.1 What changed from v1.0, and why

| v1.0 constraint | Status now | Reason |
|---|---|---|
| `output: "export"`, static-only | **Removed.** Full Next.js is available. | The static-export rulebook (§3 of v1.0) existed to protect a performance budget nobody had asked for yet. |
| "No JavaScript" rule, no-JS Playwright gate | **Removed.** | Ship what the product needs. A 10 MB client bundle is fine if that is what quality requires; trim it later with real data, not a guess made before any content existed. |
| First-load JS budgets (130–140 KB) | **Removed.** | Same reasoning, a premature optimization target. |
| `shiki` (build-time highlighting) | **Removed as a dependency.** | Not permitted per owner instruction. Its intended replacement was dropped too; see the next row. |
| `prism-react-renderer` (v2.0's replacement for `shiki`) | **Removed before it was ever installed** (2026-08-15). | Nothing had been built against it. Snippets on this site are short and captioned, so plain `<pre><code>` on the `code-bg` token reads fine, and dropping the package removes a client component, a dual-theme configuration, and a language-id contract that content would have had to honour. Deferred rather than refused: swapping a highlighter in later is contained to `CodeBlock` (§12.4). |
| `sharp` (build-time image pipeline) | **Removed as a dependency.** | Not permitted per owner instruction. `next/image` with `unoptimized: true` covers layout stability and lazy-loading without it; a real optimization pass can be added later without touching markup (§12.2). |
| Server Actions / Route Handlers / middleware / SSR / ISR forbidden | **Removed.** | No restriction on Next.js features. Use whatever the page actually needs. |
| Content placeholders (`TODO`, `Lorem`, brackets) banned everywhere | **Scoped to pre-launch, not every build.** | Early phases intentionally ship stub content and generic placeholder assets, see §5.6. |
| Hard performance/a11y/testing CI gates that block merges | **Downgraded to advisory.** | See §15 through §17. |
| `scripts/check-contrast.mjs` (CI contrast gate) | **Removed.** | It existed to enforce a gate that no longer exists. The measured ratios it produced are quoted inline in §6.1 and remain accurate; if a checker is wanted again it is a single file to restore. |

---

## 3. Architecture & rendering approach

There is no rendering-strategy lock-in this time. Use whichever Next.js primitive fits each
page (static generation, server rendering, Server Actions, Route Handlers, middleware, ISR)
without needing to justify it in a PR description. In practice, most of this site probably
wants to be statically generated at build time anyway (it is a portfolio, not a dashboard),
but that should be a page-by-page choice made because it is simplest, not because a rule
requires it.

Two things stay true regardless of rendering mode, because they are good practice
independent of performance:

- **Content lives in `content/`, not in components.** A component that imports directly from
  `content/` instead of receiving data as props is a bug. See §5.1 and §9.
- **The contact path degrades gracefully.** If a backend endpoint is unavailable, the direct
  `mailto:` link still works. This was true in v1.0 for resilience reasons that have nothing
  to do with performance, so it stays.

Everything else (image optimization strategy, whether pages are prerendered or rendered per
request, how big the client bundle gets) is deliberately unresolved until there is a real
product to measure. §12 covers what "later" looks like when it arrives.

---

## 4. Repository layout

Reconciled against the tree on 2026-09-01. Where this drifted from what shipped, the tree
won and this section was rewritten — the drift itself is recorded in §4.2 rather than
silently corrected, because three of the differences were decisions rather than oversights.

```text
portfolio/
├── .github/workflows/          # empty; `ci.yml` was never written (§4.2, §16.2)
├── app/
│   ├── layout.tsx              # html/body, fonts, theme script, MotionProvider, skip link
│   ├── globals.css             # tailwind import, @theme tokens, base layer, scrollbar removal
│   ├── page.tsx                # home
│   ├── not-found.tsx
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── manifest.ts             # PWA manifest (§13.5)
│   ├── opengraph-image.tsx     # root OG card (§13.4)
│   ├── icon.svg, apple-icon.png, favicon.ico
│   ├── api/contact/route.ts    # the contact endpoint (§14) — a Next route, not a Worker
│   ├── about/page.tsx
│   ├── projects/page.tsx
│   ├── projects/[slug]/page.tsx
│   ├── projects/[slug]/opengraph-image.tsx
│   ├── experience/page.tsx
│   ├── skills/page.tsx         # renamed from certifications/ (§7.1)
│   ├── contact/page.tsx
│   └── dev/primitives/page.tsx # Phase 1 primitive gallery; not linked, not in the sitemap
├── components/
│   ├── layout/                 # SiteHeader, MainNav, MobileNavigation, SiteFooter, SkipLink,
│   │                           #   ThemeToggle, ThemeScript, SectionRail
│   ├── brand/                  # Monogram, Wordmark, Signature (§13.5)
│   ├── home/                   # Hero, FeaturedProjects, EngineeringFocus, ExperiencePreview,
│   │                           #   CredentialsPreview, TechnologyList, ContactCallout
│   ├── projects/               # ProjectCard, ProjectGrid, ProjectFilter, ProjectExplorer,
│   │                           #   ProjectFacts, CaseStudySummary, CaseStudyNavigation,
│   │                           #   CodeHighlight, ScreenshotGallery
│   ├── experience/             # ExperienceTimeline, ExperienceEntry
│   ├── about/                  # ProfileHeader, EducationList
│   ├── certifications/         # CertificationCard, CertificationGrid — rendered by /skills/
│   ├── contact/                # ContactForm, ContactField, ContactChannels
│   ├── motion/                 # MotionProvider + 10 wrappers (§9.4)
│   └── ui/                     # Button, Tag, SectionHeading, ExternalLink, StatusBadge,
│                               #   Container, Prose, Figure, CodeBlock, CopyButton, BulletList,
│                               #   BrandIcon, VisuallyHidden
├── content/
│   ├── site.json               # identity, socials, availability, location, résumé, portrait
│   ├── projects/*.json
│   ├── experience/timeline.json
│   ├── education/education.json    # split out of the timeline 2026-08-31
│   ├── certifications/certifications.json
│   ├── skills/skills.json
│   └── focus/focus.json        # engineering-focus pillars
├── lib/
│   ├── schemas.ts              # Zod schemas — the only place shapes are defined
│   ├── content.ts              # load, validate, and derived selectors
│   ├── metadata.ts             # buildMetadata(), canonical URLs
│   ├── structured-data.ts      # JSON-LD builders
│   ├── og.ts                   # shared OG card rendering (§13.4)
│   ├── contact.ts              # endpoint payload handling and delivery (§14)
│   ├── rate-limit.ts           # Upstash two-window limiter (§14.2)
│   ├── brand-marks.ts          # generated by scripts/build_brand.py; Prettier-ignored
│   └── utils.ts                # cn(), formatDate(), and friends
├── public/
│   ├── images/                 # real assets; projects/ holds the light/dark cover pairs
│   ├── placeholders/           # generic stub svg/pdf still referenced by §5.6
│   ├── brand/                  # monogram, wordmark, avatar, OG monogram
│   ├── icons/                  # PWA icons
│   └── Mukerem-Shifa-Resume.pdf
├── scripts/
│   ├── build_brand.py          # renders the brand marks into lib/brand-marks.ts
│   └── build_covers.py         # 8K source renders → committed AVIF cover pairs
└── docs/
    ├── PORTFOLIO_SPEC.md       # this file
    ├── DECISIONS.md            # append-only log of deviations from this file
    ├── STUB-INVENTORY.md       # the swap matrix and what is still synthetic
    └── templates/              # project JSON template and its README
```

### 4.1 Conventions (kept from v1.0, these were never about performance)

- Path alias `@/*` maps to the repo root.
- One component per file, `PascalCase.tsx`, named exports outside `app/` route files.
- `"use client"` sits on line 1 and as close to the leaf as it needs to be. There is no
  requirement to minimize client components for their own sake anymore, but keeping content
  fetching in server components where natural is still good hygiene.
- Content files are `kebab-case.json`; for projects the filename matches the `slug` field.
- No component reads the filesystem. Content enters through `lib/content.ts` only.
- `docs/DECISIONS.md` gets one entry per meaningful deviation from this spec.

### 4.2 Where the tree and this section had diverged

Recorded rather than quietly fixed, because each of these is a standing fact about the
project and not a typo:

| Was specified | What is actually there | Standing |
|---|---|---|
| `worker/` for the contact endpoint | `app/api/contact/route.ts` | **Decided.** The endpoint is a Next route on Vercel, not a Cloudflare Worker — `DECISIONS.md`, 2026-09-01. §14 is amended to match |
| `tests/unit/`, `tests/e2e/` | Neither exists; Vitest is not installed | **Outstanding.** Phase 2's exit criterion named the §5.5 invariant tests and they were never written. See §15.3 |
| `.github/workflows/ci.yml` | `.github/` is empty | **Outstanding.** Phase 0 called for a stub; nothing was committed. §16.2 now says so |
| `public/og/` | OG cards are generated per route by `opengraph-image.tsx` | **Decided.** §13.4 always described generation; the directory was a leftover from a static-export draft |
| `app/certifications/page.tsx` | `app/skills/page.tsx` | **Decided.** Renamed 2026-08-31, §7.1, with a permanent redirect in `next.config.ts` |
| `components/motion/` "Reveal, Stagger" | Eleven wrappers as of 2026-09-02 | **Decided.** §9.4 |

---

## 5. Content model

Unchanged in substance from v1.0, this was the strongest part of the original spec.
`lib/schemas.ts` is the only place a shape is declared; all TypeScript types are inferred
from it with `z.infer`.

### 5.1 Validation gate

`lib/content.ts` reads and parses every content file and throws on failure, so a malformed
content file fails the build with a precise error instead of shipping a broken page.

Public API:

```ts
getSite(): Site
getFocus(): FocusPillar[]              // exactly 3
getSkills(): SkillGroup[]
getAllProjects(): Project[]            // sorted by `order`, then year desc
getFeaturedProjects(): Project[]       // featured === true, max 3
getProjectSlugs(): string[]
getProjectBySlug(slug: string): Project
getAdjacentProjects(slug: string): { prev?: ProjectRef; next?: ProjectRef }
getFeaturedCaseStudy(): Project
getExperience(): ExperienceEntry[]
getCertifications(): Certification[]
getEducation(): Education[]                       // added 2026-08-31, newest first
```

### 5.2 `content/site.json`

```ts
export const SiteSchema = z.object({
  name: z.string().min(1),
  wordmark: z.string().min(1).max(4),
  role: z.string().min(1),
  eyebrow: z.string().min(1).max(60),
  headline: z.string().min(1).max(90),
  intro: z.string().min(80).max(400),   // home hero + Person description; cool register
  bio: z.string().min(80).max(700),     // added 2026-08-31 — /about/ only; first person
  email: z.email(),
  location: z.object({
    label: z.string(),            // `remote: z.boolean()` deleted 2026-08-31 — see §7.3
  }),
  // Added 2026-08-31. `level` is a free optional string, not an enum, for the reason §5.4
  // refuses proficiency scales: a fixed ladder invites an unfalsifiable self-assessment.
  languages: z.array(z.object({
    name: z.string().min(1),
    level: z.string().min(1).optional(),
  })).min(1),
  availability: z.object({
    show: z.boolean(),
    state: z.enum(["available", "open", "unavailable"]),
    label: z.string().max(60),
  }),
  resume: z.object({
    url: AssetPathOrUrl,                         // root-relative path or absolute URL
    updated: z.string().regex(/^\d{4}-\d{2}$/),
  }).optional(),
  portrait: z.object({                           // §8.1's ProfileVisual; absence collapses
    src: z.string(),                             //   the hero to a single column
    alt: z.string().min(10),
    width: z.int().positive(),
    height: z.int().positive(),
  }).optional(),
  avatar: z.object({                             // added 2026-08-31; §8.5's circle crop.
    src: z.string(),                             //   1:1, a separate export from portrait —
    alt: z.string().min(10),                     //   a 4:5 image in a circle loses a head
    width: z.int().positive(),
    height: z.int().positive(),
  }).optional(),
  socials: z.array(z.object({
    platform: z.enum(["github", "linkedin", "email", "x", "other"]),
    label: z.string(),
    url: z.url(),
  })).min(2),
  // featuredCaseStudySlug removed 2026-08-31 with the home section it fed.
  seo: z.object({
    title: z.string().max(60),
    description: z.string().min(70).max(160),
  }),
  contact: z.object({
    headline: z.string(),
    body: z.string(),
    endpoint: z.url().optional(),
  }),
});
```

`AssetPathOrUrl` is `z.union([z.url(), z.string().regex(/^\/[^\s]*$/)])`. `resume.url` needs
it because the résumé is a same-origin asset: `z.url()` rejects `/placeholders/…`, and the
only way to satisfy it was to write the production origin into a content file — which
`SITE_ORIGIN` exists to derive exactly once, and which would break on localhost and emit a
production URL from every preview (§16.4). `socials[].url` deliberately stays `z.url()`:
those destinations are genuinely external, and a relative social link is always a mistake
rather than a case worth admitting.

`portrait` is optional, and the optionality is load-bearing rather than incidental. §8.1
requires the hero to collapse to a single column when there is no `ProfileVisual`, so
absence is a rendered state that has to be reachable by deleting the field. `width` and
`height` are required for the same reason §5.3's images carry them. `alt` carries the same
10-character floor, which is worth revisiting once a real photograph exists: a portrait
beside its subject's own name and role is arguably decorative under §11.4, and `alt=""` is
what §11.4 would then want. Do not weaken the floor for a placeholder.

### 5.3 `content/projects/<slug>.json`

```ts
export const ProjectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  title: z.string().min(1).max(80),
  summary: z.string().min(60).max(200),
  category: z.enum(["AI/ML", "Full-Stack", "Systems"]),
  status: z.enum(["completed", "in-progress", "maintained"]),
  featured: z.boolean(),
  order: z.number().int(),
  year: z.object({
    start: z.string().regex(/^\d{4}$/),
    end: z.string().regex(/^\d{4}$/).nullable(),
  }),
  role: z.string().min(1),
  team: z.string().min(1),
  technologies: z.array(z.string()).min(3).max(12),
  links: z.object({
    github: z.url().optional(),
    live: z.url().optional(),
    docs: z.url().optional(),
  }).default({}),
  cover: z.object({                              // optional since 2026-08-31
    src: z.string(),
    alt: z.string().min(10),
    width: z.int().positive(),                   // intrinsic pixels — next/image needs them
    height: z.int().positive(),
  }).optional(),
  overview: z.array(z.string()).min(1).max(3),
  features: z.array(z.object({                   // absorbed `capabilities` on 2026-08-30
    title: z.string(),
    body: z.string(),
  })).min(2).max(8),
  lessons: z.array(z.string()).max(5).default([]),
  caseStudy: z.object({
    challenge: z.string(),
    decision: z.string(),
    outcome: z.string(),
  }).optional(),
  seo: z.object({
    title: z.string().max(60),
    description: z.string().max(160),
  }).optional(),
});
```

`width` and `height` are intrinsic pixel dimensions and they are required, not optional.
`next/image` needs them (or `fill` inside a sized parent) to reserve space before the file
arrives, and `images.unoptimized` does not change that — it removes the optimization
pipeline, not the layout-stability requirement (§12.1). A static import would supply them
automatically, but `src` arrives from JSON as a string, so the author supplies them
instead. `fill` inside a fixed aspect-ratio box is the alternative and it is the wrong one
here: it cannot serve an asset whose shape it does not already know without letterboxing or
cropping. See `docs/DECISIONS.md`.

**Amended 2026-08-30.** `capabilities`, `codeSnippets`, and `screenshots` were removed. A
project carries one image, its `cover`, so this requirement now applies to that field alone
— but it applies no less: the cover is `priority` and above the fold, and it is the one
image on the site whose missing dimensions would shift the page a reader is already looking
at. The original argument rested on Appendix B's mixed-aspect-ratio screenshots, which no
longer exist; the conclusion outlives the argument, so the rule stays and the reasoning is
restated rather than left pointing at something deleted.

### 5.4 Experience, certifications, skills, focus

```ts
const YearMonth = z.string().regex(/^\d{4}-\d{2}$/);

export const ExperienceSchema = z.object({
  id: z.string(),
  role: z.string(),
  organization: z.string(),
  organizationUrl: z.url().optional(),
  // "education" removed 2026-08-31 — see EducationSchema below and DECISIONS.md
  type: z.enum(["employment", "freelance", "internship", "research", "independent"]),
  start: YearMonth,
  end: YearMonth.nullable(),
  location: z.string().optional(),
  summary: z.string().min(40).max(300),
  achievements: z.array(z.string()).min(1).max(5),
  technologies: z.array(z.string()).max(10).default([]),
  featured: z.boolean().default(false),
}).refine((e) => e.end === null || e.end >= e.start, {
  message: "end must not precede start",
});

// Added 2026-08-31. A degree has a credential you were awarded, not a role you performed.
export const EducationSchema = z.object({
  id: z.string(),
  credential: z.string(),
  institution: z.string(),
  institutionUrl: z.url().optional(),
  start: YearMonth,
  end: YearMonth.nullable(),
  location: z.string().optional(),
  note: z.string().min(40).max(300),
  highlights: z.array(z.string()).max(3).default([]),
}).refine((e) => e.end === null || e.end >= e.start, {
  message: "end must not precede start",
});

export const CertificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  issuer: z.string(),
  issuerUrl: z.url().optional(),
  issued: YearMonth,
  expires: YearMonth.nullable().default(null),
  credentialId: z.string().optional(),
  credentialUrl: z.url().optional(),
  skills: z.array(z.string()).min(2).max(4),
  featured: z.boolean().default(false),
});

export const SkillGroupSchema = z.object({
  id: z.string(),
  title: z.string(),
  items: z.array(z.string()).min(3).max(10),
});
// Deliberately no proficiency field of any kind. Grouping is by use context (§1.5).

export const FocusPillarSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string().min(60).max(260),
  technologies: z.array(z.string()).max(6).default([]),
});
```

### 5.5 Cross-file invariants

Worth checking (with a unit test, once one exists), but treat these as quality checks, not
build-blocking gates during early development:

| # | Invariant | Failure it prevents |
|---|---|---|
| 1 | Project slugs are unique | Two pages competing for one URL |
| 2 | Project filename equals its `slug` | Drift between the file tree and routes |
| 3 | `featured: true` count is between 1 and 3 | Home grid layout breaking |
| 4 | ~~`site.featuredCaseStudySlug` resolves and that project has a `caseStudy` block~~ **Retired 2026-08-31** with the field and the home section. The numbering is kept so 5 to 8 still mean what other documents say they mean | — |
| 5 | Every `cover.src` and `screenshots[].src` exists | Broken images |
| 6 | Exactly 3 focus pillars | A broken three-column layout |
| 7 | At most one experience entry per organization has `end: null` | Two simultaneous "Present" roles |
| 8 | Every technology string appears in at least one skills group, or is explicitly allowlisted | Vocabulary drift between pages |
| 9 | **Added 2026-08-31.** `content/education/` is the only place a qualification appears | A degree rendering as a job. Enforced by the schema rather than by a test: `ExperienceSchema` no longer accepts `type: "education"` |

The v1.0 invariant banning `TODO`/`Lorem`/bracketed placeholders **everywhere** is gone from
this list. See §5.6.

### 5.6 Placeholder & stub content policy (new)

During Phases 0 through 4, real content will not exist yet. That is expected, not a bug:

- **Placeholder assets.** Any image slot (project covers, screenshots, hero visual) can point
  at a generic asset under `public/placeholders/`. A plain labeled SVG or a neutral
  stock-style PNG/WebP is fine. Name them descriptively
  (`placeholder-project-cover.svg`, `placeholder-screenshot-16x9.svg`) so it is obvious at a
  glance what will replace them.
- **Synthetic copy.** Project descriptions, bios, and other text can use clearly-synthetic
  stand-in content while the layout is being built, as long as it is structurally realistic
  (right length, right shape) so it exercises the actual layout, per Appendix B.
- **Before launch**, everything under this policy gets swept: no placeholder image, no stub
  copy, no lorem-ipsum-style text ships in the final build. This sweep is the exit criterion
  for Phase 5 (§18), not a rule enforced on every commit before then.
- **The sweep has a checklist, not a search.** From Phase 3, every stub is listed in
  `docs/STUB-INVENTORY.md` and the exit criterion is that the inventory is empty. Phase 3's
  stubs are deliberately realistic — a stub email looks like an email, so the design can be
  judged through content that behaves like content — and the cost of that is that grepping
  for the word "placeholder" no longer finds them. The inventory is the mitigation, and it
  stops being one the moment it drifts out of date. A test in `tests/unit/` was to hold the
  half a machine can check — every image `src` in `content/` still pointing under
  `/placeholders/` — and **it was never written** (§15.3), so the whole sweep is currently
  a human reading the inventory. `STUB-INVENTORY.md` says the same under its own last
  heading.

---

## 6. Design system

Direction unchanged from the brief: modern, minimalist, warm beige canvas with white cards in
light mode, crisp black with near-black elevated surfaces in dark mode, orange used sparingly. Hierarchy
comes from type, spacing, and hairline borders, not shadows or ornament.

### 6.1 Three corrections to the original draft palette

**(a) Borders need a second, stronger token.** Draft border values are decorative dividers
and measure well below 3:1 against their backgrounds. WCAG 2.2 SC 1.4.11 wants 3:1 for the
visual boundary of an actual control (inputs, outline buttons, filter chips), so the system
keeps `border-subtle` (decorative) **and** `border-strong` (interactive): `#8A8279` light,
`#7A7168` dark.

The dark value was `#333333` here and `#524A42` in the stylesheet, and *neither ever met
the 3:1 this correction exists to guarantee* — `#524A42` measured 2.04:1 on `surface` and
1.72:1 on `surface-alt`, and `#333333` is worse. `#7A7168` is the lowest warm value that
clears 3:1 against every surface it sits on (3.93 canvas, 3.70 surface, 3.11 surface-alt)
while staying well below `text`, so a control boundary never reads as content. Measured
2026-08-30.

**(b) The accent is emerald, not cobalt or orange.** Light mode is deep emerald `#184E38`
with `#103727` as its hover; dark mode lifts to warm sage `#52B788` with `#74C69D`, over an
espresso-charcoal surface stack. This section previously described a cobalt light palette
and an `#FF5100` orange dark accent; the stylesheet had moved off both without the spec
following, so §6.2 and §6.3 below are re-derived from `app/globals.css` as shipped.

**(c) Dark backgrounds are one hue family, and no longer B4's.** The `landing-page-design`
skill (B4) permits exactly six dark background values: `#000000`, `#181818`, `#1F1F1F`,
`#272727`, `#313131`, `#131209`. Only `#131209` is warm, so the 2026-08-30 revision spent
it on `canvas` and took B4 neutrals for every layer above. That is the arrangement this
correction undoes.

Those neutrals measure **C = 0.0000** in OKLCH — perfectly achromatic — under a canvas at
C = 0.0173. The eye adapts to the warm ground and swings an achromatic patch toward its
complement, so the cards read *blue*. The previous text argued the temperature break was
imperceptible at these luminances; it was right about the break and wrong about the
induction, which is what a viewer actually sees. Note the chroma ladder B4 produced ran
backwards — the page ground was the most saturated thing on screen — where the stack it
replaced went 0.005 → 0.007 → 0.010 upward.

The stack in §6.3 is therefore off B4's list end to end: hues 79.1 → 80.6 → 80.6 → 80.7,
each at the luminance of the B4 value it replaces, so §6.1(a)'s and §6.3's measurements
survive the change (four moved by 0.01). `canvas` is a pure hue rotation of `#131209` at
identical L and chroma, 102.6 → 79.1, which also pulls the ground onto the same axis the
ink, borders, and muted text already occupied. B4 still governs everything it did before,
including its ban on background gradients (§6.3, `hero-*`). Brand tints (`brand-soft`,
`brand-solid`) were already out of its scope. Measured 2026-08-31; see
`docs/DECISIONS.md`.

**B4 is not absolute, and the spec should have said so.** The skill lives at
`.claude/skills/landing-page-design/SKILL.md`, and its Scope section reads: *"When a rule
here conflicts with a framework default, this file wins. When the user's explicit prompt
conflicts with a rule, the user wins."* Every B4 citation in this document — here, §6.3,
§6.5 — is subject to that clause. The 2026-08-30 revision treated the six-value list as
inviolable and rebuilt the dark stack around its single warm entry; had the clause been
recorded, that revision would likely have gone differently.

**(d) Light ink was blue.** `text` `#1E2229` and `text-muted` `#5C6470` measured hue 262
and hue 258, in a palette whose every other token sits between 67 and 81 — the last two
values still carrying the temperature of the cobalt accent (b) retired. They become
`#26211A` and `#6B6256`, pure hue rotations holding OKLab L, which moves §6.2's ratios by
0.01 and leaves light mode the mirror of dark rather than its opposite. Measured
2026-08-31.

### 6.2 Colour tokens — light

| Token | Value | Role |
|---|---|---|
| `canvas` | `#F3ECE2` | Page background |
| `surface` | `#FFFFFF` | Cards, inputs, raised panels |
| `surface-alt` | `#EDE5DA` | Code chrome, inset wells, card hover, chip background |
| `text` | `#26211A` | Primary text (13.62:1 on `canvas`) |
| `text-muted` | `#6B6256` | Secondary text, metadata (5.11:1 on `canvas`) |
| `brand` | `#184E38` | Links, primary fill, accents |
| `brand-hover` | `#103727` | Hover and active accent (text and links) |
| `brand-solid` | `#184E38` | Filled button surface only |
| `brand-solid-hover` | `#103727` | Hover fill under `brand-contrast` text |
| `brand-contrast` | `#FFFFFF` | Text on a brand fill |
| `brand-soft` | `#E4EFE9` | Tinted badge background |
| `border-subtle` | `#E4DBD0` | Decorative dividers only |
| `border-strong` | `#8A8279` | Control boundaries (3.03:1 on `surface-alt`) |
| `ring` | `#184E38` | Focus indicator |
| `danger` | `#B42318` | Form errors |
| `success` | `#05683F` | Form success |
| `warning` | `#8A5A00` | Warnings |
| `code-bg` | `#FBF8F3` | Code block background |
| `hero-from` | `#000000` | B5 hero heading gradient, start |
| `hero-to` | `#666666` | B5 hero heading gradient, end (4.90:1 on canvas) |

### 6.3 Colour tokens — dark

No background value below is one of B4's six; per §6.1(c) the stack is a single hue
family, held at the luminance of the B4 values it replaces.

| Token | Value | Role |
|---|---|---|
| `canvas` | `#161109` | Page background. Hue rotation of `#131209` at identical L and chroma |
| `surface` | `#1B1813` | Cards, inputs, raised panels |
| `surface-alt` | `#2A2722` | Card hover, popovers, chip background |
| `text` | `#F3ECE2` | Primary text (16.01:1 on canvas) |
| `text-muted` | `#A3988C` | Secondary text, metadata (6.64:1 on canvas) |
| `brand` | `#52B788` | Links and accent text (7.59:1 on canvas) |
| `brand-hover` | `#74C69D` | Hover and active accent |
| `brand-solid` | `#184E38` | Filled button surface only |
| `brand-solid-hover` | `#216A4D` | Hover fill under `brand-contrast` text |
| `brand-contrast` | `#FFFFFF` | Text on `brand-solid` |
| `brand-soft` | `#172A21` | Tinted badge background |
| `brand-cream` | `#F3ECE2` | Legacy alias for key tag accents |
| `border-subtle` | `#34312C` | Decorative dividers only |
| `border-strong` | `#7A7168` | Control boundaries (3.11:1 on `surface-alt`) |
| `ring` | `#52B788` | Focus indicator |
| `danger` | `#F04438` | Form errors (4.71:1 on `surface`) |
| `success` | `#12B76A` | Form success |
| `warning` | `#F79009` | Warnings |
| `code-bg` | `#1B1813` | Code block background |
| `hero-from` | `#FFFFFF` | B5 hero heading gradient, start |
| `hero-to` | `#9B9B9B` | B5 hero heading gradient, end (6.76:1 on canvas) |

**Binding rules.**

- `border-subtle` may never be the only thing identifying an interactive control.
- Never place body text on `brand-solid` in dark mode except in `brand-contrast` white.
- `brand-cream` remains dark-mode-only as a compatibility alias for the accent.
- `danger` is body text on `canvas` or `surface` only; on `surface-alt` it is 3.96:1, under AA.
- `hero-from`/`hero-to` are consumed by the hero `h1` and nothing else. B4 forbids
  background gradients outright; B5's heading is the single exception, and it is on text.

### 6.4 Token wiring (Tailwind v4)

```css
/* app/globals.css */
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

:root {
  --canvas: #f3ece2;  --surface: #ffffff;  --surface-alt: #ede5da;
  --text: #26211a;    --text-muted: #6b6256;
  --brand: #184e38;   --brand-hover: #103727;  --brand-solid: #184e38;
  --brand-solid-hover: #103727;
  --brand-contrast: #ffffff;  --brand-soft: #e4efe9;
  --border-subtle: #e4dbd0;   --border-strong: #8a8279;
  --ring: #184e38;
  --danger: #b42318;  --success: #05683f;  --warning: #8a5a00;
  --code-bg: #fbf8f3;
  --hero-from: #000000;  --hero-to: #666666;
}

.dark {
  --canvas: #161109;  --surface: #1b1813;  --surface-alt: #2a2722;
  --text: #f3ece2;    --text-muted: #a3988c;
  --brand: #52b788;   --brand-hover: #74c69d;  --brand-solid: #184e38;
  --brand-solid-hover: #216a4d;
  --brand-contrast: #ffffff;  --brand-soft: #172a21;  --brand-cream: #f3ece2;
  --border-subtle: #34312c;   --border-strong: #7a7168;
  --ring: #52b788;
  --danger: #f04438;  --success: #12b76a;  --warning: #f79009;
  --code-bg: #1b1813;
  --hero-from: #ffffff;  --hero-to: #9b9b9b;
}

@theme inline {
  --color-canvas: var(--canvas);
  --color-surface: var(--surface);
  --color-surface-alt: var(--surface-alt);
  --color-text: var(--text);
  --color-text-muted: var(--text-muted);
  --color-brand: var(--brand);
  --color-brand-hover: var(--brand-hover);
  --color-brand-solid: var(--brand-solid);
  --color-brand-solid-hover: var(--brand-solid-hover);
  --color-brand-contrast: var(--brand-contrast);
  --color-brand-soft: var(--brand-soft);
  --color-brand-cream: var(--brand-cream);
  --color-border-subtle: var(--border-subtle);
  --color-border-strong: var(--border-strong);
  --color-danger: var(--danger);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-code-bg: var(--code-bg);
  --color-hero-from: var(--hero-from);
  --color-hero-to: var(--hero-to);
}
```

**Two deliberate omissions from `@theme inline`.**

- **`ring` is not a Tailwind colour.** §6.8 consumes it exactly once, as `var(--ring)` inside
  a raw `outline` declaration on `:focus-visible`. A `ring-ring` utility would be a second
  way to spell the same thing and an invitation to apply the focus treatment somewhere it
  does not belong, so it stays a plain custom property.
- **`brand-cream` is undefined in `:root`.** It is dark-mode-only by §6.3's binding rules.
  Leaving it undefined in light mode means `text-brand-cream` resolves to nothing there
  rather than silently rendering beige on white — the failure is visible, which is the point.

### 6.5 Theming mechanics

- **Strategy:** `class` on `<html>`, driven by a `ThemeToggle` client component with three
  states (`system` default, `light`, `dark`) persisted in `localStorage`.
- **No flash:** a small inline script in `<head>`, rendered before paint, reads the stored
  preference and `prefers-color-scheme` and sets the class synchronously.
- **`color-scheme`:** set `color-scheme: light dark` on `:root` so form controls, scrollbars,
  and the address bar follow the theme.
- The toggle is a menu of three options or a cycling button with an accurate `aria-label`
  naming the *next* state.

### 6.6 Typography

**Three families**, per the owner's direction. This replaces the "two families maximum"
rule from v1.0:

| Family | Role |
|---|---|
| **Source Serif 4** | Display and headline type: hero headline, page `h1`s, section `h2`s. Gives the site a considered, editorial voice instead of a generic SaaS sans everywhere. |
| **Instrument Sans** | Body text and UI chrome: paragraphs, navigation, buttons, labels, form fields, metadata. The workhorse family; everything that needs to be read quickly and clearly. |
| **IBM Plex Mono** | Code blocks, inline code, technology tags/chips, and other technical or data-flavored bits (dates, facts lists). |

Loaded through `next/font` (self-hosted at build, no external font-CDN request), variable
weights where available, `display: swap`. Since there is no font-file budget anymore, load
what each family actually needs, but there is still no reason to pull in more than the
weights actually used in the type scale below.

| Token | Family | Size (clamp) | Line height | Tracking | Use |
|---|---|---|---|---|---|
| `display-1` | Source Serif 4 | `clamp(2.5rem, 1.6rem + 3.6vw, 4.5rem)` | 1.05 | -0.01em | Hero headline, once per page |
| `display-2` | Source Serif 4 | `clamp(2rem, 1.5rem + 2vw, 3rem)` | 1.1 | -0.01em | Page titles (`h1` on inner routes) |
| `heading-1` | Source Serif 4 | `clamp(1.5rem, 1.3rem + 0.8vw, 1.875rem)` | 1.2 | 0 | Section headings (`h2`) |
| `heading-2` | Instrument Sans | `1.25rem` | 1.3 | -0.01em | Card titles, subsections (`h3`) |
| `heading-3` | Instrument Sans | `1.0625rem` | 1.4 | 0 | Feature titles (`h4`) |
| `body-lg` | Instrument Sans | `1.125rem` | 1.65 | 0 | Hero intro, section leads |
| `body` | Instrument Sans | `1rem` | 1.7 | 0 | Default |
| `body-sm` | Instrument Sans | `0.875rem` | 1.6 | 0 | Metadata, captions, chips |
| `eyebrow` | IBM Plex Mono | `0.75rem` | 1.4 | 0.08em | Uppercase section labels; the mono gives eyebrows a technical, label-like feel |
| `code` | IBM Plex Mono | `0.875rem` | 1.6 | 0 | Code blocks and inline code |

Rules: measure caps at 68 characters for prose; one `display-1` per page; the eyebrow is
presentational and must never substitute for a real heading in the outline.

**Still three families.** The brand marks (§13.5) are lettering from a fourth face, but it
is never loaded as a font: the marks ship as outlines and the face is not in the repo. The
`display-1` row above therefore describes the hero's *fallback*. On the home page the slot
is filled by the drawn signature instead, which is artwork with the heading text kept
underneath it. See `docs/DECISIONS.md`, 2026-08-30.

### 6.7 Space, layout, radius, elevation

- **Spacing scale:** the Tailwind 4px base. Component padding uses 12/16/24; section padding
  uses 64px mobile and 112px desktop; the gap between a section heading and its content is
  32px.
- **Containers:** `--container-content: 1200px` (grids, cards) and `--container-prose: 720px`
  (running text). Gutters: 20px mobile, 32px at `md`, 48px at `xl`.
- **Breakpoints:** Tailwind defaults. Design and review at 320, 768, and 1280.
- **Radii:** all radius tokens and radius utilities are `0px`; every surface, control, chip,
  media element, and status marker has square edges.
- **Elevation:** default is a 1px `border-subtle` plus a surface change. One shadow token,
  `--shadow-overlay`, reserved for the mobile navigation panel and any dialog. Cards do not
  get shadows in either theme.
- **Grid:** 12 columns at `lg` and up, 1 column below `md`. The featured project spans full
  width; secondary project cards are two-up at `md` and up.

### 6.8 Component style rules

- **Buttons.** Three variants: `primary` (brand fill, `brand-contrast` text), `secondary`
  (transparent, `border-strong`, `text`), `ghost` (text-only, used inside cards). Minimum hit
  area 44×44 CSS px.
- **Cards.** `surface` background, `border-subtle`, zero radius, padding 24px. Hover raises
  the border to `border-strong` and shifts the background to `surface-alt`. The whole card
  is not a link; the title anchor carries a stretched pseudo-element.
- **Tags / chips.** `body-sm` in **IBM Plex Mono** (technologies read like data, not prose),
  `surface-alt` background, `border-subtle`, zero radius. In dark mode a key tag may use
  `brand-cream` text.
- **Links.** In running prose, brand-coloured with a 1px underline offset by 3px; underline
  thickens on hover. Navigation and card links are not underlined at rest but gain one on
  hover and focus.
- **Focus.** One global treatment: `outline: 2px solid var(--ring); outline-offset: 2px`,
  applied through `:focus-visible`.
- **Status badge.** Maps `status` and `availability.state` to colour **plus** a text label.
---

## 7. Information architecture & routes

The journey the site must produce: **identity → proof of capability → technical depth → an
easy way to make contact.** Every page ends with a route onward; no page is a dead end.

### 7.1 Route table

| Route | File | `h1` | Purpose |
|---|---|---|---|
| `/` | `app/page.tsx` | Hero headline | Position, prove, route onward |
| `/projects/` | `app/projects/page.tsx` | "Projects" | Full index of work |
| `/projects/<slug>/` | `app/projects/[slug]/page.tsx` | Project title | Depth and evidence |
| `/experience/` | `app/experience/page.tsx` | "Experience" | Progression and ownership |
| `/about/` | `app/about/page.tsx` | "About" | Context the projects cannot give |
| `/skills/` | `app/skills/page.tsx` | "Skills" | Focus, tools, and credentials. **Renamed from `/certifications/` 2026-08-31**; `next.config.ts` redirects the old path permanently |
| `/contact/` | `app/contact/page.tsx` | "Contact" | Convert interest |
| `/404` | `app/not-found.tsx` | "Page not found" | Recover the visitor |
| `/sitemap.xml` | `app/sitemap.ts` | — | Discovery |
| `/robots.txt` | `app/robots.ts` | — | Crawl policy |

Rendering mode per route is an implementation detail (§3). Pick whatever is simplest.

### 7.2 Navigation

```text
[ MK ]        Projects   Experience   About   Skills        [ Let us talk → ]
```

- Header is sticky above `md`; on mobile it scrolls away and the mobile trigger sits in the
  top bar.
- Active route gets `aria-current="page"` plus a visible non-colour indicator (a 2px
  underline).
- The primary CTA in the header points at `/contact/`.
- Below `md`, links collapse into `MobileNavigation`: a dialog with a focus trap,
  Escape-to-close, a visible close button, scroll lock, focus returned to the trigger on
  close.
- `SkipLink` is the first focusable element in the DOM, visually hidden until focused,
  targets `#main`.
- Exactly one `<main id="main" tabindex="-1">` per page.

### 7.3 Footer

**Amended 2026-08-31.** The four stacked lines below became a four-block layout — identity
and place on the left, three unlabelled link columns on the right, and a rule above a
baseline row carrying the copyright and the social icons. Every string named here survives;
they are arranged across rather than down. `location.remote` was deleted from the schema
rather than relocated: the place line is one sentence now and has no room for the clause it
fed, and the hero's `availability.show` is the whole quiet-mode switch.

```text
Mukerem Shifa                      Home        Experience   GitHub
AI Engineer and Full-stack …       About       Skills       LinkedIn
based in {location.label}          Projects    Contact      Email
[handle icons live in the baseline row]
──────────────────────────────────────────────────────────────────
© {currentYear} Mukerem Shifa. Built with Next.js.        [X][IG][WA][TG]
```

Location comes from `site.json` so it cannot be overstated in markup.

### 7.4 Cross-page linking rules

- Every project card links to its detail page. Case-study and source links are never
  hover-only and never hidden behind an icon without an accessible name.
- Project detail pages end with previous/next project navigation and a contact CTA.
- The home page links to `/projects/`, `/experience/`, `/skills/`, and `/contact/`.
- External links use `ExternalLink`, which adds `rel="noopener noreferrer"`, `target="_blank"`,
  and a visually hidden "(opens in a new tab)" suffix.

---

### 7.5 Section rail and the scrollbar

**Added 2026-09-01.** The native scrollbar is the one piece of chrome the design system does
not draw: it is rounded where §6.7 makes every edge square, it carries the OS palette rather
than this one, and its metrics are per-platform. It cannot be restyled into the system —
`scrollbar-width` accepts `thin` and `none` and nothing else, and the WebKit pseudo-elements
still leave the platform's shape underneath. So it is **removed on the viewport** in
`globals.css` and `SectionRail` renders the position it was carrying.

- Removal is scoped to `html`/`body`, never globally. Code blocks scroll horizontally and
  §11.2 requires a visible affordance for that; taking their scrollbar away would delete the
  only signal that there is more to the right. Every inner scroll region keeps its own.
- The rail is `<nav aria-label="Sections">`: one dash per section, `fixed` in the right
  gutter, vertically centred, `md` and up. Below `md` there is no gutter, and mobile
  scrollbars are overlays already invisible at rest, so nothing is replaced and nothing
  renders.
- The active dash is marked with `aria-current="true"` — position *within* the page, which
  is what `true` means on a link that is not a different page. The visible state reads the
  same attribute, so announced and painted state cannot drift.
- Each label is present in the DOM at `opacity: 0`, not `display: none`, so it stays the
  link's accessible name. It is revealed on both `group-hover` and `group-focus-visible`,
  per §21's no-hover-only rule.
- The active section is the **topmost** one intersecting a band 20% from the top and 65% up
  from the bottom. Topmost rather than most-visible: a short section fully on screen would
  otherwise beat the tall one the reader is actually inside. Between two sections the last
  dash stays lit rather than blanking.
- Pages declare their own stops in page order. Ids go on wrappers, not inside components —
  a component owning a page-level anchor id can only be used once per page. `globals.css`
  hangs `scroll-margin-top` on `[data-rail-section]` so the sticky header never covers the
  heading just jumped to.
- The rail sits **after** its content in the DOM, so it never lands between the skip link and
  the page. Being `fixed`, its position in the flow costs nothing.
- Stops per route today: home 7, `/skills/` 5, `/about/` 5, `/contact/` 3 or 4 (the form stop
  exists only when `site.contact.endpoint` does), `/experience/` 3. `/projects/` and
  `/projects/[slug]/` have **no rail** — see §8.2 and §8.3.
- Below `minSections` (default 3) the rail renders nothing. Two dashes are a control telling
  the reader what they can already see.

Motion is deliberately absent here beyond a colour transition: no smooth scroll is set, no
scroll animation is driven from JS, and the dash width is fixed so the stack never reflows as
the reader scrolls. A rail whose dashes resize is motion running while someone reads, driven
by the reading itself, which §21 rules out. See §10.4.

---

## 8. Page specifications

### 8.1 Home — `/`

Section order walks the visitor from who, to proof, to how, to history, to credibility, to
contact.

**Amended 2026-08-31.** "Depth" — a fourth section promoting one project to a full
case-study block — was removed. Every project page is written as a case study now, so it
restated a page the "Selected work" cards already link to. See `docs/DECISIONS.md`.

| # | Section | Component | Data | Heading |
|---|---|---|---|---|
| 1 | Hero | `Hero` | `site` | `h1` (headline) |
| 2 | Selected work | `FeaturedProjects` | `getFeaturedProjects()` | `h2` "Selected work" |
| 3 | Engineering focus | `EngineeringFocus` | `getFocus()` | `h2` "Engineering focus" |
| 5 | Experience snapshot | `ExperiencePreview` | `getExperience()` filtered to `featured` | `h2` "Experience" |
| 6 | Credentials | `CredentialsPreview` | `getCertifications()` filtered to `featured` | `h2` "Credentials" |
| 7 | Contact callout | `ContactCallout` | `site.contact` | `h2` |

**Hero.** Eyebrow (presentational `<p>`, not a heading), then `h1` headline, supporting
paragraph, primary CTA "Explore selected work" (`/projects/`), secondary CTA "Download
résumé" (only when `site.resume` exists), social links, and an availability badge when
`availability.show` is true. `ProfileVisual` is optional and must carry no information the
text does not already carry; if absent, layout collapses to a single column.

The hero must state role, specialty, and value within roughly five seconds of reading, and
must not contain "passionate," "enthusiast," or "problem solver" without concrete context.

**Selected work.** Heading row carries "View all →" to `/projects/`. One full-width featured
card followed by two half-width cards at `md` and up, stacking below. Each card shows
category, title, one-sentence summary, 3 to 6 technologies, links.

**Engineering focus.** Exactly three pillars from `focus.json`, each a title plus a 2 to 3
line body. No icons that carry meaning, no percentage bars, no skill clouds.

**Featured case study.** *Removed 2026-08-31.* It rendered `caseStudy.challenge`,
`.decision`, `.outcome` under visible sub-labels, then linked to the full project page — a
page which now opens with the same three fields under the same three labels, because
`CaseStudySummary` renders both. The home page was showing a preview of a page one card
above it already linked to, and `site.featuredCaseStudySlug` decided which project got told
twice. `CaseStudySummary` itself stays: §8.3 still uses it.

**Experience snapshot.** Up to three `featured` entries. Heading row links to `/experience/`.

**Credentials.** Up to four featured certifications, linking to `/certifications/`.

**Contact callout.** Headline, one-paragraph body, three channels: email (always a real
`mailto:`), LinkedIn, GitHub. Links to `/contact/`.

### 8.2 Projects index — `/projects/`

```text
h1  Projects
    A selection of AI, full-stack, and systems work.

    [ All (n) ] [ AI/ML (n) ] [ Full-Stack (n) ] [ Systems (n) ]

    [ card ] [ card ]
    [ card ] [ card ]
```

- Filter is a single-select toggle group, each option showing its count. Selection is
  conveyed by text weight, a border change, **and** `aria-pressed`, never colour alone.
- Changing the filter updates an `aria-live="polite"` status line: "Showing 3 of 7 projects."
- No URL search params in v1. Revisit past roughly 12 projects.
- **No section rail** (§7.5). The page is one filterable grid, not a sequence of sections;
  a rail here would either name a single stop or invent divisions the reader cannot see.
  The filter is the navigation this page has.

### 8.3 Project detail — `/projects/[slug]/`

```text
← Back to projects

CATEGORY · YEAR
h1  Project title
    Summary sentence.

[ Live demo ↗ ] [ Source ↗ ]

Project facts:  Role · Timeline · Team · Status · Stack

[ Cover visual ]

h2  Overview
h2  Key features          (h3 per feature)
h2  Lessons learned       (the page's only bulleted list)
h2  Case study            (challenge · decision · outcome)

[ ← Previous project ]  [ Next project → ]
[ Contact CTA ]
```

**Amended 2026-08-30.** Three sections left this page: "What it does" merged into "Key
features", and "Code highlights" and "Screenshots" were removed outright. A project now
carries exactly one image — its cover. See `docs/DECISIONS.md`.

- Sections whose data is empty are not rendered. No empty headings.
- `ProjectFacts` is a description list (`dl`/`dt`/`dd`), not a table.
- **Bullets are reserved for "Lessons learned".** It is the only list on the page whose
  items are peers of one another and carry no internal structure. Everything else that
  was a bullet list is now a titled block, which is what stops the page reading as four
  variations on the same list.
- `CodeHighlight` and `ScreenshotGallery` remain in `components/projects/` and are
  reachable from no page. That is deliberate, not an oversight — see §9.3.
- **No section rail today** (§7.5), and this is the one route where that is an open call
  rather than a decision. The five other content routes got one; this page has four `h2`
  sections plus a facts block, which clears §7.5's minimum comfortably. It was left off
  because the sections here are per-project and conditional — a project with no case study
  renders three stops, one with no features renders fewer — so the stop list has to be
  derived from the data the way `/contact/` derives its form stop, rather than declared as a
  constant. Worth deciding before launch; it is additive either way.

### 8.4 Experience — `/experience/`

Chronological, newest first, an ordered list with a visible vertical rule. Each entry: date
range, role, organization (linked when `organizationUrl` exists), optional location, a
summary paragraph, 1 to 5 achievement bullets, technology tags.

- `end: null` renders "Present."
- Entry `type` is shown as a small labelled badge (Employment, Freelance, Research, and so
  on) so independent work is never dressed up as employment.
- Page ends with a résumé download link when available, plus the contact callout.

### 8.5 About — `/about/`

Prose-width page (720px). **Restructured 2026-08-31** — see `DECISIONS.md`.

```text
    [avatar, 1:1, circle]
h1  Hi, I'm {first name}       (nav label and <title> both stay "About")
    site.bio, first person
    dl: Based in · Languages · Email · (Availability, gated on availability.show)

h2  Education               (content/education/education.json)
h2  How I work
h2  Outside engineering     (optional, one short paragraph)
    Link across to /skills/
    ContactCallout
```

This page is about the person. **"What I am focused on now" and "Tools I use" moved to
§8.6's `/skills/`**, where the pillars explain the tools and the credentials evidence them;
keeping them here left no room for the things a reader comes to an About page for. About
links across rather than repeating the tag lists, so the vocabulary lives in one place.

The register is first person and deliberately warmer than the rest of the site, which is
what `site.bio` exists for — `site.intro` stays the cool positioning paragraph the hero and
the `Person` graph use.

### 8.6 Skills — `/skills/`

**Was `/certifications/` until 2026-08-31**, when it absorbed the two sections §8.5 used to
carry. §7.2 had labelled the route "Skills" since Phase 3 while it rendered credentials
alone; this section is that label made true.

```text
h1  Skills
h2  What I am focused on right now   (focus.json, pillars with their technologies)
h2  Tools I reach for                (skills.json, definition lists, no proficiency scale)
h2  Certifications                   (card grid)
    ContactCallout
```

The order is the argument: a bare tool list is not evidence any of those tools were used
well, the pillars say what the tools are *for*, and the credentials are the only part a
third party vouches for, so they close the page rather than open it.

Certification cards are unchanged: title, issuer (linked when available), issue date, 2 to 4
relevant skills, "Verify credential ↗" link when `credentialUrl` exists. Expired credentials
show an explicit "Expired {date}" badge rather than being silently dropped.

### 8.7 Contact — `/contact/`

```text
h1  Contact
    Tell me a little about the product, role, or technical challenge.

    Name     [__________]
    Email    [__________]
    Message  [__________]
             [ Send message ]

    Or email me directly: {site.email}
    LinkedIn ↗   GitHub ↗
```

- Labels are always visible `<label>` elements. Placeholders are not labels.
- Client-side validation runs on submit and on blur-after-error, never on first keystroke.
- Errors are tied to inputs with `aria-describedby` and `aria-invalid`; the first invalid
  field receives focus on failed submit.
- One `role="status" aria-live="polite"` region announces pending, success, and failure. A
  hard failure also reveals the direct email address in the message itself.
- The honeypot field is a real input, visually hidden with `position:absolute`, `tabindex="-1"`,
  `autocomplete="off"`.
- The form renders only when `site.contact.endpoint` exists. Without it, the page shows the
  direct channels alone.
- The direct `mailto:` link is always present regardless of form state.

**The page ships in Phase 3 on the degraded path; the form arrives in Phase 4.** §18
originally gave the whole route to Phase 4, but §7.1 lists it, Phase 3's exit criterion is
that every route in §7.1 is built, and the header CTA, the footer, and every
`ContactCallout` link to it — so deferring it meant shipping a phase whose most prominent
call to action was a 404. Building it now is not a Phase 4 behaviour built early: the two
clauses above already specify this exact state, and `content/site.json` carries no
`endpoint`. Phase 4 adds `ContactForm` behind the endpoint check and nothing else on the
page moves.

### 8.8 Not found — `/404`

`h1` "Page not found," one line of explanation, three links: home, projects, contact.

---

## 9. Component contracts

Rules that apply to all of them:

1. **Content retrieval never happens inside a visual component.** Pages call
   `lib/content.ts` and pass data down.
2. **Compose rather than parameterise.** If a component needs a boolean that changes its
   structure, it is two components.
3. **Accessible primitive first, visual variant second.**
4. Every component that renders user-facing text accepts that text as a prop or child. No
   hard-coded copy outside `content/`, except structural words like "Overview."

### 9.1 UI primitives — `components/ui/`

```ts
// Button — renders <button> or <a> depending on props; never a div.
type ButtonProps = {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
  href?: string;
  external?: boolean;
  children: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<"button">, "children">;

type TagProps = { children: React.ReactNode; tone?: "neutral" | "accent" };

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  as?: "h2" | "h3";
  action?: { href: string; label: string };
  lead?: string;
};

type ExternalLinkProps = { href: string; children: React.ReactNode; className?: string };

type StatusBadgeProps = { state: "completed" | "in-progress" | "maintained" | "available" | "open" | "unavailable"; label: string };

type ContainerProps = { width?: "content" | "prose"; children: React.ReactNode };

type ProseProps = { children: React.ReactNode };

// Figure — the image primitive, wraps next/image.
type FigureProps = {
  src: string;
  alt: string;
  caption?: string;
  priority?: boolean;
  sizes?: string;
};

// CodeBlock — server component; only the copy button is a client island.
type CodeBlockProps = {
  code: string;
  language: string;
  title: string;
  file?: string;
  note?: string;
};

type VisuallyHiddenProps = { children: React.ReactNode; focusable?: boolean };
```

### 9.2 Layout — `components/layout/`

| Component | Client? | Contract |
|---|---|---|
| `SiteHeader` | no | Takes `nav`, `cta`, `wordmark`. Renders `MobileNavigation` and `ThemeToggle` as islands. |
| `MobileNavigation` | yes | Dialog with focus trap, Escape close, scroll lock, focus restoration. |
| `SiteFooter` | no | Takes `site`. Computes the year. |
| `SkipLink` | no | First focusable element; `href="#main"`. |
| `ThemeToggle` | yes | Cycles system, light, dark. `aria-label` names the next state. |
| `MainNav` | no | The desktop link row. Active route gets `aria-current="page"` and the brand colour (§10.2). |
| `ThemeScript` | no | The inline no-flash script, emitted before paint. |
| `SectionRail` | yes | Takes `sections: {id, label}[]` and an optional `minSections` (default 3); renders nothing below it. One dash per section, `fixed` in the right gutter, `md` and up. Marks position with `aria-current="true"`. See §7.5. |

### 9.3 Domain components

```ts
// HeadingLevel is "h2" | "h3" | "h4". An index route renders its items directly under the
// page h1, so h2 is the correct level there, and §11.1's "heading levels never skip" is
// not satisfiable without it. See docs/DECISIONS.md.
type ProjectCardProps = {
  project: Project;
  variant?: "featured" | "standard";
  headingLevel?: HeadingLevel;
};

type ProjectGridProps = { projects: Project[]; headingLevel?: HeadingLevel };

type ProjectFilterProps = {
  categories: { value: Category | "all"; label: string; count: number }[];
  value: Category | "all";
  onChange: (next: Category | "all") => void;
};

type ProjectFactsProps = { project: Project };

type CaseStudyNavigationProps = { prev?: ProjectRef; next?: ProjectRef };

type ExperienceTimelineProps = {
  entries: ExperienceEntry[];
  compact?: boolean;
  headingLevel?: HeadingLevel;
};

type CertificationCardProps = {
  certification: Certification;
  headingLevel?: HeadingLevel;
};

type ContactFormProps = { endpoint: string; email: string };

// Retained, and reachable from no page as of 2026-08-30. `CodeSnippet` and `Screenshot`
// were `Project` fields; they are now standalone schemas in lib/schemas.ts existing for
// exactly these two components, because a component with no type does not compile.
type CodeHighlightProps = { snippets: CodeSnippet[] };
type ScreenshotGalleryProps = { screenshots: Screenshot[] };
```

**Two components are deliberately unreferenced.** `CodeHighlight` and `ScreenshotGallery`
lost their callers when §8.3 dropped the code and screenshot sections. They were kept on
purpose: the work in them is the accessible `<pre>` scroll region and the mixed-aspect-ratio
column layout, neither of which is quick to rebuild, and both of which are correct. A future
reader finding two components nothing imports should read this line rather than a dead-code
report. Nothing else in the tree is allowed to be in this state.

### 9.4 Motion wrappers — `components/motion/`

Eleven components, and they divide into three groups: the boundary, the entrances, and the
specialists. Everything here is a client component, and everything here takes its children
as a prop — so wrapping server-rendered content in one keeps that content server-rendered.

```ts
// ── The boundary ────────────────────────────────────────────────────────────────
// §10.4's reduced-motion root. `app/layout.tsx` stays a server component, so
// `MotionConfig` lives behind this one-prop pass-through.
type MotionProviderProps = { children: React.ReactNode };

// Keyed on `usePathname`, wrapping `<main>`'s children. Animates the arrival only.
type PageTransitionProps = { children: React.ReactNode };

// ── Entrances ───────────────────────────────────────────────────────────────────
// §10.2's decoupled entrance, on scroll. The workhorse.
type RevealProps = {
  children: React.ReactNode;
  delay?: number;             // seconds; Stagger sets it, callers rarely do
  as?: "div" | "section" | "li";
  distance?: number;          // px; defaults to §10.1's --reveal-distance
  className?: string;         // see the note below on why this is not optional in practice
};

// The same entrance, triggered on mount instead of on scroll. For anything in a load
// sequence, where a viewport trigger would fire everything at once.
type FadeProps = {
  children: React.ReactNode;
  delay?: number;
  distance?: number;
  as?: "div" | "span";
};

// Sequences siblings. `perRow` makes a grid row share a delay, so the sweep runs down the
// grid rather than left-to-right through each row (§10.3).
type StaggerProps = {
  children: React.ReactNode;
  step?: number;              // ms between children; §10.1's --step-item is 70
  as?: "div" | "section" | "li";
  perRow?: number;            // columns above `md`; below it every grid here is 1-up
};

// ── Specialists ─────────────────────────────────────────────────────────────────
// Per-character opacity, no per-character transform. The step compresses to fit long
// strings — see the component.
type SplitTextProps = {
  children: string;           // a string, not JSX: it cannot split through an interpolation
  delay?: number;
  step?: number;
  className?: string;
  as?: "span" | "h1" | "h2" | "p";
};

// Blur-scale, for photographs and renders only — never icons or brand marks.
type ImageRevealProps = {
  children: React.ReactNode;
  delay?: number;
  still?: boolean;            // drop the overscale, for images too small to scale
  onMount?: boolean;          // for images above the fold
  className?: string;
};

// A wave across many small items. Holds the total sweep fixed and divides by the count,
// where `Stagger` caps at six — see the component for why the two differ.
type ChipStaggerProps = { children: React.ReactNode; step?: number };

// Sequences the parts *within* one element, adding no wrapper elements of its own.
type AssembleProps = { children: React.ReactNode; delay?: number; step?: number };

// Mask wipe for the drawn signature. Not a stroke draw — the paths are filled outlines.
type SignatureRevealProps = { children: React.ReactNode; delay?: number };

// Height 0 → auto. The only wrapper here that is about layout rather than entrance.
type CollapseProps = { open: boolean; children: React.ReactNode };
```

**These are the only components that import from `motion/react`**, outside
`components/layout/MobileNavigation.tsx`, which imports `AnimatePresence` directly because
its panel animates on exit. That exception is deliberate and is the only one; anything else
that needs Motion gets a wrapper in this directory first.

**Wrappers insert an element, and that breaks parent layouts.** `Reveal`, `Fade`, and
`ImageReveal` render a `div` that takes the child's place in its parent's flex or grid
flow, so a `gap` that used to apply between two children now applies to one wrapper, and
classes the child relied on from its parent (`shrink-0`, a column span) stop reaching it.
This is invisible in a diff and has caused the bug twice. Each of those three takes a
`className` for exactly this reason: wrapping `<section className="flex flex-col gap-6">`
means moving those classes onto the wrapper. `Assemble` exists because there is one place
— inside a card — where no wrapper is acceptable at all.

Motion's numbers are §10.1's tokens transcribed into Motion's units — seconds, and easings
as their four control points — because Motion cannot read a CSS custom property for a
transition. When a token changes in `globals.css`, these files change with it. That
duplication is the price of having both a CSS and a JS animation path, and it is small
enough to pay by hand. It is also why retiring `--ease-standard` had to touch two files by
hand: both carried the curve as a literal, which no find-and-replace over the token name
would have caught.

**Two wrappers were deleted on 2026-09-02.** `LayoutItem` and `Presence` existed for the
project filter's reposition-and-fade. Keying the grid on the filter value replaced that
animation with an ordinary remount, and nothing else used either component. The entries
describing them in `DECISIONS.md` are history, not current contracts.

## 10. Motion system

**Rewritten 2026-09-01 (v3).** The previous version was a document about restraint. It
produced a site that was correct and lifeless — every transition 120ms, forty-one of
forty-two hover states changing only colour, nothing on the page with any weight to it. The
owner's verdict was "you'd feel like you are reading a magazine," and the diagnosis was
that the spec, not the implementation, was the limit.

So the test changed. The old one was:

> remove it and ask whether the interface got harder to understand

That is a comprehension test, and it rejects everything that makes an interface feel
crafted, because craft is not comprehension. **The test is now:**

> Does this make the page feel more considered to the person using it, without ever
> getting in their way or making them wait?

Two clauses, both binding. The first admits delight, texture, and personality as
sufficient reasons on their own. The second is what keeps this from becoming the
over-animated site the old rules were written in fear of: motion that blocks reading,
delays interaction, or repeats until it is noticed still does not ship.

### 10.1 Tokens

```css
/* Durations. `base` and `slow` were defined and unused under v2; the new system leans on
   the long end, because the long end is where "expensive" lives. */
--duration-fast: 120ms;      /* colour, small state changes */
--duration-base: 200ms;      /* hovers with movement */
--duration-slow: 320ms;      /* deliberate UI transitions */
--duration-reveal: 800ms;    /* opacity half of an entrance */
--duration-drift: 1800ms;    /* transform half of an entrance */

/* Easings. `--ease-out` stays the workhorse. `--ease-drift` is the new one and it is the
   single most important value in this section — see §10.2. */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-drift: cubic-bezier(0.2, 0.7, 0.2, 1);

/* Stagger steps. */
--step-char: 26ms;    /* per character in a split heading */
--step-item: 70ms;    /* per card, row, or list item */
```

### 10.2 The decoupled entrance

**This is the technique the rest of the section is built on, and it is not obvious.**

An entrance animates opacity and transform on the same element at *different durations*:

```css
transition-property: opacity, transform;
transition-duration: var(--duration-reveal), var(--duration-drift);
transition-timing-function: var(--ease-drift);
```

Opacity resolves in 800ms — the content is readable quickly, which is what stops this
from being a site that makes people wait. The transform keeps resolving for 1800ms, so the
element is still settling into place long after it became legible. That gap between "I can
read this" and "this has finished arriving" is the entire difference between motion that
feels cheap and motion that feels considered.

Travel distance is **32px**, not the 12px v2 used. Twelve pixels over 200ms is a twitch;
32px over 1800ms is a drift. The old value was small because the old duration was short,
and both were wrong together.

### 10.3 Inventory

| Where | Technique | Spec |
|---|---|---|
| Page load | orchestrated | `body` gets `is-loading` → `is-animating` → `is-loaded`; stages fire off `data-stage` in ms |
| Hero heading | char split | per-character opacity, `--step-char` apart, no per-char transform |
| Hero accent word | blur-slide | `translateX(-20px)` + `blur(10px)` → settled, on one word only |
| Section entrance | decoupled reveal | §10.2, `once: true` |
| Card grids | staggered reveal | `--step-item` between children, capped at 6; multi-column grids pass `perRow` so a **row** shares a delay and the sweep runs down the grid rather than through it |
| Images | blur-scale | `scale(1.04)` + `blur(12px)` → settled over `--duration-drift` |
| Route change | page transition | outgoing fades and lifts, incoming reveals; never blocks the click |
| Card hover | lift + border | `translateY(-4px)` over `base` |
| Link hover | underline wipe | `scaleX(0)` → `1` from the left, over `base` |
| Button press | scale | `0.98`, `fast` |
| Project filter | remount | the grid is keyed on the filter value, so a change mounts a new list and it staggers in exactly as a first load does — no bespoke filter animation |
| Field errors | collapse | height 0 → auto with opacity, `fast`; an error pushes the fields below it rather than shoving them |
| Dialog backdrop | CSS | scrim fades over `slow`, matching the panel it dims |
| Cursor | desktop only | follows the pointer, grows over interactive targets, `pointer: fine` only |
| Rail | colour only | the dash never moves or resizes; it is a position readout, not an animation |

**Still excluded, and these are real exclusions rather than habit:**

- Anything that loops while someone is reading. okc.media runs an 8.8s infinite loop on its
  hero; that is the one thing from the reference this site deliberately does not take.
- Scroll-jacking, or any scroll-linked transform that fights the scroll position.
- Ticking counters and typewriter effects — they animate *data*, which makes the data
  harder to read, and they are unfalsifiable filler besides.
- Content that re-animates when scrolled back to. Every entrance is `once: true`.
- Motion on the section rail's dash. It reports where the reader is; a readout that
  animates is a readout that lies for the duration of the animation.

### 10.4 Reduced motion

`prefers-reduced-motion: reduce` is honoured and is *not* the same as "no motion". Under
it: every transform is dropped, opacity fades are kept, images appear with no blur and no
scale, the signature is simply drawn rather than wiped, and the page transition becomes an
instant swap. Content still arrives — it does not travel.

Three mechanisms, and the split between them is the part worth knowing:

1. **`MotionConfig reducedMotion="user"`** wraps the Motion tree and strips *transform*
   animations — `x`, `y`, `scale`, `rotate`. This covers most of `components/motion/`.
2. **The global CSS block** collapses `transition-duration` and `animation-duration`, and
   sets `scroll-behavior: auto !important`. This covers everything animated in CSS.
3. **`usePrefersReducedMotion`**, read by hand where a component animates something
   neither of the above touches. `MotionConfig` does not strip `filter` or `mask-position`,
   so without this `ImageReveal`'s 12px blur and `SignatureReveal`'s 2.2-second wipe both
   ran at full length for someone who had asked for less motion. Any future wrapper that
   animates a non-transform property has to opt into this the same way.

**Two things are deliberately kept under reduced motion**, because dropping them would
make the interface worse rather than calmer:

- **`SplitText`'s per-character fade**, which is pure opacity. The preference asks for less
  *movement*; a sequenced fade has none.
- **`Collapse`'s height animation**, because it exists to stop a field error from shoving
  the form. Removing it restores the jump it was built to prevent, which is the opposite of
  what someone sensitive to motion is asking for.

### 10.5 Performance rules

Motion this ambitious is only acceptable if it costs nothing to scroll past:

- **Animate `opacity`, `transform`, and `filter` only.** Never width, height, top, left, or
  anything that triggers layout.
- **`will-change` is set while an element is animating and removed after.** Left on
  permanently it is a memory leak with good intentions.
- **Every entrance is `once: true`** and its observer is disconnected after firing.
- **The character split runs once, at mount**, and produces static spans. Nothing re-splits
  on resize.
- **The custom cursor is `pointer: fine` only** and never renders on touch.

---

## 11. Accessibility

**Target: WCAG 2.2 Level AA, with AAA text contrast wherever the palette already achieves
it.** This stays a real design constraint (good accessibility is good product quality, not a
performance trade-off) but it is a **target to verify against**, not an automated gate that
blocks a merge. See §15.

### 11.1 Structure

- One `<main id="main" tabindex="-1">` per page, preceded by `<header>`, followed by
  `<footer>`. `<nav aria-label="Main">`; footer nav is `<nav aria-label="Footer">`.
- Heading levels never skip. Each page has exactly one `h1`. The eyebrow is a `<p>`, never
  `h*`.
- Lists are lists: project grids, achievement bullets, skill groups, the timeline all use
  real `ul`/`ol`/`dl` markup.
- Decorative rules, gradients, timeline spines are `aria-hidden="true"` or pure CSS.

### 11.2 Keyboard

| Interaction | Requirement |
|---|---|
| Skip link | First focusable element; moves focus to `#main` |
| Tab order | Follows visual order at every breakpoint; no positive `tabindex` |
| Mobile nav | Opens on Enter/Space, traps focus, closes on Escape, returns focus to trigger |
| Filter group | Arrow keys move between options, Enter/Space selects |
| Code blocks | Focusable and arrow-scrollable when they overflow |
| Copy button | Reachable, announces the result through the live region |
| Form | Fully operable; first invalid field receives focus on failure |
| Focus visibility | `:focus-visible` outline never suppressed, 3:1 contrast against adjacent surfaces |

### 11.3 Forms

- Every control has a visible, persistent `<label>` bound by `for`/`id`.
- Errors: `aria-invalid="true"`, message linked via `aria-describedby`, text that says how to
  fix it, `danger` colour paired with an icon and text.
- Status region: `role="status" aria-live="polite"` for pending and success; `role="alert"`
  for failure.
- `autocomplete` attributes on name and email.

### 11.4 Media and colour

- Every image has meaningful alt text (schema enforces a minimum length). Purely decorative
  visuals use `alt=""`.
- No information conveyed by colour alone: statuses, filter selection, form errors, active
  navigation each carry a text or shape cue.
- All text meets 4.5:1; large display text and UI boundaries meet 3:1.

### 11.5 Zoom, reflow, and target size

- No horizontal scrolling at 320px width, or at 400% zoom on a 1280px viewport. The only
  permitted horizontal scroll is inside a code block, and it is keyboard-scrollable.
- Text remains legible with `text-spacing` overrides applied. No fixed heights on text
  containers.
- Interactive targets are at least 24×24 CSS px; real buttons and nav links are 44×44.

### 11.6 How this gets checked

| Layer | Tool | When |
|---|---|---|
| Automated rules | `@axe-core/playwright`, run when convenient | Periodically, not every commit |
| Keyboard traversal | A manual pass, occasionally a Playwright tab-walk | Before each release |
| Screen reader | Manual pass: NVDA or VoiceOver on home, one project page, the form | Before launch |

Automated tools catch roughly a third of real issues. The manual passes matter more than the
tooling, and neither blocks day-to-day work. See §15.

---

## 12. Performance & media — guidance, not gates

This section replaces v1.0's performance-budget machinery entirely. **No LCP/CLS/TBT
targets, no first-load-JS ceiling, no Lighthouse CI gate, no per-image size cap.** Build the
product; measure it once it is real; optimize what the measurement says needs it.

### 12.1 What still matters, informally

A few habits are good product practice independent of any budget and cost nothing to keep:

- Give images intrinsic `width`/`height` (or use `next/image`, which does this for you) so
  layout does not jump around as things load. This is about not looking broken, not about a
  CLS score.
- Lazy-load anything below the fold; it is a one-line prop and there is no reason not to.
- Do not fetch data client-side for content that is already known at build or request time.

None of these are enforced. They are just free.

### 12.2 Images — no `sharp`, no custom build pipeline

Use `next/image` for layout stability and the `<Figure>` wrapper, but set
`images: { unoptimized: true }` in `next.config.ts`. That means:

- No build-time image-processing step, and nothing in this repo imports `sharp`. Note that
  `sharp` still lands in `node_modules`: it is an `optionalDependency` of `next` itself, so
  "no `sharp`" means we never add it or write a pipeline against it, not that it is absent.
- Images render as-is (whatever format and size the asset is) rather than being converted to
  AVIF/WebP or resized into a responsive `srcset`.
- This is a deliberate placeholder decision, not a permanent one. Real optimization
  (responsive sources, modern formats, a CDN) is a good candidate for the eventual
  performance pass once real assets exist. Vercel's image optimizer is a platform feature
  that needs nothing in the project, which weakens the original reason for disabling it, so
  Phase 6 should make this a deliberate call. Revisiting it later costs nothing structurally
  since components already go through `<Figure>`.
- Placeholder images live under `public/placeholders/` during early phases (§5.6); real
  assets replace them in `public/images/` in Phase 5.

### 12.3 Fonts

- Loaded through `next/font`, self-hosted at build, `display: swap`.
- Three families now (§6.6) instead of two. Load only the weights actually used in the type
  scale.
- No file-count or KB budget enforced.

### 12.4 Code highlighting — deferred

There is no syntax highlighter. `shiki` was excluded per the owner's package list, and
`prism-react-renderer`, which replaced it in v2.0, was dropped before it was ever installed.
Code renders natively:

```html
<pre><code class="language-{lang}">…raw source as text…</code></pre>
```

- IBM Plex Mono on the `code-bg` token (§6.2, §6.3), `overflow-x: auto`, no colouring.
- `language` is a plain label. It feeds the `class="language-*"` hook and the filename chip;
  nothing validates it against a highlighter's language list.
- Every accessibility affordance in §8.3 still applies: `tabindex="0"` and `role="region"`
  with an `aria-label` on blocks that scroll, plus the copy button.
- `CodeBlock` can be a server component. Only the copy button needs a client island.
- Snippets here are short and captioned, so colour is decoration rather than comprehension.
  If that stops being true, adding a highlighter (`shiki`, `starry-night`,
  `react-syntax-highlighter`) is contained entirely to `CodeBlock`; the `class="language-*"`
  hook is already the seam.

### 12.5 When to actually revisit performance

Treat it as its own phase, after the real content is in (see Phase 6, §18): profile the real
built site, decide what is actually slow, and fix that, informed by data instead of a budget
written before the product existed.

---

## 13. SEO, metadata & structured data

The canonical origin is `https://mukeremshifa.com`. It is set once as
`NEXT_PUBLIC_SITE_URL` and consumed by `metadataBase`, `buildMetadata`, the sitemap,
structured data, and the contact endpoint's CORS allowlist. Nothing else hard-codes it.

### 13.1 Metadata builder

```ts
export function buildMetadata(input: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
}): Metadata;
```

Produces `title` (`"{title} — Mukerem Shifa"`, bare site title on `/`), `description`,
`alternates.canonical`, OpenGraph, and Twitter (`summary_large_image`).

`app/layout.tsx` sets `metadataBase` to the canonical origin, the title template, and the
default OG image.

### 13.2 Structured data

JSON-LD via a `<script type="application/ld+json">` tag built in `lib/structured-data.ts`.
All values come from `content/`.

| Route | Type | Notes |
|---|---|---|
| `/` | `Person` | name, jobTitle, url, sameAs, knowsAbout, address only if `location` is set |
| `/` | `WebSite` | name, url |
| `/projects/` | `ItemList` | ordered list of project URLs |
| `/projects/<slug>/` | `SoftwareSourceCode` / `CreativeWork` | name, description, author, programmingLanguage, codeRepository when available |
| `/about/` | `ProfilePage` | mainEntity references the Person |
| `/certifications/` | `ItemList` of `EducationalOccupationalCredential` | only credentials with a verifiable URL |

### 13.3 Sitemap, robots, canonical

- `app/sitemap.ts` enumerates all static routes plus every project slug.
- `app/robots.ts` points at the sitemap. It allows everything **only when the site is
  finished**: until then it disallows all crawling behind an environment flag, so `dev`
  can be promoted to production at every phase boundary (§16.1) without an unfinished
  portfolio full of placeholder copy being indexed. Phase 6 flips the flag.
- Canonical URLs are absolute on every page, built from `https://mukeremshifa.com`.
- The apex is canonical (resolved 2026-08-15). `www.mukeremshifa.com` redirects to it, and
  `NEXT_PUBLIC_SITE_URL` is `https://mukeremshifa.com` exactly — no `www`, no trailing slash.

### 13.4 Open Graph images

Target 1200×630 per route, plus one per project. `opengraph-image.tsx` with `ImageResponse`
is the simplest option under a normal (non-static-export) Next.js deployment; use it. Each OG
card is generated from content, not hand-designed per project: project title, category, and
year on the brand palette, signed with the monogram (§13.5).

### 13.5 Brand marks and icons

One identity, drawn rather than typeset, and reduced by size:

| Mark | Where |
|---|---|
| `Mukerem.` lockup | header home link, and nowhere else |
| Signature wordmark | the home hero's `display-1` slot |
| `MS` monogram | footer sign-off, OG cards, `apple-icon.png`, manifest 192/512, social avatar |
| `M` alone | `favicon.ico` (16/32/48), `app/icon.svg`, maskable icon |

Each mark has one job on a page, so no page shows the same artwork twice. Two of the
splits are forced rather than chosen:

- **Below ~48px the monogram's `S` disappears into the `M`.** The face is a hairline
  monoline; the single letter holds down to 16px where two do not. Rasters at or below
  64px are dilated to survive the pixel grid.
- **Tracking does not scale with type size.** The signature's -70 is a display value; at
  the ~26px cap a header allows, it welds "m Shifa" into one shape. The header lockup is
  therefore generated separately at -20, not cropped from the signature.

The period in `Mukerem.` is **drawn, not set** — the face has no punctuation of any kind.
It is the one letterform in the system that is not the designer's.

The hero signature has its own gradient stops (`--signature-from` / `--signature-to`),
separate from B5's `--hero-*`, because the fade has to be matched by eye per theme and the
contrast measurements point the wrong way; `docs/DECISIONS.md` has the numbers.

Everything is generated by `scripts/build_brand.py` and committed as outlines — SVG paths,
`lib/brand-marks.ts`, and PNG/ICO rasters. **The source face is not a dependency of this
repo and must not become one**, for weight and for licence; the licence is an open
obligation before launch and is recorded in `docs/DECISIONS.md` (2026-08-30). Icon tiles
are square, per §6.7's zero-radius rule.

---

## 14. Contact backend

**Amended 2026-09-01: this is a Next route handler, not a Cloudflare Worker.** It ships as
`app/api/contact/route.ts`, same origin as the app, built in Phase 4. The original design
put it on a Worker at `api.mukeremshifa.com`, which made every submission cross-origin and
made the CORS allowlist below load-bearing. Same-origin, **CORS stops applying at all** —
there is no preflight, no allowlist to keep in sync with the deploy URL, and no second thing
to deploy. Read the CORS material below as the record of a design that was not taken.
Rationale in `DECISIONS.md`, 2026-09-01.

What the move does not change: §14.1's contract, §14.2's server-side checks, and the
`sendEmail()` seam are all identical either way. Rate limiting is Upstash over HTTP
(`lib/rate-limit.ts`), which works the same from either runtime and **fails open** —
a limiter outage must not take the contact form down with it.

### 14.1 Contract

```http
POST /api/contact  (or equivalent, depending on host)
Content-Type: application/json

{ "name": string, "email": string, "message": string,
  "company": string,        // honeypot, must be empty
  "renderedAt": number }    // epoch ms, set when the form mounted
```

| Status | Body | Client behaviour |
|---|---|---|
| 200 | `{ "ok": true }` | Success message in the live region; form resets |
| 400 | `{ "ok": false, "error": "validation", "fields": {...} }` | Field errors rendered inline; focus moves to the first one |
| 429 | `{ "ok": false, "error": "rate_limit", "retryAfter": number }` | Explain the limit, show the direct email address |
| 5xx / network | — | Generic failure plus the direct email address, in a `role="alert"` |

CORS: an explicit origin allowlist. Production is `https://mukeremshifa.com`. Previews need
Vercel's `*.vercel.app` deployment origins, matched by pattern rather than wildcarded. No
bare `*`.

### 14.2 Server-side checks

1. Method is POST, `Content-Type` is JSON, body under a reasonable size.
2. Origin is on the allowlist.
3. Zod parse: `name` 2 to 100, `email` valid, `message` 20 to 5000, `company` empty.
4. Time trap: `now - renderedAt` between 3 seconds and 30 minutes.
5. Basic rate limiting per IP.
6. Send the email; on provider failure, return 502 and log without the message body.

### 14.3 Operational rules

- Never log message contents or email addresses. Timestamp, outcome code, hashed IP only.
- Secrets live in the hosting platform's secret store, never in the repo.
- Email delivery provider is an open decision (§19, question 3) behind a single `sendEmail()`
  function so it is a one-file swap.
---

## 15. Testing — lightweight and non-blocking

Testing exists to catch real regressions, not to gate every commit behind a full suite. Set
this up incrementally, and treat all of it as advisory during early development. Nothing
here should block a push or a merge unless the owner later decides otherwise.

### 15.1 What is worth having, roughly in order of value for the effort

| Layer | Tool | Why it is worth it |
|---|---|---|
| Types | `tsc --noEmit` | Catches real bugs for near-zero cost; keep this one strict |
| Build | `next build` | If it does not build, nothing else matters |
| Lint | ESLint | Catches obvious mistakes; do not fight it over style |
| Unit | Vitest | Content-schema invariants (§5.5) are the highest-value tests here |
| E2E | Playwright, a handful of flows | Nice to have once the UI has stabilized; not worth writing against a UI that is still changing shape |
| Accessibility | `@axe-core/playwright` | Run occasionally, treat findings as a to-do list, not a blocker |
| Links | any link checker | Run before a release, not on every PR |

### 15.2 What to skip for now

Visual regression snapshots, component tests for presentational markup, Lighthouse CI,
bundle-size assertions, a dedicated no-JS test project. All of this was in service of the
constraints removed in §2.1. Add any of it back later if there is an actual reason to.

### 15.3 What actually exists, 2026-09-01

| Layer | Status |
|---|---|
| Types | **Yes.** `pnpm typecheck` is `tsc --noEmit` and is clean |
| Lint | **Config only.** `eslint.config.mjs` is written; there is no `lint` script in `package.json` |
| Format | **Config only.** Prettier and `.prettierignore` are set up; there is no `format:check` script, though AGENTS.md refers to one |
| Build | Available as `next build`, but not run during the active dev gate (see AGENTS.md) |
| Unit | **No.** Vitest is not installed and `tests/` does not exist |
| E2E, a11y, links | **No.** As §15.1 intended for this stage |

`package.json` currently defines exactly two scripts: `dev` and `typecheck`. That is a
deliberate consequence of AGENTS.md's active development gate, which asks for the minimum
needed to validate a change and defers full validation to a deployment checkpoint.

**The gap that matters is the unit row.** Phase 2's exit criterion named the §5.5
cross-file invariant tests, and they were never written — every invariant in §5.5 is
currently enforced by reading, and the `links.*` row in `STUB-INVENTORY.md` names a
`tests/unit/links.test.ts` that does not exist. §5.5's invariants are the highest-value
tests in §15.1's table precisely because content changes are the thing this project does
most, and they are the class of change a type checker cannot see.

---

## 16. CI/CD & deployment

### 16.1 Branching

- `main` for production.
- `dev` for integration, deploys to a preview on push.
- `feat/*`, `fix/*`, `content/*` are short-lived, branched from `dev`.

**Merge strategy, and why it is not a matter of taste.** A squash merge replaces a
branch's commits with a new one that has no ancestral link to them. That is exactly what
you want for a short-lived branch you are about to delete, and exactly what you must not
do to a branch that keeps existing — git will treat the two as permanently diverged, and
every later merge re-derives from their last true common ancestor.

| Merge | Strategy | Why |
|---|---|---|
| `feat/*` → `dev` | **Rebase** | Keeps each commit and its message on `dev`, linear, no merge bubble. The branch is deleted afterwards, so nothing is left to diverge |
| `dev` → `main` | **Fast-forward only** | `main` is a moving pointer at a known-good point on `dev`'s history, not a separate line of development |
| Anything → `dev` or `main` | **Never squash** | Both branches outlive every merge into them |

If `dev` → `main` ever refuses to fast-forward, that is a signal that something diverged.
Stop and find out what. Do not reach for `--force` or a merge commit to make the symptom
go away.

**Rewriting.** History rewriting is confined to `feat/*` branches before they merge.
`dev` and `main` are never force-pushed.

**Tags.** Each phase's completion is tagged on `dev` (`phase-0`, `phase-1`, …). Tags are
the rollback and diff landmarks, which is the job branches were doing badly.

**Promotion cadence.** `dev` → `main` at phase boundaries, not once at the end. §16.4
leaves `NEXT_PUBLIC_SITE_URL` unset on previews on purpose, so canonical URLs, the
sitemap, JSON-LD, and OG image URLs all resolve differently in production than in any
preview — promoting once at the end would mean that entire surface is first exercised for
real on launch day, with every other change landing at the same time. To keep an
unfinished site out of the index while still promoting, `robots.ts` disallows everything
behind an environment flag until the Phase 6 hardening pass flips it (§13.3).

### 16.2 `ci.yml` — informational, not a gate

**Not built as of 2026-09-01.** `.github/workflows/` is empty; Phase 0 called for a stub and
none was committed. Nothing has depended on it, because none of it was ever a gate and
Vercel builds every push regardless (§16.3). It is listed as outstanding in §18 rather than
quietly dropped — the `unit` step below cannot be written before §15.3's tests exist, and
the rest is worth having the day someone else touches this repo.

```text
setup      → pnpm install, Node LTS, pnpm cache
quality    → prettier --check, eslint, tsc --noEmit   (parallel; failures are visible, not blocking)
unit       → vitest run
build      → next build
```

Nothing here is required to pass before merge unless the owner decides to tighten it later.
The point of running it at all is visibility, not gatekeeping.

### 16.3 Deployment — Vercel Git integration, no `deploy.yml`

There is no deploy workflow in this repo. Vercel's GitHub integration builds every push:
`main` goes to production, `dev` and pull requests get preview URLs. A `deploy.yml` would
only be a second way to do the same thing, with a token to rotate.

### 16.4 Hosting configuration

Resolved 2026-08-15. The app runs on **Vercel**; the backend and object storage are
**Cloudflare** (Workers, R2). DNS stays in Cloudflare, which is what makes
`api.mukeremshifa.com` available to a Worker in Phase 4.

- Production domain `mukeremshifa.com` (apex, canonical); `www.mukeremshifa.com` redirects
  to it. Both are configured in Vercel, not in a Cloudflare page rule.
- The DNS records Vercel asks for **must be DNS-only (grey cloud)**. Proxying Cloudflare in
  front of Vercel breaks certificate issuance and can produce redirect loops.
- `NEXT_PUBLIC_SITE_URL` is set to `https://mukeremshifa.com` in the Production environment
  only. Preview deployments deliberately leave it unset so `metadataBase` falls back to
  `VERCEL_URL` and previews never emit production canonicals.
- `api.mukeremshifa.com` is left unclaimed until Phase 4.

---

## 17. Definition of done

Softer than v1.0's "quality gates". These are things to check before calling a page or a
release finished, not conditions a PR is blocked on.

### 17.1 Per page, before it is called finished

- [ ] Correct heading outline, one `h1`, no skipped levels.
- [ ] Reasonably clean in an axe pass, both themes (does not need to be zero-violation to
      ship, use judgment).
- [ ] Keyboard-traversable with visible focus throughout.
- [ ] Legible at 320px and at 400% zoom, no horizontal scroll (outside code blocks).
- [ ] Metadata, canonical URL, and OG image present.
- [ ] Every image has real alt text.
- [ ] Copy passes §1.5: first person where it matters, no invented metrics, rare em dashes.

### 17.2 Release

- [ ] Every external link resolves.
- [ ] Manual accessibility pass on home, one project page, and the contact form.
- [ ] Contact form delivers a real message end to end; the failure path shows the direct
      email address.
- [ ] 404 works for an unknown deep path.
- [ ] Résumé link downloads the current file (once one exists).
- [ ] No placeholder assets or stub copy remain (§5.6 sweep).
- [ ] `mukeremshifa.com` resolves over HTTPS, and the non-canonical host form redirects to
      the canonical one.
- [ ] `docs/DECISIONS.md` is current.

---

## 18. Delivery plan

Same seven-phase shape as v1.0, minus the phases (and spikes) that only existed to de-risk
static export.

**Where this stands, 2026-09-01.** Phases 0 through 4 are done and tagged `phase-0` through
`phase-3` on `dev` (Phase 4 is complete but not yet tagged). Next is **Phase 5, the content
sweep**. Three items were carried past their phase rather than completed in it, and none of
them blocks Phase 5:

| Carried | From | Where it is tracked |
|---|---|---|
| §5.5 invariant tests (Vitest) | Phase 2 | §15.3 |
| `ci.yml` | Phase 0 | §16.2 |
| §10.2's `Reveal` / `Stagger` application | Phase 1 built the wrappers; applying them was never scheduled | §10.4 |

The third is the only one that is a *product* gap rather than a tooling gap, and it is the
motion work described in §10.4.

### Phase 0 — Foundations ✅

- Scaffold Next.js + TypeScript + Tailwind v4 with pnpm; commit the lockfile.
- Set up `next.config.ts` (no `output: "export"`; `images.unoptimized: true` per §12.2),
  strict `tsconfig`, ESLint flat config, Prettier, the `@/*` alias.
- Stub `ci.yml` only (§16.3: there is no `deploy.yml`).
- Create the Vercel project, point Cloudflare DNS at it, and add both domain forms (§16.4).
- Set `NEXT_PUBLIC_SITE_URL=https://mukeremshifa.com` in Production; leave it unset in
  Preview so the `VERCEL_URL` fallback applies.
- Confirm the Tailwind v4 class-based dark strategy (`@custom-variant`, §6.4) compiles, since
  every token in Phase 1 depends on it.

**Exit:** an empty site is live on `mukeremshifa.com` over HTTPS with `www` redirecting to
it, pushes to `dev` produce previews, and `pnpm check` is clean.

*Left behind:* `ci.yml` was never committed (§16.2), and `pnpm check` does not exist as a
script (§15.3). Neither was load-bearing — Vercel builds every push, and nothing here was
ever a gate.

### Phase 1 — Design system and application shell ✅

- `globals.css` with the full token set (§6.4) and the three-family type scale (§6.6).
- Theme mechanics: inline no-flash script, `ThemeToggle`.
- `ui/` primitives, `layout/` shell, `motion/` wrappers.
- `app/not-found.tsx`.

**Exit:** a demo route renders every primitive in both themes; header, footer, and mobile
navigation are keyboard-operable.

*Met, at `app/dev/primitives/`.* Note what "the `motion/` wrappers" meant here: building
them, not applying them. The demo route is still the only consumer of `Reveal` and
`Stagger`, which is why §10.4 exists.

### Phase 2 — Golden sample ✅

- `lib/schemas.ts`, `lib/content.ts` with the validation gate.
- `ui/Figure` (using `next/image`, `unoptimized: true`).
- `CodeBlock` on native `<pre><code>` (§12.4), including the copy-button client island.
- One complete project JSON, the **hardest** one: long title, max-length summary, 12
  technologies, 4 code snippets, 6 screenshots, 5 lessons, a full `caseStudy` block, using
  placeholder assets per §5.6.
- One certification, one experience entry, all skill groups, all three focus pillars,
  complete `site.json` (placeholder values fine where real data is not ready).
- Build `/projects/[slug]/` fully against this sample.
- `lib/metadata.ts`, `lib/structured-data.ts`, `sitemap.ts`, `robots.ts`.
- OG image generation (§13.4): a root default plus one per project slug. Moved here from
  Phase 3 — §17.1 makes an OG image part of a page being finished, and if generation
  landed later then adding project #2 would mean adding an asset, which makes this
  phase's exit criterion false the day it is written.
- Vitest, the §5.5 invariant tests, and `test:unit` folded into `pnpm check` and `ci.yml`.

**Exit:** the golden project page is complete and adding a second project requires zero
component changes.

*Met on the page; the Vitest line was not done* (§15.3). The exit criterion itself was
proved the hard way in Phase 5's run-up, when six synthetic projects were deleted and four
real ones added with no component changes.

### Phase 3 — Remaining pages ✅

- Home: all seven sections in order (§8.1).
- `/projects/` with the filter and its live region.
- `/experience/`, `/about/`, `/certifications/`.
- `/contact/` on §8.7's degraded path: the direct channels, no form (moved from Phase 4).
- `CaseStudyNavigation` and the contact callout on project pages (§8.3's last two rows;
  held back from Phase 2 because with one project prev/next renders two dead ends).
- An expanded stub content set, so every layout is exercised at the lengths and in the
  combinations real content will have, plus `docs/STUB-INVENTORY.md` to bound Phase 5's
  sweep of it.

**Exit:** every route in §7.1 is built and reads as finished (with placeholder content),
and every resource the owner supplies is swappable by editing `content/` or dropping a file
into `public/` — verified by performing each row of the swap matrix rather than asserting
it.

### Phase 4 — Contact path ✅

- Contact endpoint implementing §14, on whatever host was chosen.
- `ContactForm` with validation, error wiring, live regions, honeypot.
- `ContactForm` slotted into the `/contact/` page behind `site.contact.endpoint`. The page
  itself was built in Phase 3; nothing else on it moves.

**Exit:** a real message arrives; disabling the endpoint degrades to the email-only path.

*Met, with one design change:* the endpoint is `app/api/contact/route.ts`, not a Cloudflare
Worker (§14). Rate limiting (two windows, Upstash, fails open) and a provider timeout were
added beyond what §14.2 specified; both are logged in `DECISIONS.md`, 2026-09-01. The
`site.contact.endpoint` switch is the single control for the degraded path.

### Phase 5 — Content sprint ← next

- Replace all placeholder assets and stub copy with the real thing (§5.6 sweep, §20
  checklist).
- Full experience timeline and all certifications.
- Capture and add real screenshots and cover images.
- Final hero, about, and contact copy against §1.5 (including the em-dash rule).
- Add the résumé PDF.
- Verify every external URL by hand.

**Exit:** zero placeholder content anywhere, all links resolve, every page reads as finished
prose.

### Phase 6 — Performance & hardening (moved to last, on purpose)

**Goal:** now that the product is real, make it fast and buttoned-up.

- Profile the real built site (Lighthouse, WebPageTest, whatever is convenient) and see what
  is actually slow. Do not assume.
- Decide, with real data, whether the `unoptimized: true` image approach needs replacing with
  real optimization (responsive sources, modern formats).
- Full responsive review at 320 / 768 / 1280, plus 400% zoom.
- Manual keyboard pass and a screen-reader pass.
- Security headers, HTTPS, DNS, canonical host, analytics. Final domain and hosting
  configuration finalized here if it was not earlier.
- Tag `v1.0.0`.

---

## 19. Open questions for the owner

Most of the old v1.0 decision table is resolved by this rewrite (typography, package choices,
rendering approach) or by the owner directly.

**Resolved so far:** domain is `mukeremshifa.com` with the apex canonical; hosting is Vercel,
with Cloudflare for the backend, storage, and DNS; syntax highlighting is deferred to native
`<pre><code>`. All 2026-08-15, applied in §2, §12.4, §13, §14, §16.3, §16.4, §17.2, and
Phase 0. **Typography roles** confirmed by the owner as specified — Source Serif 4 for
display, Instrument Sans for body and UI, IBM Plex Mono for code, tags, and eyebrows —
and built in Phase 1 (§6.6).

**None of the four below blocks anything as of 2026-08-18.** Phase 3 made each of them a
value rather than a decision: the mailbox, the handles, the résumé, the hero visual, and
the project set are all rows of the swap matrix in `docs/STUB-INVENTORY.md`, each swapped
by editing `content/` or dropping a file into `public/`. Q2 stays a one-file seam behind
`sendEmail()`. Raise one of these again only if something makes it structural rather than
a value.

**Updated 2026-09-01.** Q1 and Q2 are now closed: the mailbox is `hello@mukeremshifa.com`,
forwarded to the owner's real inbox by Cloudflare Email Routing, and outbound delivery from
the contact endpoint is Resend behind `sendEmail()`. Q4's résumé sub-question closed too —
`public/`, not R2, at `/Mukerem-Shifa-Resume.pdf`, with a deliberately undated filename. See
`STUB-INVENTORY.md`. The table below is left intact as the record; the two live rows are Q3
and what remains of Q4.

What is left genuinely needs your input, eventually:

| # | Question | Why it matters | Needed by |
|---|---|---|---|
| 1 | **Contact mailbox.** The domain is settled, but which address should the site show and the form deliver to? A domain mailbox (`hello@mukeremshifa.com`, `mukerem@mukeremshifa.com`) reads more professional than a Gmail address and is free to set up once DNS exists. If you would rather keep Gmail, confirm the exact address so `site.email` is right. | It is printed on the contact page, the footer, the hero social links, and structured data | Phase 5 |
| 2 | **Email delivery for the contact endpoint.** Whichever provider you already have an account for; it is a one-file swap behind `sendEmail()` regardless. | Determines Phase 4 secrets and setup | Phase 4 |
| 3 | **The three v1 projects.** Carried over from v1.0, still unresolved: confirm LMS, RAG chatbot, and document pipeline are the three, and which one is the featured case study. | No longer blocking. Appendix B defines the golden sample as a stress test at maximum lengths, not as a real project: an 80-character title and 12 technologies exercise the layout identically whichever project it turns out to be. Phase 2 shipped a synthetic sample under the slug `placeholder-project`. The answer decides only whether Phase 5 renames that slug or writes a file beside it | Phase 5 |
| 4 | **Low-stakes leftovers.** Résumé hosting (repo `public/` or Cloudflare R2), hero visual (portrait or illustration or none), and analytics. | Worth answering eventually, none of it blocks anything now | Phases 3 to 6 |

---

## 20. Content intake checklist

What you will eventually supply. Nothing here can be invented by the implementation, but per
§5.6, placeholders are fine until Phase 5.

### Per project (×3 for v1)

- [ ] Title, one-sentence summary under 200 characters
- [ ] Category, status, start and end year
- [ ] Your specific role, and honest team size
- [ ] 3 to 12 technologies that were genuinely used
- [ ] GitHub and/or live URL, or an explicit note that the source is private
- [ ] 1 to 3 overview paragraphs
- [ ] 3 to 8 capability bullets
- [ ] 2 to 8 features with a title and short body each
- [ ] Up to 4 code snippets, redacted, each with a title and one line on why it matters
- [ ] Up to 8 screenshots, plus alt text for each
- [ ] Up to 5 lessons learned
- [ ] For the featured project only: challenge, decision, outcome paragraphs
- [ ] A cover image, landscape

### Site-wide

- [ ] Headline, eyebrow, hero paragraph
- [ ] Real availability status and location, and whether to show the badge at all
- [ ] Email address, GitHub, LinkedIn
- [ ] Résumé PDF, with the month it was last updated
- [ ] About page: professional story, how you work, current focus, optional personal note
- [ ] Full experience timeline
- [ ] All certifications with issuer, date, credential URL, and 2 to 4 relevant skills
- [ ] Skills grouped by use context
- [ ] Three engineering-focus pillars

### Content warnings

Redact client names under NDA, credentials, internal URLs, and any user data appearing in
screenshots. Confirm every snippet you publish is yours to publish.

---

## 21. Guardrails

- **No invented metrics.** Verifiable scope instead: "three-role RBAC model," "35+
  relational tables."
- **No copying the reference portfolio.** Information hierarchy is fair to learn from;
  layout, copy, components, and assets are not.
- **No skill percentage bars, radar charts, or star ratings.** Unfalsifiable, reads as
  filler.
- **No hover-only affordances.** Anything reachable by hover is reachable by keyboard and
  visible on touch. The custom cursor (§10.3) is decoration layered on top of a control
  that already works without it, which is why it is allowed.
- **No content inside components.** If a component contains a sentence about you, it is
  wrong.
- **No motion that loops while someone is reading.** This replaces v2's "no animation that
  runs while someone is reading, nothing that moves on scroll except a one-time reveal,"
  which was the single line that made this site feel like print. Entrances, page
  transitions, image reveals, and character splits are now not merely allowed but
  specified — see §10, rewritten. What survives from the old rule is its actual core: an
  animation that repeats until it is noticed is an animation competing with the text.
- **Em dashes stay rare in site copy.** Reach for a period, comma, colon, or parenthetical
  first.
- **No "coming soon" sections.** A page either ships finished or does not ship. Placeholder
  content during development (§5.6) is different from a placeholder shipped to production.
- **No permanent placeholder assets.** Stub images and synthetic copy are expected early;
  none survive to launch.

*(Removed from v1.0: "no raising a budget to make a build pass," since there are no budgets
to raise; "no client-side syntax highlighting," reversed, it is now the plan per §12.4.)*

---

## Appendix A — Command reference

**What `package.json` defines today:**

```bash
pnpm dev              # local development, http://localhost:3000
pnpm typecheck        # tsc --noEmit
```

**What this spec has been assuming, and which do not exist yet** (§15.3). Written here as
the target, not as usable commands:

```bash
pnpm build            # production build — works as `next build`, no script alias
pnpm start            # serve the production build locally
pnpm check            # prettier + eslint + tsc + unit tests — informational
pnpm test:e2e         # playwright, run when useful, not on every push
pnpm test:a11y        # axe sweep, run periodically
```

Note that AGENTS.md's active development gate asks agents not to run build, test, or
CI-style commands during day-to-day iteration — `pnpm typecheck` is the sanctioned check.
The list above becomes real at a deployment checkpoint, not before.

**Asset generation** (Python, run by hand, outputs committed):

```bash
python scripts/build_brand.py    # brand marks → lib/brand-marks.ts
python scripts/build_covers.py   # 8K source renders → public/images/projects/*.avif
```

## Appendix B — Golden sample definition

The Phase 2 sample project must simultaneously exercise: an 80-character title, a
200-character summary, 12 technologies, 8 features, 5 lessons, a full case-study block, one
missing optional link, and one very long technology name. If the layout survives that, it
survives the real content, even while every asset in it is a placeholder per §5.6.

**Amended 2026-08-30.** The original list also demanded 4 code snippets in 3+ languages with
one forcing horizontal scroll, and 6 screenshots of mixed aspect ratios. Both sections were
removed from §8.3, so neither can be exercised. This appendix records what the sample was
*for* — a stress test at maximum lengths — and that purpose is now served by a shorter list.
Its work is done regardless: the design review it existed to enable happened in Phases 2
through 4.

## Appendix C — Change log

| Version | Date | Change |
|---|---|---|
| 2.1.6 | 2026-09-01 | **Reconciliation pass — the spec is re-derived from the tree rather than the tree from the spec.** §4 rewritten against the actual file layout, with a new §4.2 recording the six places they had diverged and whether each was a decision or an oversight. New §7.5 specifies `SectionRail` and the viewport scrollbar removal. New §10.4 states what remains before the motion inventory is applied. §10 gains a build-status column and amends the nav-indicator row to the CSS implementation that shipped 2026-08-15. §9.2 gains `MainNav`, `ThemeScript`, `SectionRail`; §9.4 gains `MotionProvider` and names `MobileNavigation` as the one sanctioned exception to the wrapper rule. §14 amended: the contact endpoint is a Next route, not a Cloudflare Worker, and CORS therefore does not apply. New §15.3 and an amended §16.2 record that the Vitest invariant tests and `ci.yml` were never built. Appendix A separates the two commands that exist from the five this spec had been assuming. §18 gains a status header, per-phase notes on what each phase left behind, and marks Phase 5 next. §8.2 and §8.3 record why the two project routes have no rail. §19: Q1, Q2, and Q4's résumé sub-question closed. Header status corrected from "Phase 2 — golden sample", which had been stale since 2026-08-18. |
| 1.0 | 2026-08-15 | Initial full specification, derived from the rough brief. Removed from the repo when superseded. |
| 2.0 | 2026-08-15 | Rewritten per owner direction: removed static-export, no-JS, and bundle-budget constraints; dropped `shiki` and `sharp`; added a third typeface (Source Serif 4, Instrument Sans, IBM Plex Mono); added the em-dash rarity rule; downgraded testing, a11y, and performance from CI gates to advisory guidance; added the placeholder-content policy for early phases. |
| 2.0.1 | 2026-08-15 | Domain resolved to `mukeremshifa.com` and applied throughout (§2, §13, §14.1, §16.4, §17.2, Phase 0). v1.0 `MASTERPLAN.md` and `scripts/check-contrast.mjs` deleted from the repo; `docs/DECISIONS.md` reset to a v2 baseline. Repaired three malformed rows in the §19 table and a stale `assets/raw/` reference in §12.2. |
| 2.1.5 | 2026-08-18 | §5.2 gains an optional `portrait` (§8.1 named `ProfileVisual` but no schema supplied it) and relaxes `resume.url` to a root-relative path or an absolute URL, since the résumé is a same-origin asset and the alternative hard-coded the origin into content. §8.7 and §18: `/contact/` ships in Phase 3 on the degraded path the section already specifies, with `ContactForm` still Phase 4. §9.3's `headingLevel` widens to include `h2`, which index routes need to avoid skipping a level. §9.4 gains `LayoutItem` for §10.2's filter animation. §5.6 points the launch sweep at `docs/STUB-INVENTORY.md`. §19's four questions are recorded as non-blocking. |
| 2.1.4 | 2026-08-18 | §5.3 gains required `width`/`height` on `cover` and `screenshots[]`: `next/image` needs intrinsic dimensions and `unoptimized: true` does not change that. §18 Phase 2 gains OG image generation (moved from Phase 3) and the Vitest wiring; Phase 3's line about it is now scoped to `CaseStudyNavigation` and the contact callout. |
| 2.1.3 | 2026-08-15 | §16.1 gains an explicit merge strategy (rebase into `dev`, fast-forward into `main`, never squash a branch that outlives the merge), a no-force-push rule for `dev` and `main`, phase tags, and a promotion cadence with the reasoning behind it. §13.3 gains the environment-flagged crawl block that makes promoting before launch safe. |
| 2.1.2 | 2026-08-15 | `brand-solid-hover` added to §6.2, §6.3, and §6.4. §6.3 defined no hover fill for a filled button in dark mode, and reusing `brand-hover` there put white text on `#60A5FA` at 2.60:1. New token, no existing value changed. |
| 2.1.1 | 2026-08-15 | §6 token names reconciled ahead of Phase 1: `surface-sunken` (§6.2) and `surface-raised` (§6.3) both become `surface-alt`, matching §6.4 and §6.8. `brand-soft` added to the §6.3 dark table (§6.4 already defined it). `brand-cream` and `code-bg` added to `@theme inline`; `ring`'s deliberate absence from it documented. No colour value changed. §19 question 2 (typography) resolved; list renumbered and the mailbox question reprioritised to Phase 5. |
| 2.1 | 2026-08-15 | Hosting resolved: Vercel for the app, Cloudflare for the backend, storage, and DNS (§2, §14, §16.3, §16.4). `deploy.yml` dropped in favour of Vercel's Git integration. Apex confirmed canonical, `www` redirects to it (§13.3). `prism-react-renderer` removed before installation: code blocks are native `<pre><code>` and `lib/highlight.ts` is gone (§2.1, §4, §5.3, §8.3, §9.1, §12.4, Phase 2). §19 questions 2 and 4 resolved, list renumbered. Corrected §12.2's claim that `sharp` is absent — it ships as an `optionalDependency` of `next`. |
