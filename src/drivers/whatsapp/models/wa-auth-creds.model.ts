import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WhatsappSession } from './whatsapp-session.model';

@Entity('wa_auth_creds')
export class WaAuthCreds {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id!: number;

  @Column('bigint', { name: 'session_id', unique: true })
  sessionId!: number;

  @Column({ name: 'data', type: 'jsonb' })
  data!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToOne(() => WhatsappSession, (session) => session.authCreds, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session!: WhatsappSession;
}
