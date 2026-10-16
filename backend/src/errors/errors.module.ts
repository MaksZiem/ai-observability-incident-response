import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from '../projects/projects.module.js';
import { ErrorEvent } from './entities/error-event.entity.js';
import { ErrorGroup } from './entities/error-group.entity.js';
import { ErrorsController } from './errors.controller.js';
import { ErrorsService } from './errors.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([ErrorGroup, ErrorEvent]), ProjectsModule],
  controllers: [ErrorsController],
  providers: [ErrorsService],
  exports: [ErrorsService],
})
export class ErrorsModule {}
