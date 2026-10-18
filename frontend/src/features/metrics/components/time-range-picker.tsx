"use client";

import { useOptimistic, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TIME_RANGE_LABELS, TIME_RANGES } from "@/features/metrics/time-range";
import type { TimeRange } from "@/features/metrics/types";

type TimeRangePickerProps = {
  value: TimeRange;
};

export function TimeRangePicker({ value }: TimeRangePickerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useOptimistic(value);

  function select(range: TimeRange) {
    const query = new URLSearchParams(searchParams);
    query.set("range", range);

    startTransition(() => {
      setSelected(range);
      router.replace(`${pathname}?${query}`, { scroll: false });
    });
  }

  return (
    <div
      role="group"
      aria-label="Time range"
      aria-busy={pending}
      className="flex rounded-md border border-border bg-surface p-0.5"
    >
      {TIME_RANGES.map((range) => (
        <button
          key={range}
          type="button"
          onClick={() => select(range)}
          aria-pressed={range === selected}
          title={TIME_RANGE_LABELS[range]}
          className={`h-7 rounded px-2.5 font-mono text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
            range === selected
              ? "bg-surface-2 text-fg"
              : "text-fg-muted hover:text-fg"
          }`}
        >
          {range}
        </button>
      ))}
    </div>
  );
}
