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
import { WhatsappSession } from './whatsapp-session.model';

@Entity('wa_auth_state')
@Index('idx_wa_auth_state_session_type_key', ['sessionId', 'type', 'keyId'], {
  unique: true,
})
export class WaAuthState {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id!: number;

  @Column('bigint', { name: 'session_id' })
  sessionId!: number;

  @Column('varchar', { name: 'type', length: 100 })
  type!: string;

  @Column('varchar', { name: 'key_id', length: 255 })
  keyId!: string;

  @Column({ name: 'data', type: 'jsonb' })
  data!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => WhatsappSession, (session) => session.authStates, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session!: WhatsappSession;
}
