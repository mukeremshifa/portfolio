# Portfolio

Personal portfolio website for Mukerem Shifa, AI Engineer & Full-Stack Developer.
Domain: [mukeremshifa.com](https://mukeremshifa.com)

Status: **Phase 4 complete — next is Phase 5, the content sweep.** All seven routes in
section 7.1 exist, no internal link 404s, and the contact form delivers through
`app/api/contact/route.ts` with rate limiting behind it. Real project copy, covers,
credentials, timeline and portrait have landed; what is left is listed in
`docs/STUB-INVENTORY.md`.

Three things were carried past their phase and none of them blocks Phase 5: the section 5.5
invariant tests (Vitest is not installed), `ci.yml` (`.github/workflows/` is empty), and
applying section 10.2's `Reveal`/`Stagger` inventory — the wrappers exist but no real page
uses them. Section 10.4 says what to decide before that last one starts.

Every resource the owner supplies is a content change: the portrait, the resume, the
address, the email, a project, a credential. Editing `content/` or dropping a file into
`public/` is the whole procedure, and each row of that table was verified by doing it. Copy
and imagery are stubs under section 5.6 until the Phase 5 sweep; crawling is blocked by
`app/robots.ts` until Phase 6 flips `ALLOW_INDEXING`.

## Documentation

| Document | What it covers |
| --- | --- |
| [docs/PORTFOLIO_SPEC.md](docs/PORTFOLIO_SPEC.md) | Specification v2.1.5: stack, content model, design system, page specs, accessibility, testing, deployment, and a seven-phase delivery plan |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Append-only log of decisions that change the spec |
| [docs/STUB-INVENTORY.md](docs/STUB-INVENTORY.md) | Where every owner-supplied resource lives and what swapping it costs, plus every field currently holding a stub. Phase 5 is done when the second table is empty |

Start with section 18 (Delivery plan) for what to build next, and section 19 (Open
questions) for what still needs an answer.

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
pnpm typecheck    # tsc --noEmit
```

Those are the only two scripts `package.json` defines. `next build` works, but per
`AGENTS.md` this repo is in a local-only dev phase: iterate with `pnpm dev`, validate with
`pnpm typecheck`, and leave build, test and release checks for a real deployment
checkpoint. Appendix A of the spec lists the fuller command set as the target.

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
this repo, by design (section 16.3).
