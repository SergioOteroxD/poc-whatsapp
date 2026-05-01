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
import { EWhatsappWebhookEvent } from '../../../commons/enum/whatsapp/whatsapp-webhook-event.enum';
import { EWhatsappWebhookStatus } from '../../../commons/enum/whatsapp/whatsapp-webhook-status.enum';
import { WhatsappMessage } from './whatsapp-message.model';
import { WhatsappWebhook } from './whatsapp-webhook.model';

@Entity('whatsapp_webhook_log')
@Index('idx_whatsapp_webhook_log_webhook_status', ['webhookId', 'status'])
@Index('idx_whatsapp_webhook_log_next_retry', ['nextRetryAt'], {
  where: "status = 'pending'",
})
export class WhatsappWebhookLog {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id!: number;

  @Column('bigint', { name: 'webhook_id' })
  webhookId!: number;

  @Column('bigint', { name: 'message_id', nullable: true })
  messageId!: number | null;

  @Column('varchar', { name: 'event_type', length: 100 })
  eventType!: EWhatsappWebhookEvent;

  @Column({ name: 'payload', type: 'jsonb' })
  payload!: Record<string, unknown>;

  @Column('int', { name: 'response_status', nullable: true })
  responseStatus!: number | null;

  @Column('text', { name: 'response_body', nullable: true })
  responseBody!: string | null;

  @Column('int', { name: 'attempt_number', default: 1 })
  attemptNumber!: number;

  @Column({ name: 'next_retry_at', type: 'timestamptz', nullable: true })
  nextRetryAt!: Date | null;

  @Column('varchar', {
    name: 'status',
    length: 50,
    default: EWhatsappWebhookStatus.PENDING,
  })
  status!: EWhatsappWebhookStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => WhatsappWebhook, (webhook) => webhook.logs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'webhook_id' })
  webhook!: WhatsappWebhook;

  @ManyToOne(() => WhatsappMessage, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'message_id' })
  message!: WhatsappMessage | null;
}
