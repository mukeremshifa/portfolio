import { z } from "zod";

/**
 * The only place a content shape is declared (§5).
 *
 * Every TypeScript type in the app comes out of this file through `z.infer`. Nothing
 * hand-writes an interface that duplicates a schema — the interim `SiteIdentity` in
 * `lib/site.ts` was Phase 1's logged exception and Phase 2 deletes it.
 *
 * Read the `.default()` calls carefully. In Zod 4 a default makes the field optional on
 * *input* and required on *output*, so the inferred `Project` has `lessons: string[]`,
 * not `lessons?: string[]`. Consumers render `lessons.length ? … : null`, never
 * `lessons?.length`.
 */

/** §5.3, §5.4: `YYYY-MM`. */
const YearMonth = z.string().regex(/^\d{4}-\d{2}$/);

/** §5.3: `YYYY`. */
const Year = z.string().regex(/^\d{4}$/);

/**
 * §5.3 as amended for Phase 2. `next/image` needs intrinsic dimensions or `fill`, and
 * `images.unoptimized` does not change that — the reservation is a layout concern, not
 * an optimization one (§12.1). Static imports would supply them, but `src` arrives from
 * JSON as a string, so the author supplies them instead. See docs/DECISIONS.md.
 */
const ImageDimensions = {
  width: z.int().positive(),
  height: z.int().positive(),
};

/**
 * A same-origin asset path or an absolute URL.
 *
 * §5.2 originally typed `resume.url` as `z.url()`, which a root-relative path fails. The
 * only two ways to satisfy that were to host the file off-origin or to write
 * `https://mukeremshifa.com/...` into a content file — and the second hard-codes the
 * origin that `SITE_ORIGIN` exists to derive exactly once, so it would break on
 * localhost and emit a production URL from every preview (§16.4).
 *
 * `socials[].url` deliberately stays `z.url()`. Those destinations are genuinely
 * external, and a relative social link is always a mistake rather than a valid case this
 * union would be admitting.
 */
const AssetPathOrUrl = z.union([z.url(), z.string().regex(/^\/[^\s]*$/)]);

