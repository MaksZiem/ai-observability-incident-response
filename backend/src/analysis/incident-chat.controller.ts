import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import { ProjectsService } from '../projects/projects.service.js';
import { SendChatMessageDto } from './dto/send-chat-message.dto.js';
import { IncidentChatService } from './incident-chat.service.js';

@Controller('projects/:projectId/incidents/:incidentId/chat')
export class IncidentChatController {
  constructor(
    private readonly chatService: IncidentChatService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Get()
  async findMessages(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('incidentId', ParseUUIDPipe) incidentId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.chatService.findMessages(projectId, incidentId);
  }

  @Post()
  async ask(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('incidentId', ParseUUIDPipe) incidentId: string,
    @Body() dto: SendChatMessageDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.chatService.ask(projectId, incidentId, user.sub, dto);
  }
}
