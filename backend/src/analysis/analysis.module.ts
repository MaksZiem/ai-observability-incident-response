import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidentsModule } from '../incidents/incidents.module.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { AnalysisModel } from './analysis-model.js';
import { AnalysisController } from './analysis.controller.js';
import { AnalysisService } from './analysis.service.js';
import { IncidentAnalysis } from './entities/incident-analysis.entity.js';
import { GeminiAnalysisModel } from './gemini-analysis.model.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([IncidentAnalysis]),
    IncidentsModule,
    ProjectsModule,
  ],
  controllers: [AnalysisController],
  providers: [
    AnalysisService,
    { provide: AnalysisModel, useClass: GeminiAnalysisModel },
  ],
})
export class AnalysisModule {}
