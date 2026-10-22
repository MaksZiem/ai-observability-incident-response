import { cache } from "react";
import { notFound } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import type {
  Incident,
  IncidentEvidence,
  IncidentLink,
  IncidentStatus,
  SimilarIncident,
  TimelineEntry,
} from "@/features/incidents/types";

function incidentApiPath(projectId: string, incidentId: string) {
  return `/projects/${projectId}/incidents/${incidentId}`;
}

export function listIncidents(
  projectId: string,
  status?: IncidentStatus,
  limit?: number,
) {
  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (limit) query.set("limit", String(limit));
  return apiFetch<Incident[]>(`/projects/${projectId}/incidents?${query}`);
}

export const getIncident = cache(
  async (projectId: string, incidentId: string) => {
    try {
      return await apiFetch<Incident>(incidentApiPath(projectId, incidentId));
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 404 || error.status === 400)
      ) {
        notFound();
      }
      throw error;
    }
  },
);

export function getIncidentTimeline(projectId: string, incidentId: string) {
  return apiFetch<TimelineEntry[]>(
    `${incidentApiPath(projectId, incidentId)}/timeline`,
  );
}

export function getIncidentEvidence(projectId: string, incidentId: string) {
  return apiFetch<IncidentEvidence>(
    `${incidentApiPath(projectId, incidentId)}/evidence`,
  );
}

export function listIncidentLinks(projectId: string, incidentId: string) {
  return apiFetch<IncidentLink[]>(
    `${incidentApiPath(projectId, incidentId)}/links`,
  );
}

export function listSimilarIncidents(projectId: string, incidentId: string) {
  return apiFetch<SimilarIncident[]>(
    `${incidentApiPath(projectId, incidentId)}/similar`,
  );
}
