import type { ProjectEnvironment } from "@/features/projects/types";

export const ENVIRONMENT_LABELS: Record<ProjectEnvironment, string> = {
  development: "Development",
  staging: "Staging",
  production: "Production",
};

export const ENVIRONMENTS = Object.keys(
  ENVIRONMENT_LABELS,
) as ProjectEnvironment[];
