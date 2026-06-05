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
import { Collaborator } from './collaborator.model';

export interface ICollaboratorSessionDeviceInfo {
  userAgent?: string;
  browser?: string;
  os?: string;
  device?: string;
  [key: string]: unknown;
}

@Entity('collaborator_session')
@Index('idx_collaborator_session_collaborator_id', ['collaboratorId'])
export class CollaboratorSession {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id!: number;

  @Column('bigint', { name: 'collaborator_id' })
  collaboratorId!: number;

  @Column('varchar', { name: 'refresh_token_hash', length: 255 })
  refreshTokenHash!: string;

  @Column({ name: 'device_info', type: 'jsonb', nullable: true })
  deviceInfo!: ICollaboratorSessionDeviceInfo | null;

  @Column('varchar', { name: 'ip_address', length: 45, nullable: true })
  ipAddress!: string | null;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'last_used_at', type: 'timestamptz', nullable: true })
  lastUsedAt!: Date | null;

  @Column('boolean', { name: 'is_revoked', default: false })
  isRevoked!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Collaborator, (collaborator) => collaborator.sessions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'collaborator_id' })
  collaborator!: Collaborator;
}
