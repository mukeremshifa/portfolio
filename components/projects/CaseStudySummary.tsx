import type { CaseStudy } from "@/lib/schemas";

type CaseStudySummaryProps = { caseStudy: CaseStudy };

/**
 * §8.3's and §8.1's case-study block: challenge, decision, outcome under visible
 * sub-labels.
 *
 * Extracted from `/projects/[slug]/` when the home page needed the same three rows, so
 * there is one treatment rather than two that drift. A description list rather than three
 * headings, because these are three labelled facts about one decision and not three
 * sections of a document — and `dt`/`dd` says that in markup instead of asking the reader
 * to infer it from three `h3`s with no content of their own.
 */
export function CaseStudySummary({ caseStudy }: CaseStudySummaryProps) {
  return (
    <dl className="flex max-w-measure flex-col gap-6">
      <div className="flex flex-col gap-2">
        <dt className="font-mono text-eyebrow text-text-muted uppercase">Challenge</dt>
        <dd className="font-sans text-body text-text">{caseStudy.challenge}</dd>
      </div>
      <div className="flex flex-col gap-2">
        <dt className="font-mono text-eyebrow text-text-muted uppercase">Decision</dt>
        <dd className="font-sans text-body text-text">{caseStudy.decision}</dd>
      </div>
      <div className="flex flex-col gap-2">
        <dt className="font-mono text-eyebrow text-text-muted uppercase">Outcome</dt>
        <dd className="font-sans text-body text-text">{caseStudy.outcome}</dd>
      </div>
    </dl>
  );
}
