# Swap matrix and stub inventory

Two tables. The first says where every resource the owner supplies lives and what changing
it costs. The second says which of those resources is currently a stub and what the real
value will be.

They live in one file because they are two views of the same list: every inventory row is a
swap-matrix row whose current value happens to be synthetic. When the inventory is empty,
the matrix is entirely real.

**Keep this current as content changes, not afterwards.** Written afterwards it will be
wrong, and the Phase 5 sweep inherits a search problem instead of a checklist. Phase 5's
§5.6 exit criterion is "the inventory below is empty," which is checkable; "grep for the
word placeholder" stopped working the moment the stubs started looking realistic.

---

## The swap matrix

Every resource the owner supplies, where it lives, and what swapping it costs. Nothing in
this table requires touching a component. If a row ever would, that is a defect in the
component, not a limitation of the content model.

| Resource | Lives in | Swapping it means |
| --- | --- | --- |
| Name, role, headline, eyebrow, intro | `content/site.json` | Edit values |
| Location | `site.location` | Edit `label`; the footer, the OG card, and the `Person` `address` follow. `remote: true` is separately what adds "· Available remotely" to the footer — it is not part of the availability badge |
| Contact email | `site.email` | Edit one value; footer, contact page, callout, and JSON-LD follow |
| Social links | `site.socials[]` | Edit the array; footer, hero, contact page, and `sameAs` follow |
| Availability badge | `site.availability` | `show: false` and the **hero** badge disappears. Nothing else reads this object — the footer's "· Available remotely" is `location.remote` — so going quiet site-wide means both fields, not this one |
| Portrait | `site.portrait` + a file in `public/` | Replace the file and its `src`/dimensions. **Remove the field** and the hero collapses to one column |
| Résumé | `site.resume` + a file in `public/` | Replace the PDF, bump `updated`. **Remove the field** and both CTAs disappear |
| A project | `content/projects/<slug>.json` | Add or delete one file. Index, filter counts, home grid, adjacency, sitemap, and the OG card all follow. Copy a starting point from `docs/templates/` — full or brief |
| Whether a project has a cover | `cover`, optional since 2026-08-31 | Remove the field and the project's page opens straight into Overview. Invisible on `/projects`: only the featured card renders a cover |
| Which projects are featured | `featured` flags | Edit booleans, honouring §5.5 invariant 3 |
| Experience | `content/experience/timeline.json` | Edit the array |
| Certifications | `content/certifications/certifications.json` | Edit the array; expiry and verify-link states follow |
| Skills, focus pillars | `content/skills/skills.json`, `content/focus/focus.json` | Edit arrays, honouring invariants 6 and 8 |
| Contact form delivery | `site.contact.endpoint` | Absent in Phase 3, present in Phase 4. The page shape does not change either way |

Each row was verified by performing it: change the value, rebuild, confirm the site follows,
confirm `git status` shows changes only under `content/` or `public/`, revert. See the Phase
3 verification notes in `DECISIONS.md`.

---

## The stub inventory

Everything below is synthetic. It is structurally realistic on purpose — right lengths,
right shapes, right kinds — because the design cannot be judged through content that does
not behave like content. The cost of that decision is that these stubs are hard to spot by
eye, which is exactly why they are listed here instead.

### Phase 5 supplies these

| Field | Current stub | What replaces it |
| --- | --- | --- |
| `site.email` | `hello@mukeremshifa.com` | **The address is settled** (§19 Q1, answered 2026-08-30) — `site.json` already holds the value that ships, so this row is not waiting on an edit. What is still a stub is the *mailbox*: nothing receives mail at that address yet. It closes when Cloudflare Email Routing forwards it to a real inbox, and until then the site prints a contact address that silently drops mail, which is worse than a Gmail address |
| `site.portrait` | `/placeholders/placeholder-portrait-4x5.svg`, 1000×1250 | A real photograph at 4:5, or the field is deleted and the hero collapses to one column. Its `alt` may want to become `alt=""` under §11.4; the schema's `min(10)` forbids that, and Phase 5 decides rather than weakening the schema for a placeholder |
| `site.resume` | `/placeholders/placeholder-resume.pdf`, `updated: 2026-07` | The real PDF, with `updated` bumped. §19 Q4 chooses `public/` or R2; the field takes either a root-relative path or an absolute URL |
| ~~`content/projects/*.json`~~ | **Closed 2026-08-31.** All six synthetic projects were deleted. The four real ones — `conversekit-ai-chatbot`, `synapsedeck-ai-flashcards`, `gamified-servey-prototype`, `multitenant-lms-platform` — are the owner's own copy. Their *prose* is real; their assets and links are not, see the two rows below |
| Project `links.*` hosts | The four real projects' own `github.com/mukeremshifa/…` and `<slug>.mukeremshifa.com` URLs | **Unverified, not synthetic.** These now name repositories and deployments the owner believes exist, which is a different risk from the stub era: a wrong URL here is a broken promise rather than an obvious placeholder. Every one needs opening by hand once. Nothing catches a 404 — `tests/unit/links.test.ts` was planned and never written |
| `cover.src` (all four) | Paths naming files that **do not exist**: `/projects/conversekit-cover-16x9.svg`, `/projects/synapsedeck-cover-16x9.png`, `/placeholders/gamified-servey-project-cover-16x9.svg`, `/placeholders/bb-lms-cover-16x9.svg` | The real captures, at the intrinsic dimensions each file declares. This is worse than the placeholder era it replaced: a stub `src` resolved to a visible grey box, and these resolve to nothing. `next/image` does not fail the build over a missing file — it renders a broken image. Alternatively delete `cover` entirely, which is now legal and renders a shorter page rather than a broken one |

