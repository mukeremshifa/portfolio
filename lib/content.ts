import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { z } from "zod";

import {
  CATEGORIES,
  CertificationSchema,
  FocusPillarSchema,
  ProjectSchema,
  SiteSchema,
  SkillGroupSchema,
  ExperienceSchema,
  type Category,
  type Certification,
  type ExperienceEntry,
  type FocusPillar,
  type Project,
  type ProjectRef,
  type Site,
  type SkillGroup,
} from "@/lib/schemas";

/**
 * The validation gate (§5.1). Every content file enters the app through this module and
 * nowhere else, and a malformed one fails the build with an error someone can act on
 * rather than shipping a broken page.
 *
 * **Server-only by construction.** `getProjectSlugs()` enumerates the projects directory
 * from disk, so this module imports `node:fs`. §4.1's rule that no component reads the
 * filesystem is what keeps that boundary from leaking: pages call these selectors and
 * pass plain data down. Importing this from a `"use client"` file will fail the build,
 * which is the correct outcome.
 *
 * **Eager, once.** The parse runs at module evaluation, so a malformed file throws at
 * first import with the offending path named, not on the tenth selector call from
 * whichever page happened to touch it first.
 */

const CONTENT_DIR = join(process.cwd(), "content");
const PROJECTS_DIR = join(CONTENT_DIR, "projects");

type Failure = { file: string; message: string };

const failures: Failure[] = [];

/** Repo-relative, forward-slashed, so the message reads the same on Windows and CI. */
function relative(absolutePath: string): string {
  return absolutePath.slice(process.cwd().length + 1).replaceAll("\\", "/");
}

/**
 * Read one file and parse it against `schema`, recording rather than throwing.
 *
 * Recording is what lets the thrown error name *every* broken file instead of just the
 * first, which matters when a schema change breaks four project files at once: fixing
 * them one build at a time is four builds.
 */
function load<T>(absolutePath: string, schema: z.ZodType<T>): T | undefined {
  const file = relative(absolutePath);

  let raw: string;
  try {
    raw = readFileSync(absolutePath, "utf8");
  } catch {
    failures.push({ file, message: "File not found." });
    return undefined;
  }

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    failures.push({
      file,
      message: `Not valid JSON. ${error instanceof Error ? error.message : String(error)}`,
    });
    return undefined;
  }

  const result = schema.safeParse(data);
  if (!result.success) {
    // `prettifyError` rather than a raw ZodError dump (§5.1): the point is that someone
    // reading CI output at speed can fix the file without opening the schema.
    failures.push({ file, message: z.prettifyError(result.error) });
    return undefined;
  }

  return result.data;
}

function listProjectFiles(): string[] {
  try {
    return readdirSync(PROJECTS_DIR)
      .filter((name) => name.endsWith(".json"))
      .sort();
  } catch {
    failures.push({ file: relative(PROJECTS_DIR), message: "Directory not found." });
    return [];
  }
}

const projectFiles = listProjectFiles();

const site = load(join(CONTENT_DIR, "site.json"), SiteSchema);
const focus = load(join(CONTENT_DIR, "focus", "focus.json"), z.array(FocusPillarSchema));
const skills = load(
  join(CONTENT_DIR, "skills", "skills.json"),
  z.array(SkillGroupSchema),
);
const experience = load(
  join(CONTENT_DIR, "experience", "timeline.json"),
  z.array(ExperienceSchema),
);
const certifications = load(
  join(CONTENT_DIR, "certifications", "certifications.json"),
  z.array(CertificationSchema),
);
const projects = projectFiles
  .map((name) => load(join(PROJECTS_DIR, name), ProjectSchema))
  .filter((project): project is Project => project !== undefined);

if (failures.length > 0) {
  throw new Error(
    [
      `Content validation failed in ${failures.length} file${failures.length === 1 ? "" : "s"}.`,
      "",
      ...failures.flatMap(({ file, message }) => [file, message, ""]),
    ].join("\n"),
  );
}

