<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Working agreements for this repo

These sit outside the managed block above, which `next dev` rewrites in place — it
preserves everything before and after its markers, so this section survives.

## Git

Full reasoning in `docs/PORTFOLIO_SPEC.md` §16.1. The short version:

- Branch `feat/*` from `dev`. Never from `main`.
- `feat/*` → `dev` is a **rebase**. Delete the branch after.
- `dev` → `main` is **fast-forward only**. If it refuses to fast-forward, something
  diverged — stop and diagnose rather than forcing it or reaching for a merge commit.
- **Never squash a branch that outlives the merge.** Squashing is for short-lived
  branches you are about to delete. Squashing `dev` into `main` permanently severs
  their ancestry; the repo has already been repaired from exactly that once.
- `dev` and `main` are **never force-pushed**. Rewrite only on `feat/*`, pre-merge.
- Tag each phase completion on `dev` (`phase-0`, `phase-1`, …).

## Conventions worth not rediscovering

- **Line endings are LF**, enforced by `.gitattributes`. `core.autocrlf=true` on Windows
  checkouts would otherwise produce CRLF and fail `pnpm format:check` on every file
  while CI stays green, because CI runs on Linux.
- **Pin every dependency exactly.** No carets. Node 22.x and pnpm 10.29.3 are pinned in
  `.nvmrc`, `engines`, `packageManager`, and the Vercel project.
- **`docs/DECISIONS.md` gets an entry per meaningful deviation from the spec** — what it
  cost as well as what it bought. If a future reader would wonder whether something was
  a choice or an oversight, it belongs there.
- Markdown is excluded from Prettier via `.prettierignore`. The spec's tables are
  hand-aligned; do not reformat them.
- `eslint-plugin-jsx-a11y` is wired as **rules only**. `eslint-config-next` already
  registers the package; registering it again is a flat-config error.

## Active development gate

- This repo is in a local-only dev phase. Use `pnpm dev` for iteration and visual checks.
- Do not run build, start, test, deploy, or CI-style commands while actively iterating.
- Agents may only do the bare minimum needed to validate a change, such as `pnpm typecheck`.
- Full validation, tests, and release checks happen only at a real deployment checkpoint, not during day-to-day development.
