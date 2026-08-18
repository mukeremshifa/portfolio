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
| Location | `site.location` | Edit values; the footer and the `Person` `address` follow |
| Contact email | `site.email` | Edit one value; footer, contact page, callout, and JSON-LD follow |
| Social links | `site.socials[]` | Edit the array; footer, hero, contact page, and `sameAs` follow |
| Availability badge | `site.availability` | `show: false` and it disappears everywhere |
| Portrait | `site.portrait` + a file in `public/` | Replace the file and its `src`/dimensions. **Remove the field** and the hero collapses to one column |
| Résumé | `site.resume` + a file in `public/` | Replace the PDF, bump `updated`. **Remove the field** and both CTAs disappear |
| A project | `content/projects/<slug>.json` | Add or delete one file. Index, filter counts, home grid, adjacency, sitemap, and the OG card all follow |
| Which projects are featured | `featured` flags | Edit booleans, honouring §5.5 invariant 3 |
| The featured case study | `site.featuredCaseStudySlug` | Edit one string |
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
| `site.eyebrow`, `site.headline`, `site.intro` | Synthetic positioning copy at the right lengths | Final hero copy against §1.5 |
| `site.email` | `hello@mukeremshifa.com` | The real mailbox (§19 Q1). **Plausible is not working**: nothing here should be read as evidence that this address exists |
| `site.location.label` | `Addis Ababa, Ethiopia` | The real location. This is the one stub that asserts something about a real person, so it is the one to check first |
| `site.socials[].url` | `github.com/mukeremshifa`, `linkedin.com/in/mukeremshifa` | The real profile URLs. Same caveat as the email: the handles are plausible, not confirmed |
| `site.availability.label`, `.state` | "Open to engineering roles and selected contract work" | Whatever is true at launch, or `show: false` |
| `site.seo.title`, `site.seo.description` | Synthetic, at the schema lengths | Final metadata copy |
| `site.contact.headline`, `.body` | Synthetic contact copy | Final contact copy |
| `site.portrait` | `/placeholders/placeholder-portrait-4x5.svg`, 1000×1250 | A real photograph at 4:5, or the field is deleted and the hero collapses to one column. Its `alt` may want to become `alt=""` under §11.4; the schema's `min(10)` forbids that, and Phase 5 decides rather than weakening the schema for a placeholder |
| `site.resume` | `/placeholders/placeholder-resume.pdf`, `updated: 2026-07` | The real PDF, with `updated` bumped. §19 Q4 chooses `public/` or R2; the field takes either a root-relative path or an absolute URL |
| `content/projects/*.json` (all six) | Six synthetic projects covering both featured and unfeatured, all three categories, and every optional-field combination | The three real projects (§19 Q3). Deleting a stub file is a complete removal; nothing references a slug from a component |
| Project `links.*` hosts | `github.com/mukeremshifa/…`, `<slug>.mukeremshifa.com`, `docs.mukeremshifa.com/…` | Real destinations. **None of these resolve today.** They deliberately sit off the apex: an absolute URL on `mukeremshifa.com` itself is an internal link wearing an external costume, and two of them shipped as 404s before `tests/unit/links.test.ts` existed |
| `cover.src` and `screenshots[].src` (all) | `/placeholders/*.svg` | Real captures in `public/images/`, with their true intrinsic dimensions |
| `content/experience/timeline.json` | Six synthetic entries covering all six `type` values, invented organisations, `example.com` links | The real history. Organisation names are deliberately invented rather than real institutions, so no entry reads as a claim about a real employer |
| `content/certifications/certifications.json` | Five synthetic credentials, invented issuers, `example.com` verify links | Real credentials, or an empty array |
| `content/skills/skills.json`, `content/focus/focus.json` | Plausible but unconfirmed groupings | Confirmed by the owner |

### Already real, listed so nobody re-stubs them

| Field | Value |
| --- | --- |
| `site.name`, `site.wordmark`, `site.role` | Confirmed by the owner |
| The canonical origin | `https://mukeremshifa.com`, resolved 2026-08-15 (§13.3) |

---

## The half a machine can check

`tests/unit/stubs.test.ts` asserts that **every image `src` in `content/` still points under
`/placeholders/`**. When a real asset lands that test fails, which is the reminder that this
file needs updating. It is deliberately an assertion about the current state rather than a
gate: the failure is the signal, and the fix is to update both the content and this table.

The copy half stays a human check against the tables above. No test can tell a good stub
sentence from a real one, which is the whole cost of writing stubs that look real.