### Already real, listed so nobody re-stubs them

| Field | Value |
| --- | --- |
| `site.name`, `site.wordmark`, `site.role` | Confirmed by the owner |
| The canonical origin | `https://mukeremshifa.com`, resolved 2026-08-15 (§13.3) |
| `site.location` | `Ras al-Khaimah, UAE`, `remote: true`. Confirmed by the owner 2026-08-30. It was changed from `Addis Ababa, Ethiopia` earlier the same day in `b4d5d05`, a commit titled "Refactor code structure for improved readability and maintainability" — a content change carried inside a refactor, which is how this file was still naming the old value hours later |
| `site.socials[].url` | `github.com/mukeremshifa` — confirmed by this repo's own `origin` remote, not by the owner. `linkedin.com/in/mukeremshifa` — confirmed by the owner 2026-08-30 |
| `site.eyebrow`, `site.headline`, `site.intro`, `site.seo`, `site.contact` | Rewritten 2026-08-31 from the real project set and timeline. The headline names multi-tenancy and embedded AI because that is what three of the four full projects actually are; the intro cites the chat platform, the LMS and the flashcard tool by their behaviour rather than by name. Owner should read it aloud once: it is the only copy on the site that has to sound like them, and it was drafted rather than dictated |
| `content/experience/timeline.json` | Replaced 2026-08-31 with the owner's six real entries. Organisations, dates, locations and descriptions are theirs; the `type` assignments and `featured` flags are the draft's and want checking. **No education entry**: the stub set carried a BSc that was invented, and nothing was supplied to replace it, so the timeline currently shows roles without the degree they sit alongside |
| `content/certifications/certifications.json` | Replaced 2026-08-31 with the owner's eleven real credentials. Titles, issuers, dates, credential IDs and verify URLs are theirs. **The `skills` arrays are not, on four of them**: the schema requires two to four, and HCIA-Security, Formal Languages, Operating Systems and Advanced Algorithms arrived with none, so the draft derived two apiece from each credential's own title. Those eight strings are the only unverified claims in the file |
| `content/skills/skills.json` | Rewritten 2026-08-31 from the seven real project files. Eight groups, 43 items, and **every item is used by a project** — the stub era's Go, Kubernetes, Terraform, OpenTelemetry, Grafana, Redis, SQLite, FastAPI and pgvector are all gone, none having appeared in any project. Invariant 8 closes both ways: nothing in a project is missing from a group, nothing in a group is unused |
| `content/focus/focus.json` | Rewritten 2026-08-31. Three pillars derived from what the projects actually show — multi-tenancy with access control, grounded and swappable LLM features, edge-first delivery — replacing three written before any real project existed. Owner should confirm these are the three they want to be known for; the evidence supports them, but the choice of emphasis is not the code's to make |
| `site.availability` | Resolved 2026-08-30: `show: false`, so no badge ships and the site makes no claim about looking for work. `state` and `label` still hold their Phase 3 stub strings and are **inert while `show` is false** — turning the badge back on means writing them fresh, not trusting what is sitting there |

---

## The half a machine can check

**None of it, currently.** This section described `tests/unit/stubs.test.ts` — asserting that
every image `src` in `content/` still points under `/placeholders/`, so that landing a real
asset fails the test and reminds someone to update this file. That test does not exist. There
is no `tests/` directory and no test runner in `package.json`; §15 was never built.

Recorded rather than deleted because the design was right and the gap is worth seeing: the
one automated reminder this file was promised is missing at exactly the phase that needs it.
The image paths are the easy half to check and nothing checks them.

So the whole check is human, against the tables above — not just the copy half. No test can
tell a good stub sentence from a real one, which was always the cost of writing stubs that
look real; the new part is that nothing catches the image paths either.
