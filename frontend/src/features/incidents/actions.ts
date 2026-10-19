"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import {
  INCIDENT_SEVERITIES,
  INCIDENT_STATUSES,
  LINK_KINDS,
} from "@/features/incidents/labels";
import { incidentPath } from "@/features/incidents/paths";
import type {
  Incident,
  IncidentSeverity,
  IncidentStatus,
} from "@/features/incidents/types";

const TITLE_MAX = 200;
const DESCRIPTION_MAX = 5000;
const NOTE_MAX = 10000;

function apiPath(projectId: string, incidentId: string) {
  return `/projects/${projectId}/incidents/${incidentId}`;
}

function errorMessage(error: unknown, fallback: string) {
  if (
    error instanceof ApiError &&
    (error.status === 400 || error.status === 409)
  ) {
    return error.message;
  }
  if (error instanceof ApiError && error.status === 404) {
    return "Not found in this project.";
  }
  return fallback;
}

export type CreateIncidentState = {
  error: string | null;
  title: string;
  description: string;
  severity: IncidentSeverity;
};

export async function createIncident(
  projectId: string,
  _prevState: CreateIncidentState,
  formData: FormData,
): Promise<CreateIncidentState> {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const severity =
    INCIDENT_SEVERITIES.find((value) => value === formData.get("severity")) ??
    null;

  const entered = { title, description, severity: severity ?? "high" };

  if (!title) return { ...entered, error: "Enter a title." };
  if (title.length > TITLE_MAX) {
    return {
      ...entered,
      error: `Title must be at most ${TITLE_MAX} characters.`,
    };
  }
  if (description.length > DESCRIPTION_MAX) {
    return {
      ...entered,
      error: `Description must be at most ${DESCRIPTION_MAX} characters.`,
    };
  }
  if (!severity) return { ...entered, error: "Choose a severity." };

  let incident: Incident;
  try {
    incident = await apiFetch<Incident>(`/projects/${projectId}/incidents`, {
      method: "POST",
      body: { title, severity, description: description || undefined },
    });
  } catch (error) {
    return {
      ...entered,
      error: errorMessage(error, "Could not create the incident. Try again."),
    };
  }

  redirect(incidentPath(projectId, incident.id));
}

export async function updateIncidentStatus(
  projectId: string,
  incidentId: string,
  status: IncidentStatus,
) {
  if (!INCIDENT_STATUSES.includes(status)) {
    throw new Error(`Unknown incident status: ${status}`);
  }

  await apiFetch<Incident>(apiPath(projectId, incidentId), {
    method: "PATCH",
    body: { status },
  });
  refresh();
}

export type FormState = {
  error: string | null;
  saved: boolean;
};

export type NoteState = {
  error: string | null;
  body: string;
};

export async function addIncidentNote(
  projectId: string,
  incidentId: string,
  _prevState: NoteState,
  formData: FormData,
): Promise<NoteState> {
  const body = String(formData.get("body") ?? "").trim();

  if (!body) return { error: "Write a note first.", body };
  if (body.length > NOTE_MAX) {
    return { error: `Note must be at most ${NOTE_MAX} characters.`, body };
  }

  try {
    await apiFetch(`${apiPath(projectId, incidentId)}/notes`, {
      method: "POST",
      body: { body },
    });
  } catch (error) {
    return {
      error: errorMessage(error, "Could not save the note. Try again."),
      body,
    };
  }

  refresh();
  return { error: null, body: "" };
}

export async function linkEvidence(
  projectId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const incidentId = String(formData.get("incidentId") ?? "");
  const targetId = String(formData.get("targetId") ?? "").trim();
  const kind = LINK_KINDS.find((value) => value === formData.get("kind"));

  if (!incidentId) return { error: "Choose an incident.", saved: false };
  if (!kind) return { error: "Choose what to link.", saved: false };
  if (!targetId) return { error: "Enter the ID to link.", saved: false };

  try {
    await apiFetch(`${apiPath(projectId, incidentId)}/links`, {
      method: "POST",
      body: { kind, targetId },
    });
  } catch (error) {
    return {
      error: errorMessage(error, "Could not link the evidence. Try again."),
      saved: false,
    };
  }

  refresh();
  return { error: null, saved: true };
}

export async function unlinkEvidence(
  projectId: string,
  incidentId: string,
  linkId: string,
) {
  await apiFetch(`${apiPath(projectId, incidentId)}/links/${linkId}`, {
    method: "DELETE",
  });
  refresh();
}
