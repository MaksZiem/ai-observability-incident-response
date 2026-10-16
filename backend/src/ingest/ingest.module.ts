import { Module } from '@nestjs/common';
import { ErrorsModule } from '../errors/errors.module.js';
import { LogsModule } from '../logs/logs.module.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { ApiKeyGuard } from './guards/api-key.guard.js';
import { IngestController } from './ingest.controller.js';
import { TracesModule } from '../traces/traces.module.js';

@Module({
  imports: [ProjectsModule, LogsModule, TracesModule, ErrorsModule],
  controllers: [IngestController],
  providers: [ApiKeyGuard],
})
export class IngestModule {}
