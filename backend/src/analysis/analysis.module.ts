import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidentsModule } from '../incidents/incidents.module.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { AnalysisModel } from './analysis-model.js';
import { AnalysisController } from './analysis.controller.js';
import { AnalysisService } from './analysis.service.js';
import { IncidentAnalysis } from './entities/incident-analysis.entity.js';
import { IncidentChatMessage } from './entities/incident-chat-message.entity.js';
import { GeminiAnalysisModel } from './gemini-analysis.model.js';
import { IncidentChatController } from './incident-chat.controller.js';
import { IncidentChatService } from './incident-chat.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([IncidentAnalysis, IncidentChatMessage]),
    IncidentsModule,
    ProjectsModule,
  ],
  controllers: [AnalysisController, IncidentChatController],
  providers: [
    AnalysisService,
    IncidentChatService,
    { provide: AnalysisModel, useClass: GeminiAnalysisModel },
  ],
})
export class AnalysisModule {}
