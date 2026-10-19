import { formatDayTime } from "@/lib/format";
import type { Deployment } from "@/features/deployments/types";

const SHORT_SHA_LENGTH = 7;

type DeploymentListProps = {
  deployments: Deployment[];
};

export function DeploymentList({ deployments }: DeploymentListProps) {
  return (
    <ul className="text-[13px]">
      {deployments.map((deployment) => (
        <li
          key={deployment.id}
          className="grid grid-cols-[minmax(96px,auto)_1fr_auto] items-baseline gap-4 border-b border-border py-2.5 last:border-b-0"
        >
          <span className="font-mono font-medium">{deployment.version}</span>
          <span className="min-w-0 truncate text-fg-muted">
            <span className="font-mono">
              {deployment.service ?? "all services"}
            </span>
            {deployment.commitSha && (
              <span className="font-mono">
                {" · "}
                {deployment.commitSha.slice(0, SHORT_SHA_LENGTH)}
              </span>
            )}
            {deployment.description && <span> · {deployment.description}</span>}
          </span>
          <span className="font-mono text-fg-muted tabular-nums">
            {formatDayTime(deployment.deployedAt)}
          </span>
        </li>
      ))}
    </ul>
  );
}
