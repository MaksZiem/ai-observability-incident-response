import type { ReactNode } from "react";
import { CONFIDENCE_LABELS } from "@/features/analysis/labels";
import type { AnalysisResult } from "@/features/analysis/types";

type SectionProps = {
  title: string;
  children: ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-medium text-fg-muted">{title}</h3>
      {children}
    </section>
  );
}

type AnalysisReportProps = {
  result: AnalysisResult;
};

export function AnalysisReport({ result }: AnalysisReportProps) {
  return (
    <div className="flex flex-col gap-5 text-[13px]">
      <Section title="Summary">
        <p className="text-sm leading-relaxed">{result.summary}</p>
      </Section>

      <Section title="Observed facts">
        <ul className="flex flex-col gap-2">
          {result.observedFacts.map((fact, index) => (
            <li key={index} className="flex flex-col gap-0.5">
              <span>{fact.statement}</span>
              <span className="font-mono text-xs text-fg-muted">
                {fact.evidence}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      {result.relatedDeployments.length > 0 && (
        <Section title="Related deployments">
          <p className="font-mono">{result.relatedDeployments.join(", ")}</p>
        </Section>
      )}

      <Section title="Potential causes">
        <ol className="flex flex-col gap-3">
          {result.hypotheses.map((hypothesis, index) => (
            <li
              key={index}
              className="flex flex-col gap-1 rounded-lg border border-border bg-surface-2 p-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-fg-muted">{index + 1}.</span>
                <span className="font-medium">{hypothesis.cause}</span>
                <span className="rounded bg-warning/10 px-1.5 text-[11px] text-warning">
                  Hypothesis
                </span>
                <span className="text-xs text-fg-muted">
                  {CONFIDENCE_LABELS[hypothesis.confidence]}
                </span>
              </div>
              <p className="text-fg-muted">{hypothesis.reasoning}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Suggested investigation">
        <ol className="flex list-decimal flex-col gap-1 pl-5 marker:font-mono marker:text-fg-muted">
          {result.suggestedInvestigation.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </Section>
    </div>
  );
}
