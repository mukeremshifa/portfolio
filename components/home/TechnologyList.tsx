import { BrandIcon, type BrandIconName } from "@/components/ui/BrandIcon";
import { SectionHeading } from "@/components/ui/SectionHeading";

const technologies: { name: string; icon: BrandIconName }[] = [
  { name: "Supabase", icon: "supabase" },
  { name: "Cloudflare", icon: "cloudflare" },
  { name: "GitHub", icon: "github" },
  { name: "TypeScript", icon: "typescript" },
  { name: "Python", icon: "python" },
  { name: "Java", icon: "java" },
  { name: "React", icon: "react" },
  { name: "Next.js", icon: "next" },
  { name: "Node.js", icon: "node" },
  { name: "LangChain", icon: "langchain" },
  { name: "TensorFlow", icon: "tensorflow" },
  { name: "Keras", icon: "keras" },
  { name: "Claude", icon: "anthropic" },
  { name: "OpenAI", icon: "openai" },
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
            <span className="inline-flex min-h-11 items-center gap-2 border border-border-subtle bg-surface px-3 py-2 font-mono text-body-sm text-text transition-[background-color,border-color] duration-(--duration-fast) ease-standard hover:border-border-strong hover:bg-surface-alt">
              <BrandIcon name={technology.icon} size={18} />
              <span>{technology.name}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}