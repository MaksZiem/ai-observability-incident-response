import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity.js';

@Entity('deployments')
@Index(['projectId', 'deployedAt'])
export class Deployment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ type: 'varchar', length: 100 })
  version: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  service: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  commitSha: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'timestamptz' })
  deployedAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
