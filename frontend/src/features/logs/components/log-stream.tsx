"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { loadMoreLogs } from "@/features/logs/actions";
import { LogRow } from "@/features/logs/components/log-row";
import type { LogsFilter } from "@/features/logs/queries";
import type { LogPage } from "@/features/logs/types";

type LogStreamProps = {
  projectId: string;
  filter: LogsFilter;
  initialPage: LogPage;
};

export function LogStream({ projectId, filter, initialPage }: LogStreamProps) {
  const [logs, setLogs] = useState(initialPage.items);
  const [cursor, setCursor] = useState(initialPage.nextCursor);
  const [pending, startTransition] = useTransition();

  function loadMore() {
    if (!cursor) return;
    startTransition(async () => {
      const page = await loadMoreLogs(projectId, filter, cursor);
      setLogs((current) => [...current, ...page.items]);
      setCursor(page.nextCursor);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        {logs.map((log) => (
          <LogRow key={log.id} projectId={projectId} log={log} />
        ))}
      </div>

      {cursor && (
        <Button onClick={loadMore} disabled={pending} className="self-center">
          {pending ? "Loading…" : "Load older logs"}
        </Button>
      )}
    </div>
  );
}
