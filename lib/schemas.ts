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

export const SiteSchema = z.object({
  name: z.string().min(1),
  wordmark: z.string().min(1).max(4),
  role: z.string().min(1),
  eyebrow: z.string().min(1).max(60),
  headline: z.string().min(1).max(90),
  intro: z.string().min(80).max(400),
  email: z.email(),
  location: z.object({
    label: z.string(),
    remote: z.boolean(),
  }),
  availability: z.object({
    show: z.boolean(),
    state: z.enum(["available", "open", "unavailable"]),
    label: z.string().max(60),
  }),
  resume: z
    .object({
      url: z.url(),
      updated: YearMonth,
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
  featuredCaseStudySlug: z.string(),
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
  cover: z.object({
    src: z.string(),
    alt: z.string().min(10),
    ...ImageDimensions,
  }),
  overview: z.array(z.string()).min(1).max(3),
  capabilities: z.array(z.string()).min(3).max(8),
  features: z
    .array(
      z.object({
        title: z.string(),
        body: z.string(),
      }),
    )
    .min(2)
    .max(8),
  codeSnippets: z
    .array(
      z.object({
        title: z.string(),
        // A plain label (§12.4). It feeds the `class="language-*"` hook and the
        // filename chip; nothing validates it against a highlighter's language list,
        // because there is no highlighter.
        language: z.string(),
        file: z.string().optional(),
        note: z.string().optional(),
        code: z.string().min(1),
      }),
    )
    .max(4)
    .default([]),
  screenshots: z
    .array(
      z.object({
        src: z.string(),
        alt: z.string().min(10),
        caption: z.string().optional(),
        ...ImageDimensions,
      }),
    )
    .max(8)
    .default([]),
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
    type: z.enum([
      "employment",
      "freelance",
      "internship",
      "research",
      "education",
      "independent",
    ]),
    start: YearMonth,
    end: YearMonth.nullable(),
    location: z.string().optional(),
    summary: z.string().min(40).max(300),
    achievements: z.array(z.string()).min(1).max(5),
    technologies: z.array(z.string()).max(10).default([]),
    featured: z.boolean().default(false),
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
export type Certification = z.infer<typeof CertificationSchema>;
export type SkillGroup = z.infer<typeof SkillGroupSchema>;
export type FocusPillar = z.infer<typeof FocusPillarSchema>;

export type Category = Project["category"];
export type ProjectStatus = Project["status"];
export type CodeSnippet = Project["codeSnippets"][number];
export type Screenshot = Project["screenshots"][number];
export type CaseStudy = NonNullable<Project["caseStudy"]>;

/**
 * §5.1 and §9.3 both name `ProjectRef` and §5.3 declares no schema for it, because it is
 * a derived view rather than stored content: prev/next navigation needs a URL and a
 * label and nothing else. Deriving it keeps it honest — if `Project["title"]` changes
 * type, this follows. See docs/DECISIONS.md.
 */
export type ProjectRef = Pick<Project, "slug" | "title">;
