# Portfolio

Personal portfolio website for Mukerem Shifa, AI Engineer & Full-Stack Developer.
Domain: [mukeremshifa.com](https://mukeremshifa.com)

Status: **v1.0.0 — shipped.** All seven phases are complete and tagged `phase-0` through
`phase-6` on `dev`. The site is live, indexed, and the content is real: `STUB-INVENTORY.md`
is empty, all 33 external URLs were opened by hand, and the two absences that outlived the
sweep — screenshots, and covers for the three projects with no front end — are decisions in
`DECISIONS.md` rather than gaps.

Phase 6 profiled the deployed site rather than assuming: desktop scored 99/100/100/100, and
a mobile LCP of 3.2 s traced to Next 16 having deprecated `priority` to a silent no-op on
three call sites that all looked correct. `images.unoptimized` stays, on measured numbers —
the whole `public/` tree is 1.1 MB and the heaviest page gzips to 60.4 KB. Security headers
ship with a deliberate and documented absence of a CSP (§16.4).

Every resource the owner supplies is a content change: the portrait, the resume, the
address, the email, a project, a credential. Editing `content/` or dropping a file into
`public/` is the whole procedure, and each row of that table was verified by doing it.

## Documentation

| Document | What it covers |
| --- | --- |
| [docs/PORTFOLIO_SPEC.md](docs/PORTFOLIO_SPEC.md) | Specification v2.1.5: stack, content model, design system, page specs, accessibility, testing, deployment, and a seven-phase delivery plan |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Append-only log of decisions that change the spec |
| [docs/STUB-INVENTORY.md](docs/STUB-INVENTORY.md) | Where every owner-supplied resource lives and what swapping it costs. The stub table is empty as of v1.0.0, which means the swap matrix is entirely real |

Section 18 (Delivery plan) records what each phase actually closed with. `DECISIONS.md`
is the more useful entry point for why anything is the way it is — it is append-only and
carries the cost of each decision as well as the benefit.

## Stack

Next.js (App Router) - React 19 - TypeScript - Tailwind CSS v4 - Zod - Motion - GitHub
Actions. The app deploys to **Vercel**; the contact endpoint, object storage, and DNS are
**Cloudflare** (section 16.4). Code blocks are native `<pre><code>` with no syntax
highlighter (section 12.4).

## Local development

Requires Node 22.x and pnpm 10.29.3 (both pinned; `corepack enable` picks up the right
pnpm).

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm check        # format:check + lint + typecheck + test:unit
```

`pnpm check` is what CI runs, as four parallel jobs. Individually: `format:check`, `lint`,
`typecheck`, `test:unit` (57 tests over the §5.5 invariants, the loader, the JSON-LD
builders, the formatters, the link policy and the routing surface). Per `AGENTS.md`,
day-to-day iteration is `pnpm dev` plus `pnpm typecheck`; the full check belongs at a
deployment checkpoint.

The two asset generators are Python, run by hand, with their output committed:

```bash
python scripts/build_brand.py    # brand marks -> lib/brand-marks.ts
python scripts/build_covers.py   # 8K source renders -> public/images/projects/*.avif
```

Copy `.env.example` to `.env.local` if you need to override anything locally. Nothing in it
is required for `pnpm dev` to run.

## Deployment

Vercel builds every push through its GitHub integration. `main` deploys to production at
`mukeremshifa.com`; `dev` and pull requests get preview URLs. There is no deploy workflow in
this repo, by design (section 16.3). `.github/workflows/ci.yml` runs the four quality tasks
and is informational — nothing here gates a merge (section 16.2).

Branching, per section 16.1: `feat/*` branches from `dev` and **rebases** back; `dev` reaches
`main` **fast-forward only**. Neither `dev` nor `main` is ever squashed or force-pushed —
squashing a branch that outlives the merge severs its ancestry, and this repo has been
repaired from exactly that once.
