import { Module } from '@nestjs/common';
import { LogsModule } from '../logs/logs.module.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { ApiKeyGuard } from './guards/api-key.guard.js';
import { IngestController } from './ingest.controller.js';

@Module({
  imports: [ProjectsModule, LogsModule],
  controllers: [IngestController],
  providers: [ApiKeyGuard],
})
export class IngestModule {}
