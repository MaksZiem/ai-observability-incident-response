import type { StatusIndicator, StatusTone } from "@/components/ui/status-badge";
import type { AnalysisStatus, Confidence } from "@/features/analysis/types";

export const ANALYSIS_STATUS: Record<
  AnalysisStatus,
  { label: string; tone: StatusTone; indicator: StatusIndicator }
> = {
  pending: { label: "Analyzing", tone: "accent", indicator: "pulse" },
  completed: { label: "Completed", tone: "success", indicator: "check" },
  failed: { label: "Failed", tone: "danger", indicator: "cross" },
};

export const CONFIDENCE_LABELS: Record<Confidence, string> = {
  low: "Low confidence",
  medium: "Medium confidence",
  high: "High confidence",
};
