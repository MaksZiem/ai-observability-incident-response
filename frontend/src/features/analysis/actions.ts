"use server";

import { refresh } from "next/cache";
import { ApiError, apiFetch } from "@/lib/api";
import type { ChatMessage, IncidentAnalysis } from "@/features/analysis/types";

const MESSAGE_MAX = 2000;

function incidentApiPath(projectId: string, incidentId: string) {
  return `/projects/${projectId}/incidents/${incidentId}`;
}

export async function requestAnalysis(projectId: string, incidentId: string) {
  await apiFetch<IncidentAnalysis>(
    `${incidentApiPath(projectId, incidentId)}/analyses`,
    { method: "POST" },
  );
  refresh();
}

export async function askAssistant(
  projectId: string,
  incidentId: string,
  message: string,
): Promise<{ error: string | null }> {
  const question = message.trim();

  if (!question) return { error: "Ask a question first." };
  if (question.length > MESSAGE_MAX) {
    return { error: `Questions are limited to ${MESSAGE_MAX} characters.` };
  }

  try {
    await apiFetch<ChatMessage[]>(
      `${incidentApiPath(projectId, incidentId)}/chat`,
      { method: "POST", body: { message: question } },
    );
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 503 || error.status === 429)
    ) {
      return { error: error.message };
    }
    return { error: "The assistant could not answer. Try again." };
  }

  refresh();
  return { error: null };
}
