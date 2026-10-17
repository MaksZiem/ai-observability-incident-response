import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IncidentSeverity } from '../../incidents/entities/incident.entity.js';
import { Project } from '../../projects/entities/project.entity.js';
import { User } from '../../users/entities/user.entity.js';

export enum AlertMetric {
  ERROR_RATE = 'error_rate',
  P95_LATENCY = 'p95_latency',
  REQUEST_COUNT = 'request_count',
}

export enum AlertComparator {
  GREATER_THAN = 'gt',
  LESS_THAN = 'lt',
}

export enum AlertStatus {
  OK = 'ok',
  FIRING = 'firing',
}

@Entity('alert_rules')
@Index(['projectId'])
export class AlertRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'enum', enum: AlertMetric })
  metric: AlertMetric;

  @Column({ type: 'enum', enum: AlertComparator })
  comparator: AlertComparator;

  @Column({ type: 'double precision' })
  threshold: number;

  @Column({ type: 'int' })
  windowMinutes: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  service: string | null;

  @Column({ default: true })
  createIncident: boolean;

  @Column({
    type: 'enum',
    enum: IncidentSeverity,
    default: IncidentSeverity.HIGH,
  })
  incidentSeverity: IncidentSeverity;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  webhookUrl: string | null;

  @Column({ default: true })
  enabled: boolean;

  @Column({ type: 'enum', enum: AlertStatus, default: AlertStatus.OK })
  status: AlertStatus;

  @Column({ type: 'double precision', nullable: true })
  lastValue: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastEvaluatedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastTriggeredAt: Date | null;

  @Column()
  createdById: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
