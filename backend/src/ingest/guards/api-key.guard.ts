import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { Project } from '../../projects/entities/project.entity.js';
import { ProjectsService } from '../../projects/projects.service.js';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly projectsService: ProjectsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { project?: Project }>();
    const apiKey = request.header('x-api-key');

    if (!apiKey) {
      throw new UnauthorizedException('Missing API key');
    }

    const project = await this.projectsService.findByApiKey(apiKey);

    if (!project) {
      throw new UnauthorizedException('Invalid API key');
    }

    request.project = project;
    return true;
  }
}
