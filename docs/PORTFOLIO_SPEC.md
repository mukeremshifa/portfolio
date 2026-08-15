# Portfolio — Specification v2.1 (Quality-First)

**Owner:** Mukerem Shifa · **Repo:** `mukeremshifa/portfolio` · **Domain:** `mukeremshifa.com` · **Status:** Phase 0 — foundations
**Spec version:** 2.1 · **Supersedes:** MASTERPLAN v1.0 (removed from the repo) · **Drafted:** 2026-08-15

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

```text
portfolio/
├── .github/workflows/
│   └── ci.yml                  # format, lint, typecheck — informational, not blocking
├── app/
│   ├── layout.tsx              # html/body, fonts, theme script, MotionConfig, skip link
│   ├── globals.css             # tailwind import, @theme tokens, base layer
│   ├── page.tsx                # home
│   ├── not-found.tsx
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── about/page.tsx
│   ├── projects/page.tsx
│   ├── projects/[slug]/page.tsx
│   ├── experience/page.tsx
│   ├── certifications/page.tsx
│   └── contact/page.tsx
├── components/
│   ├── layout/                 # SiteHeader, MobileNavigation, SiteFooter, SkipLink, ThemeToggle
│   ├── home/                   # Hero, FeaturedProjects, EngineeringFocus, FeaturedCaseStudy,
│   │                           #   ExperiencePreview, CredentialsPreview, ContactCallout
│   ├── projects/               # ProjectCard, ProjectGrid, ProjectFilter, ProjectFacts,
│   │                           #   CodeHighlight, ScreenshotGallery, CaseStudyNavigation
│   ├── experience/             # ExperienceTimeline, ExperienceEntry
│   ├── certifications/         # CertificationCard, CertificationGrid
│   ├── contact/                # ContactForm, ContactChannels
│   ├── motion/                 # Reveal, Stagger — client wrappers with no visual opinion
│   └── ui/                     # Button, Tag, SectionHeading, ExternalLink, StatusBadge,
│                               #   Container, Prose, Figure, CodeBlock, VisuallyHidden
├── content/
│   ├── site.json               # identity, socials, availability, location, résumé
│   ├── projects/*.json
│   ├── experience/timeline.json
│   ├── certifications/certifications.json
│   ├── skills/skills.json
│   └── focus/focus.json        # engineering-focus pillars
├── lib/
│   ├── schemas.ts              # Zod schemas — the only place shapes are defined
│   ├── content.ts              # load, validate, and derived selectors
│   ├── metadata.ts             # buildMetadata(), canonical URLs
│   ├── structured-data.ts      # JSON-LD builders
│   └── utils.ts                # cn(), formatDate(), and friends
├── public/
│   ├── images/                 # real assets once available; placeholders until then (§5.6)
│   ├── placeholders/           # generic stub svg/png/webp used during early phases
│   └── og/                     # OG images
├── tests/
│   ├── unit/                   # vitest — advisory
│   └── e2e/                    # playwright — advisory
├── worker/                     # contact endpoint — Cloudflare Worker (§14), added in Phase 4
└── docs/
    ├── PORTFOLIO_SPEC.md       # this file
    └── DECISIONS.md            # append-only log of deviations from this spec
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
```

### 5.2 `content/site.json`

```ts
export const SiteSchema = z.object({
  name: z.string().min(1),
  wordmark: z.string().min(1).max(4),
  role: z.string().min(1),
  eyebrow: z.string().min(1).max(60),
  headline: z.string().min(1).max(90),
  intro: z.string().min(80).max(400),
  email: z.email(),
  location: z.object({
    label: z.string(),
    remote: z.boolean(),
  }),
  availability: z.object({
    show: z.boolean(),
    state: z.enum(["available", "open", "unavailable"]),
    label: z.string().max(60),
  }),
  resume: z.object({
    url: z.url(),
    updated: z.string().regex(/^\d{4}-\d{2}$/),
  }).optional(),
  socials: z.array(z.object({
    platform: z.enum(["github", "linkedin", "email", "x", "other"]),
    label: z.string(),
    url: z.url(),
  })).min(2),
  featuredCaseStudySlug: z.string(),
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
  cover: z.object({
    src: z.string(),
    alt: z.string().min(10),
  }),
  overview: z.array(z.string()).min(1).max(3),
  capabilities: z.array(z.string()).min(3).max(8),
  features: z.array(z.object({
    title: z.string(),
    body: z.string(),
  })).min(2).max(8),
  codeSnippets: z.array(z.object({
    title: z.string(),
    language: z.string(),                        // plain label: the class="language-*" hook
    file: z.string().optional(),
    note: z.string().optional(),
    code: z.string().min(1),
  })).max(4).default([]),
  screenshots: z.array(z.object({
    src: z.string(),
    alt: z.string().min(10),
    caption: z.string().optional(),
  })).max(8).default([]),
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

### 5.4 Experience, certifications, skills, focus

```ts
const YearMonth = z.string().regex(/^\d{4}-\d{2}$/);

