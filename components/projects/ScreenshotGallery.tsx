import { ImageReveal } from "@/components/motion/ImageReveal";
import { Figure } from "@/components/ui/Figure";
import type { Screenshot } from "@/lib/schemas";

type ScreenshotGalleryProps = { screenshots: Screenshot[] };

/**
 * §8.3's screenshot section. No lightbox in v1.
 *
 * **CSS columns rather than a grid.** The golden sample carries six screenshots from
 * 21:9 to 9:16 because that is what breaks a layout. A grid puts each cell on a shared
 * row height, so mixed ratios either letterbox inside a fixed aspect box or leave large
 * gaps beside the short ones. Multi-column flow lets every figure keep its intrinsic
 * height, and reading order stays top-to-bottom within a column, which is the order the
 * DOM is in.
 *
 * **Each screenshot resolves into focus on scroll** (§10.3), and this is the one place on
 * the site where a per-image reveal is unambiguously right: these are the actual product
 * renders, they are the reason someone opened a case study, and each one arrives alone as
 * the reader reaches it. No stagger — the column flow means neighbouring items are not
 * visually adjacent, so a shared sequence would fire on items in unrelated positions.
 */
export function ScreenshotGallery({ screenshots }: ScreenshotGalleryProps) {
  return (
    <ul className="columns-1 gap-6 md:columns-2">
      {screenshots.map((screenshot) => (
        <li key={screenshot.src} className="mb-6 break-inside-avoid">
          <ImageReveal>
            <Figure
              src={screenshot.src}
              alt={screenshot.alt}
              width={screenshot.width}
              height={screenshot.height}
              caption={screenshot.caption}
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </ImageReveal>
        </li>
      ))}
    </ul>
  );
}
