import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EAuthCollaboratorRole } from '../../../commons/enum/auth/collaborator-role.enum';
import { EAuthCollaboratorStatus } from '../../../commons/enum/auth/collaborator-status.enum';
import { Tenant } from './tenant.model';
import { CollaboratorSession } from './collaborator-session.model';

@Entity('collaborator')
@Index('idx_collaborator_tenant_id', ['tenantId'])
@Index('idx_collaborator_tenant_email', ['tenantId', 'email'], { unique: true })
export class Collaborator {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id!: number;

  @Column('bigint', { name: 'tenant_id' })
  tenantId!: number;

  @Column('varchar', { name: 'email', length: 255 })
  email!: string;

  @Column('varchar', { name: 'password', length: 255 })
  password!: string;

  @Column('varchar', { name: 'name', length: 255 })
  name!: string;

  @Column('varchar', {
    name: 'role',
    length: 50,
    default: EAuthCollaboratorRole.AGENT,
  })
  role!: EAuthCollaboratorRole;

  @Column('varchar', {
    name: 'status',
    length: 50,
    default: EAuthCollaboratorStatus.ACTIVE,
  })
  status!: EAuthCollaboratorStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @OneToMany(() => CollaboratorSession, (session) => session.collaborator)
  sessions!: CollaboratorSession[];
}