export const SiteSchema = z.object({
  name: z.string().min(1),
  wordmark: z.string().min(1).max(4),
  role: z.string().min(1),
  /**
   * The footer's one-line identity (§7.3): the role stated short enough to sit above
   * "based in {location.label}" without wrapping into a paragraph.
   *
   * A second field rather than a shortening of `role`, on `intro`/`bio`'s reasoning.
   * `role` is the hero's full positioning sentence — it names the work *and* what the
   * work is about — and cutting it to fit the footer would have rewritten the hero as a
   * side effect of editing the footer. Two registers, two consumers, two fields.
   */
  roleShort: z.string().min(1).max(60),
  eyebrow: z.string().min(1).max(60),
  headline: z.string().min(1).max(90),
  intro: z.string().min(80).max(400),
  /**
   * `/about/`'s opening passage: first person, and warmer than anything else on the site.
   *
   * **Separate from `intro` on purpose.** `intro` is the positioning paragraph, and three
   * things read it — the home hero, this page's old lead, and `personJsonLd`'s
   * `description`. Overloading it to carry a first-person greeting would have rewritten
   * the hero and the search snippet as a side effect of editing the About page. Two
   * fields, two registers, two audiences, and the hero moves on its own schedule.
   *
   * The 700 ceiling is higher than `intro`'s 400 because this one is the page rather than
   * a lead into it.
   */
  bio: z.string().min(80).max(700),
  email: z.email(),
  /**
   * Where, and only where. `remote` was deleted on 2026-08-31 with the footer rebuild
   * that stopped rendering it: the line it fed became one sentence with no room for a
   * "· Available remotely" clause, and a boolean nothing reads is a claim waiting to be
   * made accidentally by whoever gives it a consumer next. Working arrangements are
   * `availability`'s subject; this object answers "where are they".
   */
  location: z.object({
    label: z.string(),
  }),
  /**
   * §7.3's location says where. This says in what.
   *
   * `level` is a free string and optional rather than an enum, for the same reason
   * `SkillGroupSchema` carries no proficiency field (§1.5): a fixed ladder invites a
   * self-assessment nobody can check. A stated level is a claim the owner chose to make;
   * an absent one renders as the bare language name rather than as a gap in the row.
   */
  languages: z
    .array(
      z.object({
        name: z.string().min(1),
        level: z.string().min(1).optional(),
      }),
    )
    .min(1),
  availability: z.object({
    show: z.boolean(),
    state: z.enum(["available", "open", "unavailable"]),
    label: z.string().max(60),
  }),
  resume: z
    .object({
      url: AssetPathOrUrl,
      updated: YearMonth,
    })
    .optional(),
  /**
   * §8.1's `ProfileVisual`, which §5.2 never gave a source. Optional is the load-bearing
   * part: absence collapses the hero to one column, which is both what §8.1 asks for and
   * the state the owner reaches by deleting the field rather than by adding one.
   *
   * `alt` carries the same 10-character floor as §5.3's images. A portrait sitting beside
   * the owner's own name and role is arguably decorative under §11.4, which would want
   * `alt=""` — the schema will not allow it. The real photograph landed on 2026-08-31
   * with a describing `alt`, so the question is now live rather than hypothetical, and it
   * is still open. Do not weaken the floor to settle it; that is an §11.4 call.
   */
  portrait: z
    .object({
      src: z.string(),
      alt: z.string().min(10),
      ...ImageDimensions,
    })
    .optional(),
  /**
   * The 1:1 crop `/about/` renders in a circle.
   *
   * A second image field rather than a reuse of `portrait`, because `portrait` is 3:4 and
   * belongs to the hero — centre-cropping a 3:4 portrait to a circle is how a portrait
   * loses the top of its head. The two slots take two exports of the same photograph, and
   * as of 2026-08-31 they literally do: one studio headshot, cropped 720×960 and 360×360.
   *
   * Optional on exactly `portrait`'s terms: remove the field and the About header
   * collapses to one column rather than reserving space for something that is not there.
   * `alt` carries the same 10-character floor, for the same reason.
   */
  avatar: z
    .object({
      src: z.string(),
      alt: z.string().min(10),
      ...ImageDimensions,
    })
    .optional(),
  socials: z
    .array(
      z.object({
        platform: z.enum(["github", "linkedin", "email", "x", "other"]),
        label: z.string(),
        url: z.url(),
      }),
    )
    .min(2),
  /**
   * The personal accounts, shown in the footer by handle rather than by platform name.
   *
   * **Deliberately not more entries in `socials`.** `socials` is the professional pair
   * §7.3 names in the footer and §8.1/§8.7 put beside the email address in
   * `ContactChannels` — four more entries there would have landed seven links in the home
   * page's contact callout, a row that only reads as a row at three. These have one
   * consumer, `SiteFooter`, and adding a fifth platform is a content edit plus one line
   * in `BrandIcon`.
   *
   * They stay out of `personJsonLd`'s `sameAs` for the same reason they are separate: a
   * `wa.me` link identifies a phone number, not a profile, and `sameAs` is for pages that
   * establish identity.
   *
   * `handle` is rendered verbatim and is the only visible text — "@name" for the three
   * that have one, the number for WhatsApp — so the platform is carried by the icon plus
   * `label`, which is what the accessible name is built from (§7.4: never an icon
   * without a name).
   */
  handles: z
    .array(
      z.object({
        platform: z.enum(["x", "instagram", "whatsapp", "telegram"]),
        label: z.string().min(1),
        handle: z.string().min(1),
        url: z.url(),
      }),
    )
    .default([]),
  // No `featuredCaseStudySlug`. The home page's dedicated case-study section was removed
  // on 2026-08-31: every project page is written as a case study now, so promoting one of
  // them to a second home-page section restated a page the "Selected work" cards already
  // link to. §5.5 invariant 4 went with it — see docs/DECISIONS.md.
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

export const ProjectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  title: z.string().min(1).max(80),
  summary: z.string().min(60).max(200),
  category: z.enum(["AI/ML", "Full-Stack", "Systems"]),
  status: z.enum(["completed", "in-progress", "maintained"]),
  featured: z.boolean(),
  order: z.number().int(),
  year: z.object({
    start: Year,
    end: Year.nullable(),
  }),
  role: z.string().min(1),
  team: z.string().min(1),
  technologies: z.array(z.string()).min(3).max(12),
  links: z
    .object({
      github: z.url().optional(),
      live: z.url().optional(),
      docs: z.url().optional(),
    })
    .default({}),
  /**
   * Optional since 2026-08-31, which is what makes the brief project shape possible.
   *
   * Absence is invisible on `/projects`: `ProjectCard` renders a cover only in its
   * `featured` variant, so a standard card never had one to lose. What a coverless
   * project gives up is the hero image on its own page and `image` in its JSON-LD —
   * both acceptable for work that does not merit sourcing a picture, neither acceptable
   * for a featured project, which is why the three featured ones all carry one.
   */
  cover: z
    .object({
      src: z.string(),
      /**
       * The dark-theme rendition of the same capture, added 2026-09-01 when the real
       * covers arrived as light/dark pairs.
       *
       * **Optional, and `src` stays the canonical one.** Everything that needs a single
       * image — `personJsonLd`/`projectJsonLd`'s `image`, the OG card, any future feed —
       * keeps reading `src` and is untouched by this field. Only `<Figure>` knows the
       * pair exists. A cover with no dark rendition (a title card, a photograph) simply
       * omits it and renders the one image in both themes, which is the ConverseKit
       * title card's behaviour before this field existed.
       *
       * No second `alt` and no second `width`/`height`: the pair is one screenshot of one
       * screen in two palettes. Two alts would be two descriptions of the same thing that
       * drift apart, and two dimension sets would let them disagree — at which point the
       * reserved box is wrong for one of the themes.
       */
      srcDark: z.string().optional(),
      alt: z.string().min(10),
      ...ImageDimensions,
    })
    .optional(),
  overview: z.array(z.string()).min(1).max(3),
  /**
   * The merged section. `capabilities` — a 3-to-8 string array rendered as bullets
   * beside this — was folded in here, because "what it does" and "key features" were
   * two headings over one idea and the page asked the reader to spot a distinction the
   * author had not made. Bullets are now reserved for `lessons`, which is the one list
   * on the page whose items really are peers of each other and nothing more.
   */
  features: z
    .array(
      z.object({
        title: z.string(),
        body: z.string(),
      }),
    )
    .min(2)
    .max(8),
  lessons: z.array(z.string()).max(5).default([]),
  caseStudy: z
    .object({
      challenge: z.string(),
      decision: z.string(),
      outcome: z.string(),
    })
    .optional(),
  seo: z
    .object({
      title: z.string().max(60),
      description: z.string().max(160),
    })
    .optional(),
});

