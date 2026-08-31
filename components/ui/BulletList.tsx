import { cn } from "@/lib/utils";

type BulletListProps = {
  items: string[];
  /**
   * `square` is §6.7's marker: the same filled square the timeline uses for its rail
   * nodes, at 6px instead of 8px because this one sits in a line of body text rather
   * than on a rule. It is the marker for a list of peers — project lessons, achievements.
   *
   * `star` is for the lists that are not lists: education highlights, where an entry
   * carries exactly one fact about a credential. A square in front of a lone item reads as
   * a list with one row in it, which is the shape a reader then looks for a second row of.
   * A star marks the item out instead of enumerating it, and both highlights are a
   * distinction rather than an entry in a series.
   *
   * It replaced a chevron, which was the same argument with the wrong glyph. A stack of
   * right-pointing chevrons is the disclosure control every accordion on the web uses, so
   * the marker read as a row of collapsed sections waiting to be clicked — worst on the
   * contact page, where three of them sat directly under a heading. A star points nowhere
   * and so promises nothing.
   */
  marker?: "square" | "star";
  /** Achievements and highlights are secondary to the summary above them; lessons are not. */
  tone?: "default" | "muted";
  /**
   * `tight` for items that fit on one line, `loose` for the ones that do not — project
   * lessons run to two lines each at `max-w-measure`, and 8px between them is less than
   * the 27px between the two lines *inside* one of them, so the items stop reading as
   * separate. A variant rather than a `className` override, for the reason
   * `ExternalLink` gives: `cn` is a joiner and not `tailwind-merge`, so `gap-2 gap-3`
   * leaves the winner to stylesheet order.
   */
  gap?: "tight" | "loose";
  className?: string;
};

const tones = {
  default: "text-text",
  muted: "text-text-muted",
} as const;

const gaps = {
  tight: "gap-2",
  loose: "gap-3",
} as const;

/**
 * §11.1's "lists are lists" with §6.7's "every marker has square edges" applied to the
 * marker itself.
 *
 * `list-disc` had been the default here, and a disc is the one round thing in a system
 * whose radius tokens are all `0px` — in the experience timeline it rendered circles
 * 24px to the right of the square rail node belonging to the same entry. The marker is
 * drawn rather than styled because `::marker` takes a colour and a font and not a shape:
 * `list-[square]` is the only square CSS offers and its size is the browser's to choose,
 * so it cannot be tied to `size-1.5`/`bg-border-strong` the way the rail node is.
 *
 * The marker sits in an `h-lh` box, which is the height of one line of whatever type
 * the caller set. That centres it against the first line optically at any size or
 * leading, where a hand-tuned `mt-[0.55em]` is correct for exactly one type step.
 */
export function BulletList({
  items,
  marker = "square",
  tone = "default",
  gap = "tight",
  className,
}: BulletListProps) {
  if (items.length === 0) return null;

  return (
    <ul
      className={cn(
        "flex max-w-measure flex-col font-sans text-body",
        gaps[gap],
        tones[tone],
        className,
      )}
    >
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span aria-hidden="true" className="flex h-lh shrink-0 items-center">
            {marker === "square" ? (
              <span className="size-1.5 bg-border-strong" />
            ) : (
              /* A five-pointed star as a ten-vertex polygon: outer radius 5.2, inner 2.05
                 (the 0.394 ratio that makes the points read as points rather than as a
                 cog), the two sets of vertices alternating from -90° in 36° steps. Every
                 vertex is a corner and every edge is a straight line, so it satisfies
                 §6.7 the way the square does — the roundness that usually comes with a
                 star icon is a stroked one with `strokeLinejoin="round"`, which this is
                 not. Filled with `currentColor` and no stroke, like the square. */
              <svg
                viewBox="0 0 12 12"
                fill="currentColor"
                className="size-3.5 text-border-strong"
              >
                <path d="M6 .8 7.21 4.34 10.95 4.39 7.95 6.63 9.06 10.21 6 8.05 2.94 10.21 4.05 6.63 1.05 4.39 4.8 4.34Z" />
              </svg>
            )}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
