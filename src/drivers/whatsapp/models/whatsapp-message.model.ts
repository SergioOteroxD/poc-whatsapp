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
import { EWhatsappMessageDirection } from '../../../commons/enum/whatsapp/whatsapp-message-direction.enum';
import { EWhatsappMessageStatus } from '../../../commons/enum/whatsapp/whatsapp-message-status.enum';
import { EWhatsappMessageType } from '../../../commons/enum/whatsapp/whatsapp-message-type.enum';
import { WhatsappSession } from './whatsapp-session.model';

@Entity('whatsapp_message')
@Index(
  'idx_whatsapp_message_unique',
  ['sessionId', 'waMessageId', 'remoteJid'],
  { unique: true },
)
@Index('idx_whatsapp_message_session_jid', ['sessionId', 'remoteJid'])
@Index('idx_whatsapp_message_session_direction', ['sessionId', 'direction'])
@Index('idx_whatsapp_message_timestamp_wa', ['timestampWa'])
export class WhatsappMessage {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id!: number;

  @Column('bigint', { name: 'session_id' })
  sessionId!: number;

  @Column('varchar', { name: 'wa_message_id', length: 255 })
  waMessageId!: string;

  @Column('varchar', { name: 'remote_jid', length: 100 })
  remoteJid!: string;

  @Column('boolean', { name: 'from_me' })
  fromMe!: boolean;

  @Column('varchar', { name: 'participant', length: 100, nullable: true })
  participant!: string | null;

  @Column('varchar', { name: 'direction', length: 50 })
  direction!: EWhatsappMessageDirection;

  @Column('varchar', { name: 'message_type', length: 50 })
  messageType!: EWhatsappMessageType;

  @Column('varchar', {
    name: 'status',
    length: 50,
    default: EWhatsappMessageStatus.PENDING,
  })
  status!: EWhatsappMessageStatus;

  @Column('text', { name: 'body', nullable: true })
  body!: string | null;

  @Column('varchar', { name: 'media_url', length: 500, nullable: true })
  mediaUrl!: string | null;

  @Column('varchar', { name: 'media_mime_type', length: 100, nullable: true })
  mediaMimeType!: string | null;

  @Column('varchar', { name: 'media_filename', length: 255, nullable: true })
  mediaFilename!: string | null;

  @Column({ name: 'raw_payload', type: 'jsonb' })
  rawPayload!: Record<string, unknown>;

  @Column({ name: 'timestamp_wa', type: 'timestamptz' })
  timestampWa!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => WhatsappSession, (session) => session.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session!: WhatsappSession;
}