export const ExperienceSchema = z
  .object({
    id: z.string(),
    role: z.string(),
    organization: z.string(),
    organizationUrl: z.url().optional(),
    // No `"education"`. A degree is not a job, and while the value existed the timeline
    // was where degrees landed by default — §8.4 reads as a history of work, and a
    // qualification sitting in it is a category error the badge only labelled rather than
    // fixed. Education moved to `EducationSchema` and `/about/` on 2026-08-31; deleting
    // the enum member is what stops the next one drifting back here.
    type: z.enum(["employment", "freelance", "internship", "research", "independent"]),
    start: YearMonth,
    end: YearMonth.nullable(),
    location: z.string().optional(),
    summary: z.string().min(40).max(300),
    // §8.4 says "1 to 5 achievement bullets" and the floor is gone: 0 to 5, per
    // `docs/DECISIONS.md`. A `min(1)` does not make an entry say more, it makes the
    // entry find a sentence — and what it found was the summary again, one line down
    // and in the past tense. Two of the six entries had nothing under the summary that
    // the summary had not said, and now render without a list rather than with a
    // paraphrase of themselves.
    achievements: z.array(z.string()).max(5).default([]),
    technologies: z.array(z.string()).max(10).default([]),
    featured: z.boolean().default(false),
  })
  .refine((e) => e.end === null || e.end >= e.start, {
    message: "end must not precede start",
  });

