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

export enum SpanStatus {
  OK = 'ok',
  ERROR = 'error',
}

@Entity('spans')
@Index(['projectId', 'traceId'])
@Index(['projectId', 'startTime'])
export class Span {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ type: 'varchar', length: 64 })
  traceId: string;

  @Column({ type: 'varchar', length: 64 })
  spanId: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  parentSpanId: string | null;

  @Column({ type: 'varchar', length: 100 })
  service: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'enum', enum: SpanStatus, default: SpanStatus.OK })
  status: SpanStatus;

  @Column({ type: 'timestamptz' })
  startTime: Date;

  @Column({ type: 'double precision' })
  durationMs: number;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  attributes: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz' })
  receivedAt: Date;
}
