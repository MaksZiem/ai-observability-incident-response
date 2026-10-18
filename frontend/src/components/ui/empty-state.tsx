import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface px-6 py-12 text-center">
      <Icon className="size-6 text-fg-muted" strokeWidth={1.75} aria-hidden />
      <p className="text-sm text-fg">{title}</p>
      <p className="max-w-sm text-[13px] text-fg-muted">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
