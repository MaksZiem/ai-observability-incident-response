"use server";

import { apiFetch } from "@/lib/api";
import { listErrorGroups } from "@/features/errors/queries";
import { listIncidents } from "@/features/incidents/queries";
import type { OpenCounts } from "@/features/realtime/types";

const COUNT_LIMIT = 100;

export async function createStreamToken() {
  const { token } = await apiFetch<{ token: string }>("/auth/stream-token", {
    method: "POST",
  });
  return token;
}

export async function getOpenCounts(projectId: string): Promise<OpenCounts> {
  const [errors, open, investigating] = await Promise.all([
    listErrorGroups(projectId, { status: "open", limit: COUNT_LIMIT }),
    listIncidents(projectId, "open", COUNT_LIMIT),
    listIncidents(projectId, "investigating", COUNT_LIMIT),
  ]);

  return {
    errors: errors.length,
    incidents: open.length + investigating.length,
  };
}
