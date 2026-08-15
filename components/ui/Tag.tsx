import type { ReactNode } from "react";

type TagProps = {
  children: ReactNode;
  tone?: "neutral" | "accent";
};

// §6.8: technologies read like data, not prose, so tags are mono. The accent tone is
// the "key tag" case — brand text on a tinted background, and brand-cream in dark mode
// per §6.3's binding rule.
const tones = {
  neutral: "border-border-subtle bg-surface-alt text-text-muted",
  accent: "border-transparent bg-brand-soft text-brand dark:text-brand-cream",
} as const;

export function Tag({ children, tone = "neutral" }: TagProps) {
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2 py-1 font-mono text-body-sm ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
