import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Incident } from './incident.entity.js';

export enum IncidentLinkKind {
  ERROR_GROUP = 'error_group',
  TRACE = 'trace',
  DEPLOYMENT = 'deployment',
  LOG = 'log',
}

@Entity('incident_links')
@Unique(['incidentId', 'kind', 'targetId'])
export class IncidentLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  incidentId: string;

  @ManyToOne(() => Incident, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'incidentId' })
  incident: Incident;

  @Column({ type: 'enum', enum: IncidentLinkKind })
  kind: IncidentLinkKind;

  @Column({ type: 'varchar', length: 64 })
  targetId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
