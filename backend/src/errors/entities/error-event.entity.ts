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
import { ErrorGroup } from './error-group.entity.js';

@Entity('error_events')
@Index(['groupId', 'timestamp'])
@Index(['projectId', 'traceId'])
export class ErrorEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  groupId: string;

  @ManyToOne(() => ErrorGroup, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupId' })
  group: ErrorGroup;

  @Column({ type: 'varchar', length: 100 })
  service: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'text', nullable: true })
  stackTrace: string | null;

  @Column({ type: 'timestamptz' })
  timestamp: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  endpoint: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  traceId: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  spanId: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  requestId: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  attributes: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz' })
  receivedAt: Date;
}
