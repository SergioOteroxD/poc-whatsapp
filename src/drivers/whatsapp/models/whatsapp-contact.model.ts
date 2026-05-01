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

@Entity('whatsapp_contact')
@Index('idx_whatsapp_contact_session_jid', ['sessionId', 'jid'], {
  unique: true,
})
export class WhatsappContact {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id!: number;

  @Column('bigint', { name: 'session_id' })
  sessionId!: number;

  @Column('varchar', { name: 'jid', length: 100 })
  jid!: string;

  @Column('varchar', { name: 'push_name', length: 255, nullable: true })
  pushName!: string | null;

  @Column('varchar', { name: 'verified_name', length: 255, nullable: true })
  verifiedName!: string | null;

  @Column('boolean', { name: 'is_group', default: false })
  isGroup!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => WhatsappSession, (session) => session.contacts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session!: WhatsappSession;
}
