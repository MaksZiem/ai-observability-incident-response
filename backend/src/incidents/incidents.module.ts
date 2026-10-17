import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeploymentsModule } from '../deployments/deployments.module.js';
import { ErrorsModule } from '../errors/errors.module.js';
import { LogsModule } from '../logs/logs.module.js';
import { MetricsModule } from '../metrics/metrics.module.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { TracesModule } from '../traces/traces.module.js';
import { IncidentLink } from './entities/incident-link.entity.js';
import { IncidentNote } from './entities/incident-note.entity.js';
import { Incident } from './entities/incident.entity.js';
import { IncidentEvidenceService } from './incident-evidence.service.js';
import { IncidentsController } from './incidents.controller.js';
import { IncidentsService } from './incidents.service.js';
import { SimilarIncidentsService } from './similar-incidents.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Incident, IncidentNote, IncidentLink]),
    ProjectsModule,
    ErrorsModule,
    TracesModule,
    DeploymentsModule,
    LogsModule,
    MetricsModule,
  ],
  controllers: [IncidentsController],
  providers: [
    IncidentsService,
    IncidentEvidenceService,
    SimilarIncidentsService,
  ],
  exports: [IncidentsService, IncidentEvidenceService, SimilarIncidentsService],
})
export class IncidentsModule {}
