import { StatusBadge } from "@/components/ui/status-badge";
import { formatDayTime } from "@/lib/format";
import { AlertRuleActions } from "@/features/alerts/components/alert-rule-actions";
import {
  alertBadge,
  describeCondition,
  METRICS,
} from "@/features/alerts/labels";
import type { AlertRule } from "@/features/alerts/types";
import { INCIDENT_SEVERITY } from "@/features/incidents/labels";

type AlertRuleListProps = {
  projectId: string;
  rules: AlertRule[];
};

function describeActions(rule: AlertRule) {
  const actions = [];
  if (rule.createIncident) {
    actions.push(
      `creates a ${INCIDENT_SEVERITY[rule.incidentSeverity].label.toLowerCase()} incident`,
    );
  }
  if (rule.webhookUrl) {
    actions.push(`calls ${new URL(rule.webhookUrl).host}`);
  }
  return actions.length > 0 ? `Then ${actions.join(" and ")}.` : "No action.";
}

export function AlertRuleList({ projectId, rules }: AlertRuleListProps) {
  return (
    <ul className="flex flex-col rounded-xl border border-border bg-surface">
      {rules.map((rule) => (
        <li
          key={rule.id}
          className="flex flex-col gap-3 border-b border-border p-[18px] last:border-b-0"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-base font-semibold">
                  {rule.name}
                </h3>
                <StatusBadge {...alertBadge(rule)} />
              </div>
              <p className="font-mono text-[13px]">
                {describeCondition(rule)}
                {rule.service && (
                  <span className="text-fg-muted"> · {rule.service}</span>
                )}
              </p>
              <p className="text-[13px] text-fg-muted">
                {describeActions(rule)}
              </p>
            </div>
            <AlertRuleActions
              projectId={projectId}
              ruleId={rule.id}
              name={rule.name}
              enabled={rule.enabled}
            />
          </div>

          <dl className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
            <div className="flex gap-1.5">
              <dt className="text-fg-muted">Last value</dt>
              <dd className="font-mono tabular-nums">
                {rule.lastValue === null
                  ? "—"
                  : METRICS[rule.metric].format(rule.lastValue)}
              </dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="text-fg-muted">Evaluated</dt>
              <dd className="font-mono tabular-nums">
                {rule.lastEvaluatedAt
                  ? formatDayTime(rule.lastEvaluatedAt)
                  : "never"}
              </dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="text-fg-muted">Last fired</dt>
              <dd className="font-mono tabular-nums">
                {rule.lastTriggeredAt
                  ? formatDayTime(rule.lastTriggeredAt)
                  : "never"}
              </dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}
