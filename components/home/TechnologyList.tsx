import { BrandIcon, type BrandIconName } from "@/components/ui/BrandIcon";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * Curated, not exhaustive — the full list is `content/skills/skills.json` on `/about/`.
 *
 * **Every entry here is used by a project in `content/projects/`, with one exception.**
 * Next.js is the framework this site is built on and appears in no project file, which is
 * the only claim on this row that rests on the page the reader is looking at rather than
 * on a case study they can open. That is the bar for adding anything else: the earlier
 * version of this list advertised LangChain, TensorFlow and Keras, none of which appear
 * anywhere in the content, and a homepage that names tools the work does not use is the
 * one inconsistency a reader can actually catch.
 *
 * Ordered as a stack rather than alphabetically: language, front end, runtime, data,
 * platform, then models.
 */
const technologies: { name: string; icon: BrandIconName }[] = [
  { name: "TypeScript", icon: "typescript" },
  { name: "React", icon: "react" },
  { name: "Next.js", icon: "next" },
  { name: "Tailwind CSS", icon: "tailwind" },
  { name: "shadcn/ui", icon: "shadcn" },
  { name: "Node.js", icon: "node" },
  { name: "Hono", icon: "hono" },
  { name: "Deno", icon: "deno" },
  { name: "Python", icon: "python" },
  { name: "Django", icon: "django" },
  { name: "PostgreSQL", icon: "postgresql" },
  { name: "Supabase", icon: "supabase" },
  { name: "Drizzle ORM", icon: "drizzle" },
  { name: "Cloudflare Workers", icon: "cloudflareworkers" },
  { name: "Vercel", icon: "vercel" },
  { name: "Docker", icon: "docker" },
  { name: "Claude", icon: "claude" },
  { name: "Gemini", icon: "gemini" },
];

export function TechnologyList() {
  return (
    <section aria-labelledby="technology-list" className="flex flex-col gap-heading">
      <SectionHeading
        title="Tools I work with"
        lead="A working set of platforms, languages, frameworks, and AI tools."
      />
      <ul className="flex flex-wrap gap-3" aria-label="Technologies and tools">
        {technologies.map((technology) => (
          <li key={technology.name}>
            <span className="inline-flex min-h-11 items-center gap-2 border border-border-subtle bg-surface px-3 py-2 font-mono text-body-sm text-text transition-[background-color,border-color] duration-(--duration-fast) ease-out hover:border-border-strong hover:bg-surface-alt">
              <BrandIcon name={technology.icon} size={18} />
              <span>{technology.name}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
