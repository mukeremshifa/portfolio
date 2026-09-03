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
| The About page passage | `site.bio` | Edit one value. **Not `site.intro`** — that one is the home hero and the `Person` `description`, and the two are deliberately different registers |
| Languages | `site.languages[]` | Edit the array; the About page row and the `Person` `knowsLanguage` follow. `level` is optional per entry and renders as absence |
| Location | `site.location` | Edit `label`; the footer, the OG card, and the `Person` `address` follow. `label` is the whole object — `remote` was deleted 2026-08-31 with the footer line that rendered it |
| Contact email | `site.email` | Edit one value; footer, contact page, callout, and JSON-LD follow |
| Social links | `site.socials[]` | Edit the array; the footer's third link column, the contact page, and `sameAs` follow. No longer the hero — those links moved out 2026-08-31 |
| Personal handles | `site.handles[]` | Edit the array; the footer's icon row follows, and nothing else does. A new `platform` also needs its name adding to `BrandIcon`. **Deliberately not `socials`** — these stay out of the contact page and out of `sameAs` |
| Availability badge | `site.availability` | `show: false` and the **hero** badge disappears. That is now the whole switch: the footer's separately-flagged "· Available remotely" was deleted with `location.remote` on 2026-08-31, so going quiet site-wide is this one field |
| Portrait | `site.portrait` + a file in `public/` | Replace the file and its `src`/dimensions. **Remove the field** and the hero collapses to one column |
| Avatar | `site.avatar` + a file in `public/` | Replace the file and its `src`/dimensions. **Remove the field** and the About header collapses to one column. Separate from `portrait` because this one is 1:1 and rendered in a circle |
| Résumé | `site.resume` + a file in `public/` | Replace the PDF, bump `updated`. **Remove the field** and both CTAs disappear |
| A project | `content/projects/<slug>.json` | Add or delete one file. Index, filter counts, home grid, adjacency, sitemap, and the OG card all follow. Copy a starting point from `docs/templates/` — full or brief |
| Contact mail delivery | `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` in Vercel | Environment variables, not content. Unset means the form renders and validates but every submit answers 502 and shows the direct `mailto:` — §8.7's failure path, which still reaches a person. Setting them is what makes the form deliver. **Verified working end to end 2026-09-01** |
| Contact rate limiting | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` in Vercel | Environment variables. Unset means rate limiting is **off** and the route logs one warning per cold start; the limiter fails open by design, so an Upstash outage degrades to no limiting rather than to a form that refuses real messages. See `lib/rate-limit.ts` and `DECISIONS.md` |
| Whether a project has a cover | `cover`, optional since 2026-08-31 | Remove the field and the project's page opens straight into Overview. Invisible on `/projects`: only the featured card renders a cover |
| Which projects are featured | `featured` flags | Edit booleans, honouring §5.5 invariant 3 |
| Experience | `content/experience/timeline.json` | Edit the array |
| Education | `content/education/education.json` | Edit the array. Split out of the timeline on 2026-08-31; `ExperienceSchema` no longer accepts `type: "education"` |
| Certifications | `content/certifications/certifications.json` | Edit the array; expiry and verify-link states follow |
| Skills, focus pillars | `content/skills/skills.json`, `content/focus/focus.json` | Edit arrays, honouring invariants 6 and 8 |
| Contact form delivery | `site.contact.endpoint` | `/api/contact` since 2026-09-01. The page shape does not change whether it is set or not — with no endpoint the direct channels are the whole page, which is §8.7's specified degraded path and was verified in both directions. **This field is the only switch**: `NEXT_PUBLIC_CONTACT_ENDPOINT` was deleted from `.env.example` the same day, see `DECISIONS.md` |

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
| ~~`site.email`~~ | **Closed 2026-09-01.** `hello@mukeremshifa.com` | The address was settled 2026-08-30 (§19 Q1); what remained was the *mailbox*, and the owner confirmed on 2026-09-01 that Cloudflare Email Routing now forwards it to their real inbox. **The `mailto:` on the contact page, the footer and the callout all reach a person today** — the "silently drops mail" risk this row tracked is gone. Note this covers **inbound only**: outbound, the Worker sending a form submission, is Resend and lands in Phase 4b |
| ~~`site.portrait`~~ | **Closed 2026-08-31.** `/images/portrait-3x4.jpeg`, 720×960 — a real studio headshot supplied by the owner. Note the ratio: **3:4, not the 4:5 this row and §5.2 assumed**, at the owner's instruction. The open question this row raised survives the swap: the `alt` is descriptive today, but a portrait beside the owner's own name and role is arguably decorative under §11.4 and would want `alt=""`, which the schema's `min(10)` still forbids. That is an §11.4 decision, not a schema one |
| ~~`site.avatar`~~ | **Closed 2026-08-31.** `/images/avatar-1x1.jpeg`, 360×360. The "two exports of one photograph" this row predicted is exactly what arrived: the same studio headshot, cropped square with the headroom a circular frame needs and the 3:4 export does not have |
| ~~`site.resume`~~ | **Closed 2026-09-01.** `/Mukerem-Shifa-Resume.pdf`, `updated: 2026-08`. §19 Q4 resolved to `public/` rather than R2 — one origin, no second thing to keep in sync for a 110 KB file. The URL is deliberately **undated**: a dated filename breaks every link, QR code and emailed copy already in circulation on each revision, and the date is already rendered from `updated`. Revising the résumé means overwriting this path, not adding a sibling |
| ~~`content/projects/*.json`~~ | **Closed 2026-08-31, amended 2026-09-01.** All six synthetic projects were deleted. **There are now seven real ones, not the four this row first named:** `conversekit-ai-chatbot`, `synapsedeck-ai-flashcards`, `gamified-survey-prototype` and `multitenant-lms-platform`, plus `amteclinks-website-seo`, `java-shopping-cart` and `little-lemon-capstone`. All seven are the owner's own copy. Their *prose* is real; their assets and links are not, see the rows below. Note the slug is `gamified-survey-prototype` — this file and the export table below both misspelled it `servey` |
| Project `links.*` hosts | All seven projects' own `github.com/mukeremshifa/…` and `<slug>.mukeremshifa.com` URLs | **Owner verifying by hand, 2026-09-04.** These name repositories and deployments the owner believes exist, which is a different risk from the stub era: a wrong URL here is a broken promise rather than an obvious placeholder. The survey project's repo was renamed on GitHub and its URL corrected here the same day (`gamified-servey-project` → `gamified-survey-project`). Nothing catches a 404 — `tests/unit/links.test.ts` existed and was deleted by `b4d5d05`; it is recoverable at `b4d5d05^` |
| `cover.src` — the other three | `amteclinks-website-seo`, `java-shopping-cart` and `little-lemon-capstone` have **no `cover` at all**. That renders correctly — `cover` became optional on 2026-08-31 and the card falls back — so nothing is broken and nothing flags it either. Decide per project whether it gets a render or stays coverless; a deliberate no is a valid answer, an unnoticed no is not. If they get one, `scripts/build_covers.py` is the path and the pair must be light **and** dark |
| ~~Project screenshots~~ | **Closed 2026-09-04.** No project carries a `screenshots` array, and none will in v1 | **Nothing.** The owner decided v1 ships without screenshots. Note the field is not merely unpopulated — it was removed from `ProjectSchema` on 2026-08-30, and `ScreenshotSchema` / `ScreenshotGallery` are retained deliberately as the starting point if a project ever earns a gallery. The six screenshot SVGs in `public/placeholders/` are consumed only by `app/dev/primitives/`. See `DECISIONS.md`, 2026-09-04 |
| ~~`cover.src` — the four featured~~ | **Closed 2026-09-01.** All four are real, and all four are light/dark pairs at 2400×1350: `<slug>-cover-16x9-{light,dark}.avif` under `/images/projects/`. The three broken paths this row tracked are gone, and ConverseKit's 1577×887 title card was replaced by a product render at the full export size, which also closes the softness noted in the export table below. Sources were 8K PNGs (~28 MB); `scripts/build_covers.py` produces the committed 515 KB. `cover.srcDark` is the schema field that carries the pair — see `DECISIONS.md`, 2026-09-01 |

### Already real, listed so nobody re-stubs them

| Field | Value |
| --- | --- |
| `site.name`, `site.wordmark`, `site.role` | Confirmed by the owner |
| `site.roleShort` | Dictated by the owner 2026-08-31 for the footer. Note it says "Full-stack" where `site.role` and `site.seo.title` say "Full-Stack"; both spellings are as supplied |
| `site.handles[]` | The four usernames and the WhatsApp number were dictated by the owner 2026-08-31. The URLs are derived from them (`x.com/`, `instagram.com/`, `wa.me/`, `t.me/`) and have not been opened — check them once before launch |
| The canonical origin | `https://mukeremshifa.com`, resolved 2026-08-15 (§13.3) |
| `site.location` | `Ras al-Khaimah, UAE`. Confirmed by the owner 2026-08-30. It was changed from `Addis Ababa, Ethiopia` earlier the same day in `b4d5d05`, a commit titled "Refactor code structure for improved readability and maintainability" — a content change carried inside a refactor, which is how this file was still naming the old value hours later |
| `site.socials[].url` | `github.com/mukeremshifa` — confirmed by this repo's own `origin` remote, not by the owner. `linkedin.com/in/mukeremshifa` — confirmed by the owner 2026-08-30 |
| `site.eyebrow`, `site.headline`, `site.intro`, `site.seo`, `site.contact` | Rewritten 2026-08-31 from the real project set and timeline. The headline names multi-tenancy and embedded AI because that is what three of the four full projects actually are; the intro cites the chat platform, the LMS and the flashcard tool by their behaviour rather than by name. Owner should read it aloud once: it is the only copy on the site that has to sound like them, and it was drafted rather than dictated |
| `content/experience/timeline.json` | Replaced 2026-08-31 with the owner's real entries, now six after the two education entries left. Organisations, dates, locations and descriptions are theirs; the `type` assignments and `featured` flags are the draft's and want checking. The 31% completion-rate figure on the RAK entry is the owner's, from their CV (confirmed 2026-08-31) |
| `content/education/education.json` | Created 2026-08-31 from the two entries that were sitting in the timeline under `type: "education"`. Credentials, institutions, dates and the 93.1 percent grade are the owner's. The `note` on each is **drafted, not dictated** — same standing as the `site.intro` row above, and worth reading aloud once |
| `site.bio` | Supplied verbatim by the owner 2026-08-31, including the 31% figure. The only copy on the site written in first person and the only place the owner's own voice is unmediated — do not edit it for register consistency with anything else |
| `site.languages` | English, Amharic, Arabic, supplied by the owner 2026-08-31. **Only Arabic's level was given** ("conversational"); *Fluent* for English and *Native* for Amharic were proposed by the draft and accepted, which makes them confirmed rather than checked. If either is wrong it is a claim about the owner in their own voice, so it is worth a second look |
| `content/certifications/certifications.json` | Replaced 2026-08-31 with the owner's eleven real credentials. Titles, issuers, dates, credential IDs and verify URLs are theirs. **The `skills` arrays are not, on four of them**: the schema requires two to four, and HCIA-Security, Formal Languages, Operating Systems and Advanced Algorithms arrived with none, so the draft derived two apiece from each credential's own title. Those eight strings are the only unverified claims in the file |
| `content/skills/skills.json` | Rewritten 2026-08-31 from the seven real project files. Eight groups, 43 items, and **every item is used by a project** — the stub era's Go, Kubernetes, Terraform, OpenTelemetry, Grafana, Redis, SQLite, FastAPI and pgvector are all gone, none having appeared in any project. Invariant 8 closes both ways: nothing in a project is missing from a group, nothing in a group is unused |
| `content/focus/focus.json` | **Supplied by the owner 2026-08-31**, replacing the three pillars the draft had derived from the project files. Titles and bodies are theirs: System Design, AI Integration, Full-Stack Development. One edit was made to fit the schema — `AI Integration`'s body arrived at 273 characters against a 260 ceiling, and "connecting applications to 11+ AI providers" lost the redundant "applications" to land at exactly 260. The `technologies` arrays are still the draft's, drawn from `skills.json` so invariant 8 holds; the owner should confirm those six-item lists say what they want said. Amazon Bedrock, LangChain and Next.js appear in the prose but not in any tag row — see `DECISIONS.md` |
| `site.availability` | Resolved 2026-08-30: `show: false`, so no badge ships and the site makes no claim about looking for work. `state` and `label` still hold their Phase 3 stub strings and are **inert while `show` is false** — turning the badge back on means writing them fresh, not trusting what is sitting there |

---

## Where real assets go, and what to call them

`public/images/`, per §4's repo layout and §12.2. It is not a new invention and it is not a
choice: the spec has named it since v2.0 and it simply had no files yet. Created empty
2026-08-31 with `.gitkeep`, because the naming question came up before the first file did.

```
public/images/
├── portrait-3x4.jpeg                           # site.portrait  — home hero
├── avatar-1x1.jpeg                             # site.avatar    — /about
└── projects/
    └── <slug>-cover-16x9-{light,dark}.avif     # project cover.src / cover.srcDark
```

**The naming rule is `<subject>-<ratio>.<ext>`, and it already exists** — it is what
`public/placeholders/` uses (`placeholder-portrait-4x5.svg`,
`placeholder-project-cover-16x9.svg`). A real asset is the same name with the
`placeholder-` prefix dropped, so a swap reads as a swap in `git log` rather than as an
unrelated new file.

`<slug>` **must be the project's JSON filename, character for character.** This is the one
part worth being pedantic about: the existing `cover.src` values include
`gamified-survey-prototype-cover-16x9.svg` for a project whose slug is
`gamified-survey-prototype` — a misspelling and a different noun. Deriving the filename from
the slug makes that class of mistake impossible to make quietly.

### Export sizes

`next.config.ts` sets `images: { unoptimized: true }` (§12.2), which means **the file
committed is the file every visitor downloads**. Nothing resizes it, nothing converts it to
WebP, and there is no responsive `srcset`. So the export size is a real decision and not a
detail to leave to the camera. Roughly 2× the largest rendered size:

| Asset | Rendered at | Export | Why that number |
| --- | --- | --- | --- |
| `portrait-3x4` | ≤360px wide (`lg:max-w-90`, `components/home/Hero.tsx`) | **720×960** | 2× the hero cap. This is what shipped |
| `avatar-1x1` | ≤160px (`md:size-40`, `components/about/ProfileHeader.tsx`) | **320×320** | 2× the larger circle. 360×360 shipped, which is fine — over is cheap here, under is not |
| `<slug>-cover-16x9` | ≤1200px (`sizes="(min-width: 1200px) 1200px, 100vw"`, inert under `unoptimized`) | **2400×1350** | 2× the content container. All four shipped at exactly this on 2026-09-01, as AVIF q65 4:4:4 — ~53–82 KB each. ConverseKit's earlier 1577×887 title card, noted here as slightly soft at 2×, was replaced rather than kept |

**AVIF for UI renders, JPEG or WebP for photographs, never PNG.** PNG is lossless and a photograph at these
dimensions runs to several megabytes with no optimizer downstream to catch it. PNG stays
correct for the generated brand marks in `public/brand/`, which are flat-colour.

Whatever the export actually measures goes in `width`/`height` in `content/`. Those are
intrinsic pixels and they are required (§5.3) — they reserve layout space before the file
arrives, and a wrong pair shifts the page rather than failing a build.

### OG images are generated, not supplied

`public/og/` appears in §4's layout and **should stay empty**. Both OG cards are rendered at
build time by `next/og` — `app/opengraph-image.tsx` for the site and
`app/projects/[slug]/opengraph-image.tsx` per project — from title, category, and year. That
is deliberate and load-bearing: it is what makes §1.3's "adding a project requires only
adding a JSON file" true of the social card too.

So a hand-made OG image for one project is a deviation, not a drop-in. It needs a schema
field, a branch in the route, and it leaves the other projects on generated cards. Before
adding one, check the aspect ratio: OG wants 1200×630 (1.91:1) and a cover wants 16:9, so an
image that measures 16:9 is a cover that was described as an OG.

---

## The half a machine can check

**None of it, currently.** This section described `tests/unit/stubs.test.ts` — asserting that
every image `src` in `content/` still points under `/placeholders/`, so that landing a real
asset fails the test and reminds someone to update this file. That test **was written and
then deleted**: `b4d5d05` removed all six files under `tests/unit/` — `stubs.test.ts` among
them — along with `vitest.config.mts` and the `test:unit` script, under the title
"Refactor code structure for improved readability and maintainability". There is no
`tests/` directory and no test runner in `package.json` today, but the suite is recoverable
at `b4d5d05^` rather than needing to be written from scratch. See `DECISIONS.md`,
2026-09-04.

Recorded rather than deleted because the design was right and the gap is worth seeing: the
one automated reminder this file was promised is missing at exactly the phase that needs it.
The image paths are the easy half to check and nothing checks them.

So the whole check is human, against the tables above — not just the copy half. No test can
tell a good stub sentence from a real one, which was always the cost of writing stubs that
look real; the new part is that nothing catches the image paths either.
