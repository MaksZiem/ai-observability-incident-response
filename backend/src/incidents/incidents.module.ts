import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeploymentsModule } from '../deployments/deployments.module.js';
import { ErrorsModule } from '../errors/errors.module.js';
import { LogsModule } from '../logs/logs.module.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { TracesModule } from '../traces/traces.module.js';
import { IncidentLink } from './entities/incident-link.entity.js';
import { IncidentNote } from './entities/incident-note.entity.js';
import { Incident } from './entities/incident.entity.js';
import { IncidentsController } from './incidents.controller.js';
import { IncidentsService } from './incidents.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Incident, IncidentNote, IncidentLink]),
    ProjectsModule,
    ErrorsModule,
    TracesModule,
    DeploymentsModule,
    LogsModule,
  ],
  controllers: [IncidentsController],
  providers: [IncidentsService],
  exports: [IncidentsService],
})
export class IncidentsModule {}
