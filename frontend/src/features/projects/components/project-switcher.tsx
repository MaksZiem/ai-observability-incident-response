"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Select } from "@/components/ui/select";
import { EnvironmentBadge } from "@/features/projects/components/environment-badge";
import type { Project } from "@/features/projects/types";

type ProjectSwitcherProps = {
  projects: Project[];
  currentProjectId: string | undefined;
};

export function ProjectSwitcher({
  projects,
  currentProjectId,
}: ProjectSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const current = projects.find((project) => project.id === currentProjectId);

  function switchProject(projectId: string) {
    const section = pathname.split("/")[3];
    router.push(
      section ? `/projects/${projectId}/${section}` : `/projects/${projectId}`,
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        {projects.length > 0 && (
          <Select
            aria-label="Project"
            value={current?.id ?? ""}
            onChange={(event) => switchProject(event.target.value)}
            className="min-w-0 flex-1"
          >
            {!current && (
              <option value="" disabled>
                Select project
              </option>
            )}
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
        )}
        <Link
          href="/projects/new"
          aria-label="New project"
          className="flex size-[34px] shrink-0 items-center justify-center rounded-md border border-border bg-surface-2 text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Plus className="size-4" strokeWidth={1.75} aria-hidden />
        </Link>
      </div>
      {current && (
        <div>
          <EnvironmentBadge environment={current.environment} />
        </div>
      )}
    </div>
  );
}
