import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  And,
  FindOperator,
  FindOptionsWhere,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { CreateDeploymentDto } from './dto/create-deployment.dto.js';
import { ListDeploymentsQueryDto } from './dto/list-deployments-query.dto.js';
import { Deployment } from './entities/deployment.entity.js';

@Injectable()
export class DeploymentsService {
  constructor(
    @InjectRepository(Deployment)
    private readonly deploymentsRepository: Repository<Deployment>,
  ) {}

  create(projectId: string, dto: CreateDeploymentDto): Promise<Deployment> {
    const deployment = this.deploymentsRepository.create({
      ...dto,
      projectId,
      deployedAt: dto.deployedAt ? new Date(dto.deployedAt) : new Date(),
    });

    return this.deploymentsRepository.save(deployment);
  }

  findAll(
    projectId: string,
    query: ListDeploymentsQueryDto,
  ): Promise<Deployment[]> {
    const base: FindOptionsWhere<Deployment> = { projectId };
    const range: FindOperator<Date>[] = [];

    if (query.from) range.push(MoreThanOrEqual(new Date(query.from)));
    if (query.to) range.push(LessThanOrEqual(new Date(query.to)));
    if (range.length > 0) base.deployedAt = And(...range);

    const where: FindOptionsWhere<Deployment>[] = query.service
      ? [
          { ...base, service: query.service },
          { ...base, service: IsNull() },
        ]
      : [base];

    return this.deploymentsRepository.find({
      where,
      order: { deployedAt: 'DESC' },
      take: query.limit,
    });
  }
}
