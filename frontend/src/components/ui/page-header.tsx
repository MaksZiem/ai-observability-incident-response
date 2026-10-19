import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type PageHeaderProps = {
  title: ReactNode;
  description?: string;
  back?: { href: string; label: string };
  actions?: ReactNode;
};

export function PageHeader({
  title,
  description,
  back,
  actions,
}: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 border-b border-border px-6 py-5">
      <div className="min-w-0">
        {back && (
          <Link
            href={back.href}
            className="mb-1 inline-flex items-center gap-1 text-[13px] text-fg-muted transition-colors hover:text-fg"
          >
            <ChevronLeft className="size-4" strokeWidth={1.75} aria-hidden />
            {back.label}
          </Link>
        )}
        <h1 className="truncate text-2xl font-semibold tracking-tight">
          {title}
        </h1>
        {description && <p className="mt-1 text-fg-muted">{description}</p>}
      </div>

      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </header>
  );
}
