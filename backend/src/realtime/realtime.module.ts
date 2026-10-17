import { Global, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { RealtimeController } from './realtime.controller.js';
import { RealtimeService } from './realtime.service.js';

@Global()
@Module({
  imports: [AuthModule, ProjectsModule],
  controllers: [RealtimeController],
  providers: [RealtimeService],
  exports: [RealtimeService],
})
export class RealtimeModule {}