/**
 * Formal qualifications, split out of `ExperienceSchema` on 2026-08-31.
 *
 * The shape is deliberately *not* an experience entry with different labels. An experience
 * entry has a `role` you performed and `achievements` you can be credited with; a degree
 * has a `credential` you were awarded and, at most, a couple of things worth noting about
 * how it went. Reusing the employment shape is what produced "role: Bachelor of Science"
 * in the first place.
 *
 * `highlights` caps at 3 and has no floor, because most qualifications have nothing to add
 * beyond the credential and the dates — and a schema that demands one bullet gets one
 * invented.
 */
export const EducationSchema = z
  .object({
    id: z.string(),
    credential: z.string(),
    institution: z.string(),
    institutionUrl: z.url().optional(),
    start: YearMonth,
    end: YearMonth.nullable(),
    location: z.string().optional(),
    note: z.string().min(40).max(300),
    highlights: z.array(z.string()).max(3).default([]),
  })
  .refine((e) => e.end === null || e.end >= e.start, {
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

export type Site = z.infer<typeof SiteSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type ExperienceEntry = z.infer<typeof ExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Certification = z.infer<typeof CertificationSchema>;
export type SkillGroup = z.infer<typeof SkillGroupSchema>;
export type FocusPillar = z.infer<typeof FocusPillarSchema>;

export type Category = Project["category"];

/**
 * The `Category` enum's runtime members, in schema order.
 *
 * §8.2's filter has to render an option per category rather than an option per category
 * that happens to have a project, so it needs the members themselves and not just the
 * ones present in `content/`. Read off the schema rather than written out beside it,
 * because a second list is a second place to add "Systems" to and only one of them would
 * fail a build.
 */
export const CATEGORIES = ProjectSchema.shape.category.options;
export type ProjectStatus = Project["status"];
export type CaseStudy = NonNullable<Project["caseStudy"]>;

/**
 * `CodeHighlight` and `ScreenshotGallery` are no longer reachable from any page.
 *
 * Both used to be `Project` fields. A project now carries one cover image and no code,
 * so the fields are gone from `ProjectSchema` — but the components were kept
 * deliberately, and a component with no type does not compile. These two schemas are
 * what they are typed against now.
 *
 * **They are not dead code by accident.** Deleting them deletes the components, which is
 * the opposite of the decision on record (see docs/DECISIONS.md, 2026-08-30). Anything
 * that wants a gallery or a snippet block again starts here rather than from scratch.
 */
export const CodeSnippetSchema = z.object({
  title: z.string(),
  // A plain label (§12.4). It feeds the `class="language-*"` hook and the filename chip;
  // nothing validates it against a highlighter's language list, because there is no
  // highlighter.
  language: z.string(),
  file: z.string().optional(),
  note: z.string().optional(),
  code: z.string().min(1),
});

export const ScreenshotSchema = z.object({
  src: z.string(),
  alt: z.string().min(10),
  caption: z.string().optional(),
  ...ImageDimensions,
});

export type CodeSnippet = z.infer<typeof CodeSnippetSchema>;
export type Screenshot = z.infer<typeof ScreenshotSchema>;

/**
 * §5.1 and §9.3 both name `ProjectRef` and §5.3 declares no schema for it, because it is
 * a derived view rather than stored content: prev/next navigation needs a URL and a
 * label and nothing else. Deriving it keeps it honest — if `Project["title"]` changes
 * type, this follows. See docs/DECISIONS.md.
 */
export type ProjectRef = Pick<Project, "slug" | "title">;
