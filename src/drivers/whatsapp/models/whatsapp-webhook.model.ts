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
import { EWhatsappWebhookEvent } from '../../../commons/enum/whatsapp/whatsapp-webhook-event.enum';
import { WhatsappSession } from './whatsapp-session.model';
import { WhatsappWebhookLog } from './whatsapp-webhook-log.model';

@Entity('whatsapp_webhook')
@Index('idx_whatsapp_webhook_session_id', ['sessionId'])
export class WhatsappWebhook {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id!: number;

  @Column('bigint', { name: 'session_id' })
  sessionId!: number;

  @Column('varchar', { name: 'url', length: 500 })
  url!: string;

  @Column('varchar', { name: 'secret', length: 255, nullable: true })
  secret!: string | null;

  @Column({ name: 'events', type: 'text', array: true })
  events!: EWhatsappWebhookEvent[];

  @Column('boolean', { name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => WhatsappSession, (session) => session.webhooks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session!: WhatsappSession;

  @OneToMany(() => WhatsappWebhookLog, (log) => log.webhook)
  logs!: WhatsappWebhookLog[];
}
