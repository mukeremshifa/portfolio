import { BrandIcon, type BrandIconName } from "@/components/ui/BrandIcon";
import { ChipStagger } from "@/components/motion/ChipStagger";
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
      {/* §10.3: the chips arrive as a wave rather than as a block.

          `ChipStagger` rather than the shared `Stagger`, and the difference is the cap.
          `Stagger` stops offsetting after six children so a card grid's last row does not
          wait — correct there, wrong here, where there are twenty-two chips and the cap
          would land eighteen of them simultaneously, producing a small sequence followed
          by a thud. This wave runs across all of them at a much finer step.

          The hover keeps `--duration-fast` and gains a lift: these are the densest
          interactive targets on the page, and a chip that only tints is the flatness the
          v3 rewrite exists to fix. */}
      <ul className="flex flex-wrap gap-3" aria-label="Technologies and tools">
        <ChipStagger>
          {technologies.map((technology) => (
            <span
              key={technology.name}
              className="inline-flex min-h-11 items-center gap-2 border border-border-subtle bg-surface px-3 py-2 font-mono text-body-sm text-text transition-[background-color,border-color,transform] duration-(--duration-fast) ease-out hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-alt"
            >
              <BrandIcon name={technology.icon} size={18} />
              <span>{technology.name}</span>
            </span>
          ))}
        </ChipStagger>
      </ul>
    </section>
  );
}
