"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createStreamToken, getOpenCounts } from "@/features/realtime/actions";
import {
  affectsCounts,
  affectsSection,
  PROJECT_EVENT_TYPES,
} from "@/features/realtime/events";
import type {
  OpenCounts,
  ProjectEventType,
  StreamStatus,
} from "@/features/realtime/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
const REFRESH_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 30_000;

type Scoped<T> = {
  projectId: string;
  value: T;
};

export function useProjectLive(projectId: string | undefined) {
  const router = useRouter();
  const pathname = usePathname();
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<Scoped<StreamStatus> | null>(null);
  const [counts, setCounts] = useState<Scoped<OpenCounts> | null>(null);

  const loadCounts = useEffectEvent((id: string) => {
    getOpenCounts(id)
      .then((value) => setCounts({ projectId: id, value }))
      .catch(() => setCounts(null));
  });

  const handleEvent = useEffectEvent((id: string, type: ProjectEventType) => {
    if (affectsCounts(type)) loadCounts(id);

    const section = pathname.split("/")[3] ?? "";
    if (!affectsSection(type, section) || refreshTimer.current) return;

    refreshTimer.current = setTimeout(() => {
      refreshTimer.current = null;
      router.refresh();
    }, REFRESH_DELAY_MS);
  });

  useEffect(
    () => () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (!projectId) return;

    let source: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;
    let closed = false;

    const update = (value: StreamStatus) => setStatus({ projectId, value });

    function retry() {
      if (closed) return;
      const delay = Math.min(1000 * 2 ** attempt, MAX_RETRY_DELAY_MS);
      attempt += 1;
      retryTimer = setTimeout(connect, delay);
    }

    async function connect() {
      let token: string;
      try {
        token = await createStreamToken();
      } catch {
        update("offline");
        retry();
        return;
      }
      if (closed || !projectId) return;

      const query = new URLSearchParams({ token });
      source = new EventSource(
        `${API_URL}/projects/${projectId}/stream?${query}`,
      );

      source.onopen = () => {
        attempt = 0;
        update("live");
      };
      source.onerror = () => {
        source?.close();
        update("offline");
        retry();
      };
      for (const type of PROJECT_EVENT_TYPES) {
        source.addEventListener(type, () => handleEvent(projectId, type));
      }
    }

    void connect();
    getOpenCounts(projectId)
      .then((value) => {
        if (!closed) setCounts({ projectId, value });
      })
      .catch(() => setCounts(null));

    return () => {
      closed = true;
      clearTimeout(retryTimer);
      source?.close();
    };
  }, [projectId]);

  return {
    status:
      status && status.projectId === projectId ? status.value : "connecting",
    counts: counts && counts.projectId === projectId ? counts.value : null,
  };
}
