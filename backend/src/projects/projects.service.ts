import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generateApiKey } from './api-key.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { Project } from './entities/project.entity.js';

export interface ProjectWithApiKey {
  project: Project;
  apiKey: string;
}

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
  ) {}

  findAll(userId: string): Promise<Project[]> {
    return this.projectsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Project> {
    const project = await this.projectsRepository.findOneBy({ id, userId });

    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }

    return project;
  }

  async create(
    dto: CreateProjectDto,
    userId: string,
  ): Promise<ProjectWithApiKey> {
    const { key, hash, prefix } = generateApiKey();

    const project = await this.projectsRepository.save(
      this.projectsRepository.create({
        ...dto,
        userId,
        apiKeyHash: hash,
        apiKeyPrefix: prefix,
      }),
    );

    return { project, apiKey: key };
  }

  async update(
    id: string,
    dto: UpdateProjectDto,
    userId: string,
  ): Promise<Project> {
    const project = await this.findOne(id, userId);
    this.projectsRepository.merge(project, dto);
    return this.projectsRepository.save(project);
  }

  async rotateApiKey(id: string, userId: string): Promise<ProjectWithApiKey> {
    const project = await this.findOne(id, userId);
    const { key, hash, prefix } = generateApiKey();

    project.apiKeyHash = hash;
    project.apiKeyPrefix = prefix;

    return {
      project: await this.projectsRepository.save(project),
      apiKey: key,
    };
  }

  async remove(id: string, userId: string): Promise<void> {
    const project = await this.findOne(id, userId);
    await this.projectsRepository.remove(project);
  }
}
