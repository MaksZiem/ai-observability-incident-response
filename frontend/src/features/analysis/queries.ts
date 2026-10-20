import { apiFetch } from "@/lib/api";
import type { ChatMessage, IncidentAnalysis } from "@/features/analysis/types";

function incidentApiPath(projectId: string, incidentId: string) {
  return `/projects/${projectId}/incidents/${incidentId}`;
}

export function listAnalyses(projectId: string, incidentId: string) {
  return apiFetch<IncidentAnalysis[]>(
    `${incidentApiPath(projectId, incidentId)}/analyses`,
  );
}

export function listChatMessages(projectId: string, incidentId: string) {
  return apiFetch<ChatMessage[]>(
    `${incidentApiPath(projectId, incidentId)}/chat`,
  );
}
