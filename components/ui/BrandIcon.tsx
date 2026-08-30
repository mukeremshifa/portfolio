import {
  siAnthropic,
  siCloudflare,
  siGithub,
  siGooglegemini,
  siKeras,
  siLangchain,
  siNextdotjs,
  siNodedotjs,
  siOpenjdk,
  siPython,
  siReact,
  siSupabase,
  siTensorflow,
  siTypescript,
} from "simple-icons/icons";

export type BrandIconName =
  | "anthropic"
  | "cloudflare"
  | "github"
  | "gemini"
  | "java"
  | "keras"
  | "langchain"
  | "linkedin"
  | "next"
  | "node"
  | "openai"
  | "python"
  | "react"
  | "supabase"
  | "tensorflow"
  | "typescript";

type BrandIconProps = {
  name: BrandIconName;
  size?: number;
};

const linkedinPath =
  "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V8.999h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.287zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM3.555 20.452h3.558V8.999H3.555zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z";

const icons = {
  anthropic: siAnthropic,
  cloudflare: siCloudflare,
  github: siGithub,
  gemini: siGooglegemini,
  java: siOpenjdk,
  keras: siKeras,
  langchain: siLangchain,
  next: siNextdotjs,
  node: siNodedotjs,
  python: siPython,
  react: siReact,
  supabase: siSupabase,
  tensorflow: siTensorflow,
  typescript: siTypescript,
} as const;

export function BrandIcon({ name, size = 20 }: BrandIconProps) {
  if (name === "linkedin") {
    return <IconSvg path={linkedinPath} size={size} />;
  }

  if (name === "openai") {
    return (
      <span
        aria-hidden="true"
        className="inline-flex shrink-0 items-center justify-center font-mono text-[0.65em] font-semibold leading-none"
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