import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Project } from '../../projects/entities/project.entity.js';

export const CurrentProject = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Project =>
    context.switchToHttp().getRequest<{ project: Project }>().project,
);
