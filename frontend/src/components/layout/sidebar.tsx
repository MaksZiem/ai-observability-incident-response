"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  Bell,
  Boxes,
  Bug,
  ChartLine,
  FileSearch,
  LayoutDashboard,
  LogOut,
  Menu,
  Rocket,
  ScrollText,
  Settings,
  Siren,
  Waypoints,
  X,
  type LucideIcon,
} from "lucide-react";
import { logout } from "@/features/auth/actions";
import type { User } from "@/features/auth/types";
import { ProjectSwitcher } from "@/features/projects/components/project-switcher";
import type { Project } from "@/features/projects/types";
import { LiveIndicator } from "@/features/realtime/components/live-indicator";
import type { OpenCounts } from "@/features/realtime/types";
import { useProjectLive } from "@/features/realtime/use-project-live";

type NavItem = {
  section: string;
  label: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { section: "", label: "Overview", icon: LayoutDashboard },
  { section: "services", label: "Services", icon: Boxes },
  { section: "errors", label: "Errors", icon: Bug },
  { section: "logs", label: "Logs", icon: ScrollText },
  { section: "traces", label: "Traces", icon: Waypoints },
  { section: "metrics", label: "Metrics", icon: ChartLine },
  { section: "incidents", label: "Incidents", icon: Siren },
  { section: "deployments", label: "Deployments", icon: Rocket },
  { section: "analysis", label: "AI Analysis", icon: FileSearch },
  { section: "alerts", label: "Alerts", icon: Bell },
  { section: "settings", label: "Settings", icon: Settings },
];

const ICON_BUTTON =
  "flex size-8 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent";

function sectionHref(projectId: string, section: string) {
  return section
    ? `/projects/${projectId}/${section}`
    : `/projects/${projectId}`;
}

const MAX_COUNT = 99;

function countFor(section: string, counts: OpenCounts | null) {
  if (section === "errors") return counts?.errors ?? 0;
  if (section === "incidents") return counts?.incidents ?? 0;
  return 0;
}

function isActive(pathname: string, href: string, section: string) {
  if (!section) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <span className="size-4 rounded bg-accent" aria-hidden />
      <span className="font-semibold">Observability</span>
    </div>
  );
}

type SidebarProps = {
  user: User;
  projects: Project[];
};

export function Sidebar({ user, projects }: SidebarProps) {
  const pathname = usePathname();
  const { projectId } = useParams<{ projectId?: string }>();
  const [open, setOpen] = useState(false);
  const { status, counts } = useProjectLive(projectId);

  useEffect(() => {
    if (!open) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <>
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-surface px-4 md:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="app-sidebar"
          className={ICON_BUTTON}
        >
          <Menu className="size-4" strokeWidth={1.75} aria-hidden />
        </button>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-56 shrink-0 flex-col border-r border-border bg-surface px-2.5 py-4 transition-[transform,visibility] duration-200 motion-reduce:transition-none md:static md:visible md:translate-x-0 ${
          open ? "translate-x-0" : "invisible -translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-2.5 pb-4">
          <Brand />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className={`${ICON_BUTTON} md:hidden`}
          >
            <X className="size-4" strokeWidth={1.75} aria-hidden />
          </button>
        </div>

        <div className="flex flex-col gap-2 px-1 pb-4">
          <ProjectSwitcher projects={projects} currentProjectId={projectId} />
          {projectId && <LiveIndicator status={status} />}
        </div>

        {projectId && (
          <nav className="flex flex-col gap-0.5">
            {NAV_ITEMS.map(({ section, label, icon: Icon }) => {
              const href = sectionHref(projectId, section);
              const active = isActive(pathname, href, section);
              const count = countFor(section, counts);

              return (
                <Link
                  key={section}
                  href={href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    active
                      ? "bg-surface-2 text-fg"
                      : "text-fg-muted hover:bg-surface-hover hover:text-fg"
                  }`}
                >
                  <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                  {label}
                  {count > 0 && (
                    <span className="ml-auto rounded-full bg-danger/15 px-1.5 font-mono text-[11px] text-danger tabular-nums">
                      {count > MAX_COUNT ? `${MAX_COUNT}+` : count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="mt-auto flex items-center gap-2 border-t border-border px-2.5 pt-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium">{user.name}</p>
            <p className="truncate text-xs text-fg-muted">{user.email}</p>
          </div>
          <form action={logout}>
            <button type="submit" aria-label="Sign out" className={ICON_BUTTON}>
              <LogOut className="size-4" strokeWidth={1.75} aria-hidden />
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