export const ExperienceSchema = z.object({
  id: z.string(),
  role: z.string(),
  organization: z.string(),
  organizationUrl: z.url().optional(),
  type: z.enum(["employment", "freelance", "internship", "research", "education", "independent"]),
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
| 4 | `site.featuredCaseStudySlug` resolves and that project has a `caseStudy` block | An empty home section |
| 5 | Every `cover.src` and `screenshots[].src` exists | Broken images |
| 6 | Exactly 3 focus pillars | A broken three-column layout |
| 7 | At most one experience entry per organization has `end: null` | Two simultaneous "Present" roles |
| 8 | Every technology string appears in at least one skills group, or is explicitly allowlisted | Vocabulary drift between pages |

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

---

## 6. Design system

Direction unchanged from the brief: modern, minimalist, warm beige canvas with white cards in
light mode, obsidian with elevated slate cards in dark mode, cobalt used sparingly. Hierarchy
comes from type, spacing, and hairline borders, not shadows or ornament.

### 6.1 Two corrections to the original draft palette

**(a) Borders need a second, stronger token.** Draft border values are decorative dividers
and measure well below 3:1 against their backgrounds. WCAG 2.2 SC 1.4.11 wants 3:1 for the
visual boundary of an actual control (inputs, outline buttons, filter chips), so the system
keeps `border-subtle` (decorative) **and** `border-strong` (interactive): `#8A8279` light,
`#6B7385` dark.

**(b) The dark accent splits into two roles.** `#2563EB` on the dark canvas is 3.71:1 (fails
AA for body text); `#3B82F6` reaches 5.21:1. Conversely white on `#2563EB` is 5.17:1, making
it a good solid button fill. So dark mode uses `#3B82F6` for links/accent text and `#2563EB`
for filled buttons. Light mode needs no split, `#0A39A6` serves both roles well.

### 6.2 Colour tokens — light

| Token | Value | Role |
|---|---|---|
| `canvas` | `#F3ECE2` | Page background |
| `surface` | `#FFFFFF` | Cards, inputs, raised panels |
| `surface-sunken` | `#EDE5DA` | Code chrome, inset wells |
| `text` | `#1E2229` | Primary text |
| `text-muted` | `#5C6470` | Secondary text, metadata |
| `brand` | `#0A39A6` | Links, primary fill, accents |
| `brand-hover` | `#082D85` | Hover and active accent |
| `brand-contrast` | `#FFFFFF` | Text on a brand fill |
| `brand-soft` | `#E6EAF6` | Tinted badge background |
| `border-subtle` | `#E4DBD0` | Decorative dividers only |
| `border-strong` | `#8A8279` | Control boundaries |
| `ring` | `#0A39A6` | Focus indicator |
| `danger` | `#B42318` | Form errors |
| `success` | `#05683F` | Form success |
| `warning` | `#8A5A00` | Warnings |
| `code-bg` | `#FBF8F3` | Code block background |

### 6.3 Colour tokens — dark

| Token | Value | Role |
|---|---|---|
| `canvas` | `#0B0F19` | Page background |
| `surface` | `#161C2A` | Cards, inputs, raised panels |
| `surface-raised` | `#1D2536` | Hover state for cards, popovers |
| `text` | `#F3F4F6` | Primary text |
| `text-muted` | `#9CA3AF` | Secondary text, metadata |
| `brand` | `#3B82F6` | Links and accent text |
| `brand-hover` | `#60A5FA` | Hover and active accent |
| `brand-solid` | `#2563EB` | Filled button surface only |
| `brand-contrast` | `#FFFFFF` | Text on `brand-solid` |
| `brand-cream` | `#ECE3D4` | Warm highlight for key tags |
| `border-subtle` | `#232D3F` | Decorative dividers only |
| `border-strong` | `#6B7385` | Control boundaries |
| `ring` | `#3B82F6` | Focus indicator |
| `danger` | `#FCA5A5` | Form errors |
| `success` | `#4ADE80` | Form success |
| `warning` | `#FBBF24` | Warnings |
| `code-bg` | `#0F1523` | Code block background |

**Binding rules.**

- `border-subtle` may never be the only thing identifying an interactive control.
- Never place body text on `brand-solid` in dark mode except in `brand-contrast` white.
- `brand-cream` is dark-mode-only; do not fake it with beige on white in light mode.

### 6.4 Token wiring (Tailwind v4)

```css
/* app/globals.css */
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

:root {
  --canvas: #f3ece2;  --surface: #ffffff;  --surface-alt: #ede5da;
  --text: #1e2229;    --text-muted: #5c6470;
  --brand: #0a39a6;   --brand-hover: #082d85;  --brand-solid: #0a39a6;
  --brand-contrast: #ffffff;  --brand-soft: #e6eaf6;
  --border-subtle: #e4dbd0;   --border-strong: #8a8279;
  --ring: #0a39a6;
  --danger: #b42318;  --success: #05683f;  --warning: #8a5a00;
  --code-bg: #fbf8f3;
}

.dark {
  --canvas: #0b0f19;  --surface: #161c2a;  --surface-alt: #1d2536;
  --text: #f3f4f6;    --text-muted: #9ca3af;
  --brand: #3b82f6;   --brand-hover: #60a5fa;  --brand-solid: #2563eb;
  --brand-contrast: #ffffff;  --brand-soft: #16243d;  --brand-cream: #ece3d4;
  --border-subtle: #232d3f;   --border-strong: #6b7385;
  --ring: #3b82f6;
  --danger: #fca5a5;  --success: #4ade80;  --warning: #fbbf24;
  --code-bg: #0f1523;
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
  --color-brand-contrast: var(--brand-contrast);
  --color-brand-soft: var(--brand-soft);
  --color-border-subtle: var(--border-subtle);
  --color-border-strong: var(--border-strong);
  --color-danger: var(--danger);
  --color-success: var(--success);
  --color-warning: var(--warning);
}
```

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

### 6.7 Space, layout, radius, elevation

- **Spacing scale:** the Tailwind 4px base. Component padding uses 12/16/24; section padding
  uses 64px mobile and 112px desktop; the gap between a section heading and its content is
  32px.
- **Containers:** `--container-content: 1200px` (grids, cards) and `--container-prose: 720px`
  (running text). Gutters: 20px mobile, 32px at `md`, 48px at `xl`.
- **Breakpoints:** Tailwind defaults. Design and review at 320, 768, and 1280.
- **Radii:** `sm 6px` (chips, inputs), `md 10px` (buttons), `lg 16px` (cards, media), `full`
  (avatars, dots).
- **Elevation:** default is a 1px `border-subtle` plus a surface change. One shadow token,
  `--shadow-overlay`, reserved for the mobile navigation panel and any dialog. Cards do not
  get shadows in either theme.
- **Grid:** 12 columns at `lg` and up, 1 column below `md`. The featured project spans full
  width; secondary project cards are two-up at `md` and up.

### 6.8 Component style rules

- **Buttons.** Three variants: `primary` (brand fill, `brand-contrast` text), `secondary`
  (transparent, `border-strong`, `text`), `ghost` (text-only, used inside cards). Minimum hit
  area 44×44 CSS px.
- **Cards.** `surface` background, `border-subtle`, radius `lg`, padding 24px. Hover raises
  the border to `border-strong` and shifts the background to `surface-alt`. The whole card
  is not a link; the title anchor carries a stretched pseudo-element.
- **Tags / chips.** `body-sm` in **IBM Plex Mono** (technologies read like data, not prose),
  `surface-alt` background, `border-subtle`, radius `sm`. In dark mode a key tag may use
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
| `/certifications/` | `app/certifications/page.tsx` | "Certifications" | Credentials |
| `/contact/` | `app/contact/page.tsx` | "Contact" | Convert interest |
| `/404` | `app/not-found.tsx` | "Page not found" | Recover the visitor |
| `/sitemap.xml` | `app/sitemap.ts` | — | Discovery |
| `/robots.txt` | `app/robots.ts` | — | Crawl policy |

Rendering mode per route is an implementation detail (§3). Pick whatever is simplest.

### 7.2 Navigation

```text
[ MK ]        Projects   Experience   About   Certifications        [ Let us talk → ]
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

```text
Mukerem Shifa — AI Engineer & Full-Stack Developer
Based in {location.label} · {location.remote ? "Available remotely" : ""}
GitHub · LinkedIn · Email
© {currentYear} Mukerem Shifa. Built with Next.js.
```

Location and availability come from `site.json` so neither is overstated in markup.

### 7.4 Cross-page linking rules

- Every project card links to its detail page. Case-study and source links are never
  hover-only and never hidden behind an icon without an accessible name.
- Project detail pages end with previous/next project navigation and a contact CTA.
- The home page links to `/projects/`, `/experience/`, `/certifications/`, and `/contact/`.
- External links use `ExternalLink`, which adds `rel="noopener noreferrer"`, `target="_blank"`,
  and a visually hidden "(opens in a new tab)" suffix.

---

## 8. Page specifications

### 8.1 Home — `/`

Section order walks the visitor from who, to proof, to how, to depth, to history, to
credibility, to contact.

| # | Section | Component | Data | Heading |
|---|---|---|---|---|
| 1 | Hero | `Hero` | `site` | `h1` (headline) |
| 2 | Selected work | `FeaturedProjects` | `getFeaturedProjects()` | `h2` "Selected work" |
| 3 | Engineering focus | `EngineeringFocus` | `getFocus()` | `h2` "Engineering focus" |
| 4 | Featured case study | `FeaturedCaseStudy` | `getFeaturedCaseStudy()` | `h2` "Featured case study" |
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

**Featured case study.** Renders `caseStudy.challenge`, `.decision`, `.outcome` under visible
sub-labels, then a link to the full project page.

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
h2  What it does          (capabilities list)
h2  Key features          (h3 per feature)
h2  Code highlights       (h3 per snippet)
h2  Screenshots
h2  Lessons learned

[ ← Previous project ]  [ Next project → ]
[ Contact CTA ]
```

- Sections whose data is empty are not rendered. No empty headings.
- `ProjectFacts` is a description list (`dl`/`dt`/`dd`), not a table.
- `CodeHighlight` renders semantic markup only: `<pre><code class="language-*">` holding the
  raw source as text, with no colouring (§12.4). Each block has a visible title, an optional
  filename chip, an optional one-line note, and a copy button.
- Code blocks that overflow horizontally get `tabindex="0"`, `role="region"`, and an
  `aria-label` naming the snippet.
- Screenshots use `Figure` with required alt text and optional visible captions. No lightbox
  in v1.

### 8.4 Experience — `/experience/`

Chronological, newest first, an ordered list with a visible vertical rule. Each entry: date
range, role, organization (linked when `organizationUrl` exists), optional location, a
summary paragraph, 1 to 5 achievement bullets, technology tags.

- `end: null` renders "Present."
- Entry `type` is shown as a small labelled badge (Employment, Freelance, Research, and so
  on) so independent work is never dressed up as employment.
- Page ends with a résumé download link when available, plus the contact callout.

### 8.5 About — `/about/`

Prose-width page (720px), deliberately short.

```text
h1  About
    Lead paragraph, the professional story in 3 to 5 sentences.

h2  How I work
    - Build for real constraints
    - Prefer maintainable systems over novelty
    - Treat accessibility and clarity as product requirements

h2  What I am focused on now
h2  Tools I use            (skills groups from skills.json)
h2  Outside engineering    (optional, one short paragraph)
```

Skills live here rather than on the home page: they support the evidence in projects, they
are not the evidence. Groups render as definition lists with no proficiency indicators.

### 8.6 Certifications — `/certifications/`

Card grid, newest first. Each card: title, issuer (linked when available), issue date, 2 to 4
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

### 9.3 Domain components

```ts
type ProjectCardProps = {
  project: Project;
  variant?: "featured" | "standard";
  headingLevel?: "h3" | "h4";
};

type ProjectGridProps = { projects: Project[]; headingLevel?: "h3" | "h4" };

type ProjectFilterProps = {
  categories: { value: Category | "all"; label: string; count: number }[];
  value: Category | "all";
  onChange: (next: Category | "all") => void;
};

type ProjectFactsProps = { project: Project };

type CaseStudyNavigationProps = { prev?: ProjectRef; next?: ProjectRef };

type ExperienceTimelineProps = { entries: ExperienceEntry[]; compact?: boolean };

type CertificationCardProps = { certification: Certification; headingLevel?: "h3" };

type ContactFormProps = { endpoint: string; email: string };
```

### 9.4 Motion wrappers — `components/motion/`

```ts
type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  as?: "div" | "section" | "li";
};

type StaggerProps = {
  children: React.ReactNode;
  step?: number;
};
```

These are the only components that import from `motion/react` outside `app/layout.tsx`.
---

## 10. Motion system

Motion is used freely where it improves comprehension, never as decoration. Test for any
animation: **remove it and ask whether the interface got harder to understand.** If not, it
does not ship.

### 10.1 Tokens

```css
--duration-fast: 120ms;
--duration-base: 200ms;
--duration-slow: 320ms;
--ease-standard: cubic-bezier(0.2, 0, 0, 1);
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
```

### 10.2 Inventory

| Where | Motion | Spec |
|---|---|---|
| Section entrance | `Reveal` | opacity 0 to 1, `translateY(12px)` to 0, `base`, `ease-out` |
| Card grids | `Stagger` | 60ms between children, capped at 6 |
| Card hover | CSS | border/background over `fast`; `translateY(-2px)` |
| Button hover/active | CSS | background over `fast`; active scales to 0.98 |
| Nav active indicator | Motion `layoutId` | underline slides between items |
| Mobile nav | Motion | panel slides from the right over `slow` |
| Theme toggle | CSS | icon crossfade over `fast` |
| Project filter | Motion `layout` | cards reposition over `base` |
| Contact form state | CSS | button label crossfade; live region never animated |

Excluded: parallax, scroll-jacking, ticking counters, typewriter effects, looping background
animation, cursor followers, blob gradients, anything that moves while someone is reading.

### 10.3 Reduced motion

`app/layout.tsx` wraps the tree in `<MotionConfig reducedMotion="user">`, plus a CSS block
covering everything Motion does not own:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Under reduced motion, every interaction stays legible: hover states become instant colour
changes, the mobile panel appears rather than slides, filtered cards jump rather than glide.

*(The v1.0 "no-JavaScript constraint on motion" section is gone. There is no requirement
that content render before scripting runs, so `Reveal` can simply start hidden and animate in
without the `@media (scripting: enabled)` guard.)*

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
- `app/robots.ts` allows everything and points at the sitemap.
- Canonical URLs are absolute on every page, built from `https://mukeremshifa.com`.
- The apex is canonical (resolved 2026-08-15). `www.mukeremshifa.com` redirects to it, and
  `NEXT_PUBLIC_SITE_URL` is `https://mukeremshifa.com` exactly — no `www`, no trailing slash.

### 13.4 Open Graph images

Target 1200×630 per route, plus one per project. `opengraph-image.tsx` with `ImageResponse`
is the simplest option under a normal (non-static-export) Next.js deployment; use it. Each OG
card is generated from content, not hand-designed per project: project title, category, and
wordmark on the brand palette.

---

## 14. Contact backend

A Cloudflare Worker on `api.mukeremshifa.com`, built in Phase 4. Because the app runs on
Vercel and the endpoint runs on Cloudflare, every request to it is cross-origin, which makes
the CORS allowlist below load-bearing rather than a formality.

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

---

## 16. CI/CD & deployment

### 16.1 Branching

- `main` for production.
- `dev` for integration, deploys to a preview on push.
- `feat/*`, `fix/*`, `content/*` are short-lived, branched from `dev`.

### 16.2 `ci.yml` — informational, not a gate

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

### Phase 0 — Foundations

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

### Phase 1 — Design system and application shell

- `globals.css` with the full token set (§6.4) and the three-family type scale (§6.6).
- Theme mechanics: inline no-flash script, `ThemeToggle`.
- `ui/` primitives, `layout/` shell, `motion/` wrappers.
- `app/not-found.tsx`.

**Exit:** a demo route renders every primitive in both themes; header, footer, and mobile
navigation are keyboard-operable.

### Phase 2 — Golden sample

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

**Exit:** the golden project page is complete and adding a second project requires zero
component changes.

### Phase 3 — Remaining pages

- Home: all seven sections in order (§8.1).
- `/projects/` with the filter and its live region.
- `/experience/`, `/about/`, `/certifications/`.
- `CaseStudyNavigation` and the contact callout on project pages.

**Exit:** every route in §7.1 is built and reads as finished (with placeholder content).

### Phase 4 — Contact path

- Contact endpoint implementing §14, on whatever host was chosen.
- `ContactForm` with validation, error wiring, live regions, honeypot.
- `/contact/` page with the direct channels always present.

**Exit:** a real message arrives; disabling the endpoint degrades to the email-only path.

### Phase 5 — Content sprint

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
Phase 0.

What is left genuinely needs your input:

| # | Question | Why it matters | Needed by |
|---|---|---|---|
| 1 | **Contact mailbox.** The domain is settled, but which address should the site show and the form deliver to? A domain mailbox (`hello@mukeremshifa.com`, `mukerem@mukeremshifa.com`) reads more professional than a Gmail address and is free to set up once DNS exists. If you would rather keep Gmail, confirm the exact address so `site.email` is right. | It is printed on the contact page, the footer, the hero social links, and structured data | Phase 1 |
| 2 | **Typography roles.** Source Serif 4 for headlines, Instrument Sans for body and UI, IBM Plex Mono for code, technology tags, and eyebrows. A fairly standard editorial-serif plus clean-sans plus technical-mono pairing. Happy to swap the roles (serif only for the hero, sans everywhere else) if you had something more specific in mind. | Affects the whole type scale in §6.6 | Phase 1 |
| 3 | **Email delivery for the contact endpoint.** Whichever provider you already have an account for; it is a one-file swap behind `sendEmail()` regardless. | Determines Phase 4 secrets and setup | Phase 4 |
| 4 | **The three v1 projects.** Carried over from v1.0, still unresolved: confirm LMS, RAG chatbot, and document pipeline are the three, and which one is the featured case study. | Phase 2 cannot produce a golden sample without knowing the shape of the real thing | Phase 2 |
| 5 | **Low-stakes leftovers.** Résumé hosting (repo `public/` or Cloudflare R2), hero visual (portrait or illustration or none), and analytics. | Worth answering eventually, none of it blocks anything now | Phases 3 to 6 |

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
  visible on touch.
- **No content inside components.** If a component contains a sentence about you, it is
  wrong.
- **No animation that runs while someone is reading**, nothing that moves on scroll except a
  one-time reveal.
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

```bash
pnpm dev              # local development
pnpm build            # production build
pnpm start            # serve the production build locally
pnpm check            # prettier + eslint + tsc + unit tests — informational
pnpm test:e2e         # playwright, run when useful, not on every push
pnpm test:a11y        # axe sweep, run periodically
```

## Appendix B — Golden sample definition

The Phase 2 sample project must simultaneously exercise: an 80-character title, a
200-character summary, 12 technologies, 4 code snippets in at least 3 languages including one
with long lines that force horizontal scroll, 6 screenshots of mixed aspect ratios, 5 lessons,
a full case-study block, one missing optional link, and one very long technology name. If the
layout survives that, it survives the real content, even while every asset in it is a
placeholder per §5.6.

## Appendix C — Change log

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-08-15 | Initial full specification, derived from the rough brief. Removed from the repo when superseded. |
| 2.0 | 2026-08-15 | Rewritten per owner direction: removed static-export, no-JS, and bundle-budget constraints; dropped `shiki` and `sharp`; added a third typeface (Source Serif 4, Instrument Sans, IBM Plex Mono); added the em-dash rarity rule; downgraded testing, a11y, and performance from CI gates to advisory guidance; added the placeholder-content policy for early phases. |
| 2.0.1 | 2026-08-15 | Domain resolved to `mukeremshifa.com` and applied throughout (§2, §13, §14.1, §16.4, §17.2, Phase 0). v1.0 `MASTERPLAN.md` and `scripts/check-contrast.mjs` deleted from the repo; `docs/DECISIONS.md` reset to a v2 baseline. Repaired three malformed rows in the §19 table and a stale `assets/raw/` reference in §12.2. |
| 2.1 | 2026-08-15 | Hosting resolved: Vercel for the app, Cloudflare for the backend, storage, and DNS (§2, §14, §16.3, §16.4). `deploy.yml` dropped in favour of Vercel's Git integration. Apex confirmed canonical, `www` redirects to it (§13.3). `prism-react-renderer` removed before installation: code blocks are native `<pre><code>` and `lib/highlight.ts` is gone (§2.1, §4, §5.3, §8.3, §9.1, §12.4, Phase 2). §19 questions 2 and 4 resolved, list renumbered. Corrected §12.2's claim that `sharp` is absent — it ships as an `optionalDependency` of `next`. |
