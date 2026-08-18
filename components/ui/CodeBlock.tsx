import { CopyButton } from "@/components/ui/CopyButton";

type CodeBlockProps = {
  code: string;
  /**
   * A plain label (§12.4). It feeds the `class="language-*"` hook and the chip; there
   * is no highlighter, so nothing validates it against a language list. The hook is the
   * seam if one is ever added.
   */
  language: string;
  title: string;
  file?: string;
  note?: string;
};

/**
 * §9.1 and §12.4: native `<pre><code>`, raw source as text, no colouring. A server
 * component — only `CopyButton` is a client island.
 *
 * **The title is an `h3`, fixed.** §8.3 wants a visible title per snippet and Task 10's
 * outline puts snippets one level under the section's `h2`. Both consumers (the project
 * page and `/dev/primitives`) render this under an `h2`, so the level is correct in
 * both and there is no prop to get wrong.
 *
 * **`tabindex`, `role`, and `aria-label` are unconditional.** Whether a block scrolls is
 * a property of the viewport, not of the content: the same snippet overflows at 320px
 * and does not at 1280px. Measuring at mount is wrong as soon as someone resizes and
 * measuring at build time is wrong immediately. A `<pre>` with `overflow-x: auto` *is* a
 * scrollable region; the cost is a tab stop that is sometimes unnecessary, and the
 * alternative is content that keyboard users cannot reach at exactly the widths where it
 * is hardest to read.
 */
export function CodeBlock({ code, language, title, file, note }: CodeBlockProps) {
  return (
    <figure className="overflow-hidden rounded-lg border border-border-subtle bg-code-bg">
      <figcaption className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 border-b border-border-subtle px-4 py-3">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 className="font-sans text-heading-3 font-semibold text-text">{title}</h3>
            {file ? (
              <span className="rounded-sm border border-border-subtle bg-surface-alt px-2 py-0.5 font-mono text-body-sm text-text-muted">
                {file}
              </span>
            ) : null}
          </div>
          {note ? (
            <p className="max-w-measure font-sans text-body-sm text-text-muted">{note}</p>
          ) : null}
        </div>
        <CopyButton value={code} label={title} />
      </figcaption>
      <pre
        tabIndex={0}
        role="region"
        aria-label={`${title}, code sample`}
        className="overflow-x-auto p-4"
      >
        {/* The utilities on <code> are also a reset: `Prose` styles every descendant
            `code` as an inline chip on `code-bg`, and while nothing nests a CodeBlock
            inside Prose today, a primitive that only looks right in one parent is a trap
            waiting for whoever tries it. */}
        <code
          className={`language-${language} bg-transparent p-0 font-mono text-code text-text`}
        >
          {code}
        </code>
      </pre>
    </figure>
  );
}
