import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity.js';

export enum ErrorStatus {
  OPEN = 'open',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
}

@Entity('error_groups')
@Unique(['projectId', 'fingerprint'])
@Index(['projectId', 'lastSeen'])
export class ErrorGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ type: 'varchar', length: 64 })
  fingerprint: string;

  @Column({ type: 'varchar', length: 255 })
  type: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', length: 100 })
  service: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  endpoint: string | null;

  @Column({ type: 'enum', enum: ErrorStatus, default: ErrorStatus.OPEN })
  status: ErrorStatus;

  @Column({ type: 'int', default: 0 })
  occurrences: number;

  @Column({ type: 'timestamptz' })
  firstSeen: Date;

  @Column({ type: 'timestamptz' })
  lastSeen: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
