# Portfolio

Personal portfolio website for Mukerem Shifa, AI Engineer & Full-Stack Developer.
Domain: [mukeremshifa.com](https://mukeremshifa.com)

Status: **Phase 3 — every page built.** All seven routes in section 7.1 exist and no
internal link 404s. They are built against an expanded stub content set, so every layout is
exercised at the lengths and in the combinations real content will have, and the design can
be reviewed end to end before any of it is written.

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
pnpm build        # production build
pnpm start        # serve the production build
```

Copy `.env.example` to `.env.local` if you need to override anything locally. Nothing in it
is required for `pnpm dev` to run.

## Deployment

Vercel builds every push through its GitHub integration. `main` deploys to production at
`mukeremshifa.com`; `dev` and pull requests get preview URLs. There is no deploy workflow in
this repo, by design (section 16.3).
