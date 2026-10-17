import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncidentsService } from '../incidents/incidents.service.js';
import { MetricsService } from '../metrics/metrics.service.js';
import {
  AlertTransition,
  describeCondition,
  isBreached,
  metricValue,
  nextTransition,
} from './alert-evaluation.js';
import { AlertRule, AlertStatus } from './entities/alert-rule.entity.js';

const EVALUATION_INTERVAL_MS = 60_000;
const WEBHOOK_TIMEOUT_MS = 5_000;

type WebhookStatus = 'firing' | 'resolved';

@Injectable()
export class AlertEvaluatorService {
  private readonly logger = new Logger(AlertEvaluatorService.name);
  private running = false;

  constructor(
    @InjectRepository(AlertRule)
    private readonly rulesRepository: Repository<AlertRule>,
    private readonly metricsService: MetricsService,
    private readonly incidentsService: IncidentsService,
  ) {}

  @Interval(EVALUATION_INTERVAL_MS)
  async evaluateAll(): Promise<void> {
    if (this.running) {
      return;
    }

    this.running = true;

    try {
      const rules = await this.rulesRepository.findBy({ enabled: true });

      for (const rule of rules) {
        await this.evaluate(rule).catch((error: unknown) =>
          this.logger.error(`Alert rule ${rule.id} evaluation failed`, error),
        );
      }
    } finally {
      this.running = false;
    }
  }

  async evaluate(rule: AlertRule, now: Date = new Date()): Promise<AlertRule> {
    const windowMs = rule.windowMinutes * 60_000;
    const stats = await this.metricsService.getStats(
      rule.projectId,
      { from: new Date(now.getTime() - windowMs), to: now, stepMs: windowMs },
      rule.service ?? undefined,
    );

    const value = metricValue(rule.metric, stats);
    const transition = nextTransition(
      rule.status,
      isBreached(rule.comparator, value, rule.threshold),
    );

    const state: Partial<AlertRule> = {
      lastValue: value,
      lastEvaluatedAt: now,
    };

    if (transition === AlertTransition.FIRE) {
      state.status = AlertStatus.FIRING;
      state.lastTriggeredAt = now;

      const incident = rule.createIncident
        ? await this.incidentsService.create(rule.projectId, rule.createdById, {
            title: `Alert: ${rule.name}`,
            description: describeCondition(rule, value),
            severity: rule.incidentSeverity,
            startedAt: new Date(now.getTime() - windowMs).toISOString(),
          })
        : null;

      await this.sendWebhook(rule, 'firing', value, incident?.id ?? null, now);
    }

    if (transition === AlertTransition.RECOVER) {
      state.status = AlertStatus.OK;
      await this.sendWebhook(rule, 'resolved', value, null, now);
    }

    await this.rulesRepository.update(rule.id, state);

    return { ...rule, ...state };
  }

  private async sendWebhook(
    rule: AlertRule,
    status: WebhookStatus,
    value: number | null,
    incidentId: string | null,
    at: Date,
  ): Promise<void> {
    if (!rule.webhookUrl) {
      return;
    }

    try {
      const response = await fetch(rule.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertRuleId: rule.id,
          name: rule.name,
          status,
          condition: describeCondition(rule, value),
          metric: rule.metric,
          value,
          threshold: rule.threshold,
          service: rule.service,
          projectId: rule.projectId,
          incidentId,
          at,
        }),
        signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
      });

      if (!response.ok) {
        this.logger.warn(
          `Webhook for alert rule ${rule.id} returned ${response.status}`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Webhook for alert rule ${rule.id} failed: ${message}`);
    }
  }
}
