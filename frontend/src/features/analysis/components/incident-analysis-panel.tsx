import Link from "next/link";
import { formatCount, formatDayTime } from "@/lib/format";
import { AnalysisReport } from "@/features/analysis/components/analysis-report";
import { AnalysisStatusBadge } from "@/features/analysis/components/analysis-status-badge";
import { RequestAnalysisButton } from "@/features/analysis/components/request-analysis-button";
import type { IncidentAnalysis } from "@/features/analysis/types";
import { incidentPath } from "@/features/incidents/paths";

type IncidentAnalysisPanelProps = {
  projectId: string;
  incidentId: string;
  analyses: IncidentAnalysis[];
  selectedId: string | undefined;
};

export function IncidentAnalysisPanel({
  projectId,
  incidentId,
  analyses,
  selectedId,
}: IncidentAnalysisPanelProps) {
  const latest = analyses[0];
  const selected =
    analyses.find((analysis) => analysis.id === selectedId) ?? latest;
  const isPending = latest?.status === "pending";

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-[18px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold">AI analysis</h2>
          {selected && <AnalysisStatusBadge status={selected.status} />}
        </div>
        <RequestAnalysisButton
          projectId={projectId}
          incidentId={incidentId}
          disabled={isPending}
          label={latest ? "Run again" : "Analyze incident"}
        />
      </div>

      {!selected && (
        <p className="text-[13px] text-fg-muted">
          The analysis reads this incident&apos;s timeline and linked evidence,
          then separates observed facts from hypotheses. Link evidence first for
          a better result.
        </p>
      )}

      {selected?.status === "pending" && (
        <p className="text-[13px] text-fg-muted">
          Analyzing the evidence. This page updates when the result is ready.
        </p>
      )}

      {selected?.status === "failed" && (
        <p role="alert" className="text-[13px] text-danger">
          {selected.error ?? "The analysis failed."}
        </p>
      )}

      {selected?.result && <AnalysisReport result={selected.result} />}

      {selected?.completedAt && (
        <p className="font-mono text-xs text-fg-muted">
          {formatDayTime(selected.completedAt)}
          {selected.model && ` · ${selected.model}`}
          {selected.inputTokens !== null &&
            selected.outputTokens !== null &&
            ` · ${formatCount(selected.inputTokens + selected.outputTokens)} tokens`}
        </p>
      )}

      {analyses.length > 1 && (
        <details className="border-t border-border pt-3 text-[13px]">
          <summary className="cursor-pointer text-fg-muted hover:text-fg">
            Analysis history ({analyses.length})
          </summary>
          <ul className="mt-2 flex flex-col gap-1">
            {analyses.map((analysis) => (
              <li key={analysis.id}>
                <Link
                  href={`${incidentPath(projectId, incidentId)}?analysis=${analysis.id}`}
                  scroll={false}
                  aria-current={
                    analysis.id === selected?.id ? "true" : undefined
                  }
                  className="flex items-center justify-between gap-3 rounded-md px-2 py-1 hover:bg-surface-hover aria-[current]:bg-surface-2"
                >
                  <span className="font-mono text-fg-muted tabular-nums">
                    {formatDayTime(analysis.createdAt)}
                  </span>
                  <AnalysisStatusBadge status={analysis.status} />
                </Link>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
