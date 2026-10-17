import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAlertRuleDto } from './dto/create-alert-rule.dto.js';
import { UpdateAlertRuleDto } from './dto/update-alert-rule.dto.js';
import { AlertRule } from './entities/alert-rule.entity.js';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(AlertRule)
    private readonly rulesRepository: Repository<AlertRule>,
  ) {}

  create(
    projectId: string,
    userId: string,
    dto: CreateAlertRuleDto,
  ): Promise<AlertRule> {
    return this.rulesRepository.save(
      this.rulesRepository.create({ ...dto, projectId, createdById: userId }),
    );
  }

  findAll(projectId: string): Promise<AlertRule[]> {
    return this.rulesRepository.find({
      where: { projectId },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(projectId: string, id: string): Promise<AlertRule> {
    const rule = await this.rulesRepository.findOneBy({ id, projectId });

    if (!rule) {
      throw new NotFoundException(`Alert rule ${id} not found`);
    }

    return rule;
  }

  async update(
    projectId: string,
    id: string,
    dto: UpdateAlertRuleDto,
  ): Promise<AlertRule> {
    const rule = await this.findOne(projectId, id);
    this.rulesRepository.merge(rule, dto);
    return this.rulesRepository.save(rule);
  }

  async remove(projectId: string, id: string): Promise<void> {
    const rule = await this.findOne(projectId, id);
    await this.rulesRepository.remove(rule);
  }
}
