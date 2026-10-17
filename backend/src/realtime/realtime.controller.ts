import {
  Controller,
  MessageEvent,
  Param,
  ParseUUIDPipe,
  Query,
  Sse,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { Public } from '../auth/decorators/public.decorator.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import { ProjectsService } from '../projects/projects.service.js';
import { RealtimeService } from './realtime.service.js';

@Public()
@Controller('projects/:projectId/stream')
export class RealtimeController {
  constructor(
    private readonly realtimeService: RealtimeService,
    private readonly projectsService: ProjectsService,
    private readonly jwtService: JwtService,
  ) {}

  @Sse()
  async stream(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query('token') token: string | undefined,
  ): Promise<Observable<MessageEvent>> {
    const payload = await this.verifyStreamToken(token);
    await this.projectsService.findOne(projectId, payload.sub);
    return this.realtimeService.stream(projectId);
  }

  private async verifyStreamToken(
    token: string | undefined,
  ): Promise<JwtPayload> {
    if (!token) {
      throw new UnauthorizedException();
    }

    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException();
    }

    if (payload.type !== 'stream') {
      throw new UnauthorizedException();
    }

    return payload;
  }
}
