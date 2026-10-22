"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { loadMoreLogs } from "@/features/logs/actions";
import { LogRow } from "@/features/logs/components/log-row";
import type { LogsFilter } from "@/features/logs/queries";
import type { Log, LogPage } from "@/features/logs/types";

type LogStreamProps = {
  projectId: string;
  filter: LogsFilter;
  initialPage: LogPage;
};

function prependNew(fresh: Log[], current: Log[]) {
  const known = new Set(current.map((log) => log.id));
  return [...fresh.filter((log) => !known.has(log.id)), ...current];
}

export function LogStream({ projectId, filter, initialPage }: LogStreamProps) {
  const [logs, setLogs] = useState(initialPage.items);
  const [cursor, setCursor] = useState(initialPage.nextCursor);
  const [page, setPage] = useState(initialPage);
  const [pending, startTransition] = useTransition();

  if (page !== initialPage) {
    setPage(initialPage);
    setLogs((current) => prependNew(initialPage.items, current));
  }

  function loadMore() {
    if (!cursor) return;
    startTransition(async () => {
      const next = await loadMoreLogs(projectId, filter, cursor);
      setLogs((current) => [...current, ...next.items]);
      setCursor(next.nextCursor);
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
