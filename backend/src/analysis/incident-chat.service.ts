import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncidentEvidenceService } from '../incidents/incident-evidence.service.js';
import { IncidentsService } from '../incidents/incidents.service.js';
import { AnalysisModel, ChatModelOutput } from './analysis-model.js';
import { buildEvidenceBlock } from './analysis-prompt.js';
import { buildChatPrompt } from './chat-prompt.js';
import { SendChatMessageDto } from './dto/send-chat-message.dto.js';
import {
  ChatRole,
  IncidentChatMessage,
} from './entities/incident-chat-message.entity.js';

const MAX_HISTORY_MESSAGES = 20;

@Injectable()
export class IncidentChatService {
  private readonly logger = new Logger(IncidentChatService.name);

  constructor(
    @InjectRepository(IncidentChatMessage)
    private readonly messagesRepository: Repository<IncidentChatMessage>,
    private readonly incidentsService: IncidentsService,
    private readonly evidenceService: IncidentEvidenceService,
    private readonly analysisModel: AnalysisModel,
  ) {}

  async findMessages(
    projectId: string,
    incidentId: string,
  ): Promise<IncidentChatMessage[]> {
    const incident = await this.incidentsService.findOne(projectId, incidentId);

    return this.messagesRepository.find({
      where: { incidentId: incident.id },
      relations: { author: true },
      order: { createdAt: 'ASC' },
    });
  }

  async ask(
    projectId: string,
    incidentId: string,
    userId: string,
    dto: SendChatMessageDto,
  ): Promise<IncidentChatMessage[]> {
    const incident = await this.incidentsService.findOne(projectId, incidentId);
    const askedAt = new Date();

    const [timeline, evidence, recent] = await Promise.all([
      this.evidenceService.getTimeline(projectId, incident.id),
      this.evidenceService.getEvidence(projectId, incident.id),
      this.messagesRepository.find({
        where: { incidentId: incident.id },
        order: { createdAt: 'DESC' },
        take: MAX_HISTORY_MESSAGES,
      }),
    ]);

    let output: ChatModelOutput;

    try {
      output = await this.analysisModel.answer(
        buildChatPrompt({
          evidence: buildEvidenceBlock({ incident, timeline, evidence }),
          history: recent.reverse(),
          question: dto.message,
        }),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Chat answer for incident ${incident.id} failed: ${message}`,
      );
      throw new ServiceUnavailableException(
        'The AI assistant is unavailable, try again later',
      );
    }

    return this.messagesRepository.save([
      this.messagesRepository.create({
        incidentId: incident.id,
        role: ChatRole.USER,
        content: dto.message,
        authorId: userId,
        createdAt: askedAt,
      }),
      this.messagesRepository.create({
        incidentId: incident.id,
        role: ChatRole.ASSISTANT,
        content: output.text,
        model: output.model,
        inputTokens: output.inputTokens,
        outputTokens: output.outputTokens,
        createdAt: new Date(),
      }),
    ]);
  }
}
