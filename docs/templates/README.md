# Project templates

Copy one of these into `content/projects/`, rename it, and fill in every `REPLACE`.
**The filename must equal the `slug` field** (§5.5 invariant 2) — that is the one mistake
nothing catches for you until a URL is wrong.

These files live here rather than in `content/projects/` on purpose. The content loader
parses every `.json` in that directory, so a template sitting there would either fail the
build or render as a project.

## Which one

| | `project-full.json` | `project-brief.json` |
| --- | --- | --- |
| For | Work worth a full case study | Work too small to carry one |
| Featured | Eligible | **Never** — see below |
| Cover image | Yes | Omitted |
| Sections on its page | Overview, Key features, Lessons learned, Case study | Overview, Key features |
| `lessons`, `caseStudy`, `seo` | Present | Omitted entirely |

Both shapes are the **same schema**. A brief project is not a different kind of thing — it
is a project with the optional fields left out, and every omitted section simply does not
render. That is why there is no `kind` field to set and no second code path to maintain:
adding a `caseStudy` block to a brief project later promotes it, and deleting one demotes
it, with no migration in between.

**`featured: false` on brief projects is a convention, not a constraint.** Nothing stops
you featuring one. What stops it being a good idea is the home page: the featured card is
the only card that renders a cover, so featuring a coverless project puts a short paragraph
in a very wide empty box.

## Limits the loader enforces

A malformed file fails on first page load, naming every broken file and field at once.

| Field | Limit |
| --- | --- |
| `slug` | lowercase kebab, and equal to the filename |
| `title` | ≤ 80 characters |
| `summary` | 60–200 characters |
| `category` | exactly one of `AI/ML`, `Full-Stack`, `Systems` |
| `status` | `completed`, `in-progress`, or `maintained` |
| `year.start`, `year.end` | `"YYYY"` strings. `end` may be `null`; it may not be `""` |
| `technologies` | 3–12 |
| `overview` | 1–3 paragraphs |
| `features` | 2–8, each `{ title, body }` |
| `lessons` | ≤ 5 |
| `links.*` | absolute URLs. Omit the key entirely rather than passing `null` or `""` |
| `cover.alt` | ≥ 10 characters |
| `cover.width`, `.height` | true intrinsic pixels, both required when `cover` is present |

## Two rules nothing checks

- **At most three projects carry `featured: true`** (invariant 3). Over three, the home
  page silently drops the extras rather than failing.
- **Every string in `technologies` must also appear in `content/skills/skills.json`**
  (invariant 8). This is the one that drifts, because adding a technology to a project is
  a different act from adding it to the skills page.

## Assets

`cover.src` is a path under `public/`. A missing file does not fail the build — it renders
as a broken image, which is why this is worth checking by eye after adding one.
