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
import { EAuthApikeyScope } from '../../../commons/enum/auth/apikey-scope.enum';
import { Tenant } from './tenant.model';

@Entity('api_key')
@Index('idx_api_key_prefix', ['keyPrefix'], { unique: true })
@Index('idx_api_key_tenant_id', ['tenantId'])
export class ApiKey {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id!: number;

  @Column('bigint', { name: 'tenant_id' })
  tenantId!: number;

  @Column('varchar', { name: 'name', length: 100 })
  name!: string;

  @Column('varchar', { name: 'key_prefix', length: 20, unique: true })
  keyPrefix!: string;

  @Column('varchar', { name: 'key_hash', length: 255 })
  keyHash!: string;

  @Column({ name: 'scopes', type: 'jsonb', default: () => "'[]'" })
  scopes!: EAuthApikeyScope[];

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt!: Date | null;

  @Column({ name: 'last_used_at', type: 'timestamptz', nullable: true })
  lastUsedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Tenant, (tenant) => tenant.apiKeys, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;
}
