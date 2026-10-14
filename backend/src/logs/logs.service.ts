import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLogDto } from './dto/create-log.dto.js';
import { Log } from './entities/log.entity.js';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Log) private readonly logsRepository: Repository<Log>,
  ) {}

  async createMany(projectId: string, dtos: CreateLogDto[]): Promise<void> {
    const receivedAt = new Date();

    const logs = dtos.map((dto) =>
      this.logsRepository.create({
        ...dto,
        projectId,
        timestamp: dto.timestamp ? new Date(dto.timestamp) : receivedAt,
      }),
    );

    await this.logsRepository.save(logs);
  }
}
