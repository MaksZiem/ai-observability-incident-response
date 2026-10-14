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

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

@Entity('logs')
@Index(['projectId', 'timestamp'])
@Index(['projectId', 'traceId'])
export class Log {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ type: 'varchar', length: 100 })
  service: string;

  @Column({ type: 'enum', enum: LogLevel })
  level: LogLevel;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'timestamptz' })
  timestamp: Date;

  @Column({ type: 'varchar', length: 64, nullable: true })
  traceId: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  spanId: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  requestId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  endpoint: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  attributes: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz' })
  receivedAt: Date;
}
