# Portfolio

Personal portfolio website for Mukerem Shifa, AI Engineer & Full-Stack Developer.
Domain: [mukeremshifa.com](https://mukeremshifa.com)

Status: **Phase 0 — foundations.** Toolchain, configuration, and hosting are wired up. The
deployed page is a deliberate placeholder; design tokens and real content start in Phase 1.

## Documentation

| Document | What it covers |
| --- | --- |
| [docs/PORTFOLIO_SPEC.md](docs/PORTFOLIO_SPEC.md) | Specification v2.1: stack, content model, design system, page specs, accessibility, testing, deployment, and a seven-phase delivery plan |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Append-only log of decisions that change the spec |

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
pnpm check        # format:check + lint + typecheck
pnpm build        # production build
pnpm start        # serve the production build
```

Copy `.env.example` to `.env.local` if you need to override anything locally. Nothing in it
is required for `pnpm dev` to run.

## Deployment

Vercel builds every push through its GitHub integration. `main` deploys to production at
`mukeremshifa.com`; `dev` and pull requests get preview URLs. There is no deploy workflow in
this repo, by design (section 16.3).
