import type { ReactNode } from "react";

type ContainerProps = {
  /** `content` (1200px) for grids and cards, `prose` (720px) for running text. §6.7 */
  width?: "content" | "prose";
  children: ReactNode;
};

// §6.7 gutters: 20px mobile, 32px at md, 48px at xl.
const widths = {
  content: "max-w-content",
  prose: "max-w-prose",
} as const;

export function Container({ width = "content", children }: ContainerProps) {
  return (
    <div className={`mx-auto w-full px-5 md:px-8 xl:px-12 ${widths[width]}`}>
      {children}
    </div>
  );
}
