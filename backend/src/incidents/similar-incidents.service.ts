import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { DeploymentsService } from '../deployments/deployments.service.js';
import { ErrorsService } from '../errors/errors.service.js';
import { TracesService } from '../traces/traces.service.js';
import {
  IncidentLink,
  IncidentLinkKind,
} from './entities/incident-link.entity.js';
import { Incident } from './entities/incident.entity.js';
import { IncidentsService } from './incidents.service.js';
import {
  compareIncidents,
  IncidentFeatures,
  titleWords,
} from './similar-incidents.js';

const MAX_CANDIDATES = 100;
const MAX_RESULTS = 5;
const MIN_SCORE = 0.15;

export interface SimilarIncident {
  incident: Incident;
  score: number;
  reasons: string[];
}

@Injectable()
export class SimilarIncidentsService {
  constructor(
    @InjectRepository(Incident)
    private readonly incidentsRepository: Repository<Incident>,
    @InjectRepository(IncidentLink)
    private readonly linksRepository: Repository<IncidentLink>,
    private readonly incidentsService: IncidentsService,
    private readonly errorsService: ErrorsService,
    private readonly tracesService: TracesService,
    private readonly deploymentsService: DeploymentsService,
  ) {}

  async findSimilar(projectId: string, id: string): Promise<SimilarIncident[]> {
    const target = await this.incidentsService.findOne(projectId, id);
    const candidates = await this.incidentsRepository.find({
      where: { projectId, id: Not(target.id) },
      order: { startedAt: 'DESC' },
      take: MAX_CANDIDATES,
    });

    if (candidates.length === 0) {
      return [];
    }

    const features = await this.loadFeatures(projectId, [
      target,
      ...candidates,
    ]);
    const targetFeatures = features.get(target.id);

    if (!targetFeatures) {
      return [];
    }

    return candidates
      .flatMap((incident) => {
        const candidateFeatures = features.get(incident.id);
        return candidateFeatures
          ? [
              {
                incident,
                ...compareIncidents(targetFeatures, candidateFeatures),
              },
            ]
          : [];
      })
      .filter((similar) => similar.score >= MIN_SCORE)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS);
  }

  private async loadFeatures(
    projectId: string,
    incidents: Incident[],
  ): Promise<Map<string, IncidentFeatures>> {
    const links = await this.linksRepository.findBy({
      incidentId: In(incidents.map((incident) => incident.id)),
    });
    const targetsOf = (kind: IncidentLinkKind) => [
      ...new Set(
        links.filter((link) => link.kind === kind).map((link) => link.targetId),
      ),
    ];

    const [errorGroups, traces, deployments] = await Promise.all([
      this.errorsService.findByIds(
        projectId,
        targetsOf(IncidentLinkKind.ERROR_GROUP),
      ),
      this.tracesService.findByTraceIds(
        projectId,
        targetsOf(IncidentLinkKind.TRACE),
      ),
      this.deploymentsService.findByIds(
        projectId,
        targetsOf(IncidentLinkKind.DEPLOYMENT),
      ),
    ]);

    const groupsById = new Map(errorGroups.map((group) => [group.id, group]));
    const tracesById = new Map(traces.map((trace) => [trace.traceId, trace]));
    const deploymentsById = new Map(
      deployments.map((deployment) => [deployment.id, deployment]),
    );

    return new Map(
      incidents.map((incident) => {
        const errorTypes = new Set<string>();
        const services = new Set<string>();

        for (const link of links) {
          if (link.incidentId !== incident.id) continue;

          const group = groupsById.get(link.targetId);
          const trace = tracesById.get(link.targetId);
          const deployment = deploymentsById.get(link.targetId);

          if (link.kind === IncidentLinkKind.ERROR_GROUP && group) {
            errorTypes.add(group.type);
            services.add(group.service);
          }

          if (link.kind === IncidentLinkKind.TRACE && trace) {
            trace.services.forEach((service) => services.add(service));
          }

          if (
            link.kind === IncidentLinkKind.DEPLOYMENT &&
            deployment?.service
          ) {
            services.add(deployment.service);
          }
        }

        return [
          incident.id,
          { errorTypes, services, titleWords: titleWords(incident.title) },
        ];
      }),
    );
  }
}
