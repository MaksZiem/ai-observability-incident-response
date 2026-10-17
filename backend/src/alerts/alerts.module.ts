import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidentsModule } from '../incidents/incidents.module.js';
import { MetricsModule } from '../metrics/metrics.module.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { AlertEvaluatorService } from './alert-evaluator.service.js';
import { AlertsController } from './alerts.controller.js';
import { AlertsService } from './alerts.service.js';
import { AlertRule } from './entities/alert-rule.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([AlertRule]),
    ProjectsModule,
    MetricsModule,
    IncidentsModule,
  ],
  controllers: [AlertsController],
  providers: [AlertsService, AlertEvaluatorService],
})
export class AlertsModule {}
