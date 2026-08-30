import {
  siClaude,
  siCloudflareworkers,
  siDeno,
  siDjango,
  siDocker,
  siDrizzle,
  siGithub,
  siGooglegemini,
  siHono,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siPython,
  siReact,
  siShadcnui,
  siSupabase,
  siTailwindcss,
  siTypescript,
  siVercel,
} from "simple-icons";

/**
 * §13.5's brand marks, drawn from `simple-icons`.
 *
 * **Two names in this union are not technologies.** `github` and `linkedin` are here for
 * the hero's social links, which pass `social.platform` straight through — so removing
 * either because no technology uses it would break the hero rather than tidy this file.
 *
 * `openai` has no mark and renders as a text glyph below. Simple Icons carries no OpenAI,
 * Groq, AWS, or Java icon — all withdrawn over trademark policy — so any technology in
 * `skills.json` from that set cannot appear on the home page row with an icon beside it.
 * None of them currently do. `java` was dropped from this union with the rest: the old
 * `siOpenjdk` mapping put an OpenJDK duke on a chip labelled "Java", which is a different
 * product.
 */
export type BrandIconName =
  | "claude"
  | "cloudflareworkers"
  | "deno"
  | "django"
  | "docker"
  | "drizzle"
  | "gemini"
  | "github"
  | "hono"
  | "linkedin"
  | "next"
  | "node"
  | "openai"
  | "postgresql"
  | "python"
  | "react"
  | "shadcn"
  | "supabase"
  | "tailwind"
  | "typescript"
  | "vercel";

type BrandIconProps = {
  name: BrandIconName;
  size?: number;
};

// Simple Icons dropped LinkedIn's mark, so it is inlined. Sourced from the public brand
// guidelines and kept here rather than in an asset so the icon set stays one import.
const linkedinPath =
  "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V8.999h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.287zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM3.555 20.452h3.558V8.999H3.555zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z";

const icons = {
  claude: siClaude,
  cloudflareworkers: siCloudflareworkers,
  deno: siDeno,
  django: siDjango,
  docker: siDocker,
  drizzle: siDrizzle,
  gemini: siGooglegemini,
  github: siGithub,
  hono: siHono,
  next: siNextdotjs,
  node: siNodedotjs,
  postgresql: siPostgresql,
  python: siPython,
  react: siReact,
  shadcn: siShadcnui,
  supabase: siSupabase,
  tailwind: siTailwindcss,
  typescript: siTypescript,
  vercel: siVercel,
} as const;

export function BrandIcon({ name, size = 20 }: BrandIconProps) {
  if (name === "linkedin") {
    return <IconSvg path={linkedinPath} size={size} />;
  }

  if (name === "openai") {
    return (
      <span
        aria-hidden="true"
        className="inline-flex shrink-0 items-center justify-center font-mono text-[0.65em] leading-none font-semibold"
        style={{ width: size, height: size }}
      >
        AI
      </span>
    );
  }

  return <IconSvg path={icons[name].path} size={size} />;
}

function IconSvg({ path, size }: { path: string; size: number }) {
  return (
    <svg
      aria-hidden="true"
      className="shrink-0"
      fill="currentColor"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <path d={path} />
    </svg>
  );
}
