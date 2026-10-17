import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Incident } from '../incidents/entities/incident.entity.js';
import { IncidentEvidenceService } from '../incidents/incident-evidence.service.js';
import { IncidentsService } from '../incidents/incidents.service.js';
import { AnalysisModel } from './analysis-model.js';
import { buildAnalysisPrompt } from './analysis-prompt.js';
import {
  AnalysisStatus,
  IncidentAnalysis,
} from './entities/incident-analysis.entity.js';

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);

  constructor(
    @InjectRepository(IncidentAnalysis)
    private readonly analysesRepository: Repository<IncidentAnalysis>,
    private readonly incidentsService: IncidentsService,
    private readonly evidenceService: IncidentEvidenceService,
    private readonly analysisModel: AnalysisModel,
  ) {}

  async request(
    projectId: string,
    incidentId: string,
    userId: string,
  ): Promise<IncidentAnalysis> {
    const incident = await this.incidentsService.findOne(projectId, incidentId);

    const analysis = await this.analysesRepository.save(
      this.analysesRepository.create({
        incidentId: incident.id,
        requestedById: userId,
      }),
    );

    void this.run(projectId, incident, analysis.id).catch((error: unknown) =>
      this.logger.error(`Could not save analysis ${analysis.id}`, error),
    );

    return analysis;
  }

  async findAll(
    projectId: string,
    incidentId: string,
  ): Promise<IncidentAnalysis[]> {
    const incident = await this.incidentsService.findOne(projectId, incidentId);

    return this.analysesRepository.find({
      where: { incidentId: incident.id },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(
    projectId: string,
    incidentId: string,
    id: string,
  ): Promise<IncidentAnalysis> {
    const incident = await this.incidentsService.findOne(projectId, incidentId);
    const analysis = await this.analysesRepository.findOneBy({
      id,
      incidentId: incident.id,
    });

    if (!analysis) {
      throw new NotFoundException(`Analysis ${id} not found`);
    }

    return analysis;
  }

  private async run(
    projectId: string,
    incident: Incident,
    analysisId: string,
  ): Promise<void> {
    try {
      const [timeline, evidence] = await Promise.all([
        this.evidenceService.getTimeline(projectId, incident.id),
        this.evidenceService.getEvidence(projectId, incident.id),
      ]);

      const output = await this.analysisModel.analyze(
        buildAnalysisPrompt({ incident, timeline, evidence }),
      );

      await this.analysesRepository.update(analysisId, {
        status: AnalysisStatus.COMPLETED,
        result: output.result,
        model: output.model,
        inputTokens: output.inputTokens,
        outputTokens: output.outputTokens,
        completedAt: new Date(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Analysis ${analysisId} failed: ${message}`);

      await this.analysesRepository.update(analysisId, {
        status: AnalysisStatus.FAILED,
        error: message,
        completedAt: new Date(),
      });
    }
  }
}
