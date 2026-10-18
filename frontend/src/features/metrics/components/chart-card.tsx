import type { ReactNode } from "react";

type ChartCardProps = {
  title: string;
  value: string;
  children: ReactNode;
};

export function ChartCard({ title, value, children }: ChartCardProps) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-[18px]">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-base font-semibold">{title}</h2>
        <span className="font-mono text-[13px] tabular-nums text-fg-muted">
          {value}
        </span>
      </div>
      {children}
    </section>
  );
}
