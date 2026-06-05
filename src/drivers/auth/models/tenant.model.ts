import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EAuthTenantStatus } from '../../../commons/enum/auth/tenant-status.enum';
import { ApiKey } from './api-key.model';
import { WhatsappSession } from '../../whatsapp/models/whatsapp-session.model';

@Entity('tenant')
@Index('idx_tenant_email', ['email'], { unique: true })
export class Tenant {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id!: number;

  @Column('varchar', { name: 'name', length: 255 })
  name!: string;

  @Column('varchar', { name: 'reference_id', length: 255, nullable:true })
  referenceId!: string;

  @Column('varchar', { name: 'email', length: 255, unique: true })
  email!: string;

  @Column('varchar', {
    name: 'status',
    length: 50,
    default: EAuthTenantStatus.ACTIVE,
  })
  status!: EAuthTenantStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => WhatsappSession, (session) => session.tenant)
  sessions!: WhatsappSession[];

  @OneToMany(() => ApiKey, (apiKey) => apiKey.tenant)
  apiKeys!: ApiKey[];
}
