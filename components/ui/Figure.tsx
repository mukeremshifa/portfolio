import Image from "next/image";

type FigureProps = {
  src: string;
  /**
   * The dark-theme rendition of the same image (§5.3 `cover.srcDark`). Omitted for
   * anything that reads correctly in both themes — a photograph, a title card.
   */
  srcDark?: string;
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
   *
   * One pair for both renditions: a light/dark pair is one screen at one size, and two
   * dimension sets could disagree, which would reserve the wrong box for one theme.
   */
  width: number;
  height: number;
  caption?: string;
  /** Above the fold. Everything else lazy-loads, which is §12.1's one free habit. */
  priority?: boolean;
  sizes?: string;
};

const IMAGE_CLASS =
  // `h-auto w-full` keeps the rendered box on the intrinsic ratio rather than
  // forcing a shape the asset does not have. Screenshots on this site run from
  // 21:9 to 9:16 and none of them are cropped to fit a grid.
  "h-auto w-full rounded-none border border-border-subtle bg-surface-alt";

/**
 * §9.1's image primitive. The only place `next/image` is used, so the day
 * `images.unoptimized` is revisited (§12.2, Phase 6) there is one file to change.
 *
 * The caption pairs `text-body-sm` with `font-sans` explicitly: the `--text-*` steps
 * carry size, leading, and tracking and never a family (§6.6), so without it the caption
 * inherits whatever family is above it in the tree.
 *
 * THEME PAIRS
 * -----------
 * Both renditions are rendered and swapped with the `dark:` variant, which resolves to
 * `.dark` on `<html>` (`@custom-variant` in `globals.css`) — the same class
 * `ThemeScript` sets. That is the whole reason this is a CSS swap and not a `<picture>`
 * with `media="(prefers-color-scheme: dark)"`: the site's theme is a *three-state
 * preference*, not the OS setting, so a `prefers-color-scheme` source would show a
 * visitor on a dark OS who has explicitly chosen light theme a dark screenshot on a
 * light page. `<picture>` cannot see a class.
 *
 * The cost is that both files are fetched — `display: none` does not cancel an `<img>`
 * request. Accepted deliberately: covers encode to ~60 KB each and at most one cover
 * loads per page (`/projects` renders none — `ProjectCard` shows a cover only in its
 * `featured` variant, and only the home lead card uses it).
 *
 * `priority` applies to both for the same reason. The theme is resolved on the client
 * after the server has already rendered, so the server cannot know which rendition will
 * be the LCP element, and marking only one would be a guess that is wrong half the time.
 *
 * Accessibility is handled by the swap itself rather than by `aria-hidden`: the hidden
 * rendition is `display: none`, which removes it from the accessibility tree, so exactly
 * one image carries `alt` at any time. Both need the *same* real `alt` — blanking the
 * dark one would leave dark-theme visitors with an undescribed image.
 */
export function Figure({
  src,
  srcDark,
  alt,
  width,
  height,
  caption,
  priority = false,
  sizes,
}: FigureProps) {
  // `alt` is deliberately **not** in this object. Spread through it, the prop is
  // invisible to `jsx-a11y/alt-text`, which reads the JSX statically and cannot follow a
  // spread — every `<Image>` below reported as missing `alt` while all three had it. The
  // fix is to pass it explicitly rather than to silence the rule: an image whose `alt`
  // cannot be seen at the call site is exactly what the rule is for, and the next real
  // omission would have been indistinguishable from these three false positives.
  const shared = { width, height, priority, sizes };

  return (
    <figure className="flex flex-col gap-3">
      {srcDark ? (
        <>
          <Image
            {...shared}
            alt={alt}
            src={src}
            className={`${IMAGE_CLASS} dark:hidden`}
          />
          <Image
            {...shared}
            alt={alt}
            src={srcDark}
            className={`${IMAGE_CLASS} hidden dark:block`}
          />
        </>
      ) : (
        <Image {...shared} alt={alt} src={src} className={IMAGE_CLASS} />
      )}
      {caption ? (
        <figcaption className="max-w-measure font-sans text-body-sm text-text-muted">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
