import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from '../projects/projects.module.js';
import { DeploymentsController } from './deployments.controller.js';
import { DeploymentsService } from './deployments.service.js';
import { Deployment } from './entities/deployment.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Deployment]), ProjectsModule],
  controllers: [DeploymentsController],
  providers: [DeploymentsService],
  exports: [DeploymentsService],
})
export class DeploymentsModule {}
