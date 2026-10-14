import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from '../projects/projects.module.js';
import { Log } from './entities/log.entity.js';
import { LogsController } from './logs.controller.js';
import { LogsService } from './logs.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Log]), ProjectsModule],
  controllers: [LogsController],
  providers: [LogsService],
  exports: [LogsService],
})
export class LogsModule {}