// Past the throw every optional above is populated. The assertions are the price of
// collecting failures instead of throwing at the first one; they are safe because the
// guard above is unconditional and this module is evaluated exactly once.
const SITE = site!;
const FOCUS = focus!;
const SKILLS = skills!;
const EXPERIENCE = experience!;
const CERTIFICATIONS = certifications!;

/**
 * §5.1's sort: `order` ascending first, then year descending as the tie-break. An
 * unfinished project (`end: null`) is current, so it sorts above one that ended last
 * year rather than below one that ended in 1970.
 */
const ORDERED_PROJECTS = [...projects].sort((a, b) => {
  if (a.order !== b.order) return a.order - b.order;
  const aEnd = a.year.end ?? "9999";
  const bEnd = b.year.end ?? "9999";
  if (aEnd !== bEnd) return bEnd.localeCompare(aEnd);
  return b.year.start.localeCompare(a.year.start);
});

const PROJECTS_BY_SLUG = new Map(ORDERED_PROJECTS.map((p) => [p.slug, p]));

export function getSite(): Site {
  return SITE;
}

export function getFocus(): FocusPillar[] {
  return FOCUS;
}

export function getSkills(): SkillGroup[] {
  return SKILLS;
}

export function getAllProjects(): Project[] {
  return ORDERED_PROJECTS;
}

export function getFeaturedProjects(): Project[] {
  return ORDERED_PROJECTS.filter((project) => project.featured).slice(0, 3);
}

export function getProjectSlugs(): string[] {
  return ORDERED_PROJECTS.map((project) => project.slug);
}

export function getProjectBySlug(slug: string): Project {
  const project = PROJECTS_BY_SLUG.get(slug);
  if (!project) {
    // Routes guard with `getProjectSlugs()` and call `notFound()`; reaching here means
    // a slug was constructed somewhere rather than enumerated, which is a bug, not a 404.
    throw new Error(`No project with slug "${slug}" in content/projects/.`);
  }
  return project;
}

export function getAdjacentProjects(slug: string): {
  prev?: ProjectRef;
  next?: ProjectRef;
} {
  const index = ORDERED_PROJECTS.findIndex((project) => project.slug === slug);
  if (index === -1) return {};

  const toRef = (project: Project): ProjectRef => ({
    slug: project.slug,
    title: project.title,
  });
  const previous = ORDERED_PROJECTS[index - 1];
  const following = ORDERED_PROJECTS[index + 1];

  return {
    ...(previous ? { prev: toRef(previous) } : {}),
    ...(following ? { next: toRef(following) } : {}),
  };
}

export function getExperience(): ExperienceEntry[] {
  return EXPERIENCE;
}

export function getCertifications(): Certification[] {
  return CERTIFICATIONS;
}

/** §8.2's filter options: "All" first, then every `Category`, each with its count. */
export type CategoryFilter = {
  value: Category | "all";
  label: string;
  count: number;
};

/**
 * Derives §8.2's filter options from a list of projects.
 *
 * Pure, and it takes the projects rather than reading them, so a test can hand it a
 * constructed list and this module's own loaded set both. It lives here rather than in
 * `lib/utils.ts` because it needs `CATEGORIES` at runtime, and `lib/utils.ts` is imported
 * by client components — a value import of the schema module there would pull Zod into
 * the browser bundle for the sake of a three-element array.
 *
 * **Every category is emitted, including one with a count of zero.** A filter that
 * silently drops an empty category hides the fact that a whole section of the work is
 * missing; a chip reading "Systems (0)" says it out loud.
 */
export function getCategoryFilters(projects: Project[]): CategoryFilter[] {
  return [
    { value: "all", label: "All", count: projects.length },
    ...CATEGORIES.map((category) => ({
      value: category,
      label: category,
      count: projects.filter((project) => project.category === category).length,
    })),
  ];
}
