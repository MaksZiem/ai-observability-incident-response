import { Injectable } from '@nestjs/common';
import { DeploymentsService } from '../deployments/deployments.service.js';
import type { Deployment } from '../deployments/entities/deployment.entity.js';
import type { ErrorGroup } from '../errors/entities/error-group.entity.js';
import { ErrorsService } from '../errors/errors.service.js';
import type { Log } from '../logs/entities/log.entity.js';
import { LogsService } from '../logs/logs.service.js';
import { detectAnomalies } from '../metrics/anomalies.js';
import { MetricsService } from '../metrics/metrics.service.js';
import type { TraceDetail } from '../traces/trace-detail.js';
import { TracesService } from '../traces/traces.service.js';
import { IncidentLinkKind } from './entities/incident-link.entity.js';
import {
  BASELINE_GAP_MS,
  buildTimeline,
  incidentWindow,
  TimelineEntry,
} from './incident-timeline.js';
import { IncidentsService } from './incidents.service.js';

export interface IncidentEvidence {
  errorGroups: ErrorGroup[];
  traces: TraceDetail[];
  deployments: Deployment[];
  logs: Log[];
}

@Injectable()
export class IncidentEvidenceService {
  constructor(
    private readonly incidentsService: IncidentsService,
    private readonly errorsService: ErrorsService,
    private readonly tracesService: TracesService,
    private readonly deploymentsService: DeploymentsService,
    private readonly logsService: LogsService,
    private readonly metricsService: MetricsService,
  ) {}

  async getEvidence(projectId: string, id: string): Promise<IncidentEvidence> {
    const links = await this.incidentsService.findLinks(projectId, id);
    const idsOf = (kind: IncidentLinkKind) =>
      links.filter((link) => link.kind === kind).map((link) => link.targetId);

    const [errorGroups, traces, deployments, logs] = await Promise.all([
      this.errorsService.findByIds(
        projectId,
        idsOf(IncidentLinkKind.ERROR_GROUP),
      ),
      this.tracesService.findByTraceIds(
        projectId,
        idsOf(IncidentLinkKind.TRACE),
      ),
      this.deploymentsService.findByIds(
        projectId,
        idsOf(IncidentLinkKind.DEPLOYMENT),
      ),
      this.logsService.findByIds(projectId, idsOf(IncidentLinkKind.LOG)),
    ]);

    return { errorGroups, traces, deployments, logs };
  }

  async getTimeline(projectId: string, id: string): Promise<TimelineEntry[]> {
    const incident = await this.incidentsService.findOne(projectId, id);
    const window = incidentWindow(
      incident.startedAt,
      incident.resolvedAt,
      new Date(),
    );

    const [deployments, errorGroups, notes, series] = await Promise.all([
      this.deploymentsService.findAll(projectId, {
        from: window.from.toISOString(),
        to: window.to.toISOString(),
        limit: 100,
      }),
      this.errorsService.findFirstSeenBetween(
        projectId,
        window.from,
        window.to,
      ),
      this.incidentsService.findNotes(projectId, id),
      this.metricsService.getSeries(projectId, window),
    ]);

    const anomalies = detectAnomalies(
      series,
      new Date(incident.startedAt.getTime() - BASELINE_GAP_MS),
    );

    return buildTimeline({
      incident,
      deployments,
      errorGroups,
      notes,
      anomalies,
    });
  }
}
