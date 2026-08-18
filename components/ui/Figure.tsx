import Image from "next/image";

type FigureProps = {
  src: string;
  /**
   * Required (§11.4). Content images reach this component through `lib/content.ts`,
   * where the schema holds `alt` at a 10-character minimum, so everything arriving from
   * `content/` is meaningful by construction. The empty string is reserved for genuine
   * decoration written directly into a page.
   */
  alt: string;
  /**
   * Intrinsic pixel dimensions. `next/image` needs these (or `fill` plus a sized
   * parent) to reserve space before the file arrives, and `images.unoptimized` does not
   * change that — see §5.3 and docs/DECISIONS.md for why they became content fields.
   */
  width: number;
  height: number;
  caption?: string;
  /** Above the fold. Everything else lazy-loads, which is §12.1's one free habit. */
  priority?: boolean;
  sizes?: string;
};

/**
 * §9.1's image primitive. The only place `next/image` is used, so the day
 * `images.unoptimized` is revisited (§12.2, Phase 6) there is one file to change.
 *
 * The caption pairs `text-body-sm` with `font-sans` explicitly: the `--text-*` steps
 * carry size, leading, and tracking and never a family (§6.6), so without it the caption
 * inherits whatever family is above it in the tree.
 */
export function Figure({
  src,
  alt,
  width,
  height,
  caption,
  priority = false,
  sizes,
}: FigureProps) {
  return (
    <figure className="flex flex-col gap-3">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        // `h-auto w-full` keeps the rendered box on the intrinsic ratio rather than
        // forcing a shape the asset does not have. Screenshots on this site run from
        // 21:9 to 9:16 and none of them are cropped to fit a grid.
        className="h-auto w-full rounded-lg border border-border-subtle bg-surface-alt"
      />
      {caption ? (
        <figcaption className="max-w-measure font-sans text-body-sm text-text-muted">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
