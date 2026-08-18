import { CodeBlock } from "@/components/ui/CodeBlock";
import type { CodeSnippet } from "@/lib/schemas";

type CodeHighlightProps = { snippets: CodeSnippet[] };

/**
 * §8.3's "Code highlights" body. Each snippet is a `CodeBlock`, which owns its own `h3`,
 * its scroll affordances, and its copy island.
 *
 * A list, because it is one: the snippets are a set of peers and their count is
 * announced. The page renders the `h2` above it and does not render the section at all
 * when `snippets` is empty.
 */
export function CodeHighlight({ snippets }: CodeHighlightProps) {
  return (
    <ul className="flex flex-col gap-8">
      {snippets.map((snippet) => (
        <li key={snippet.title}>
          <CodeBlock
            code={snippet.code}
            language={snippet.language}
            title={snippet.title}
            file={snippet.file}
            note={snippet.note}
          />
        </li>
      ))}
    </ul>
  );
}
