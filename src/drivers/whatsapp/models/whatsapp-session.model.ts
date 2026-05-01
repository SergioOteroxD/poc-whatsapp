/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EWhatsappSessionStatus } from '../../../commons/enum/whatsapp/whatsapp-session-status.enum';
import { WaAuthCreds } from './wa-auth-creds.model';
import { WaAuthState } from './wa-auth-state.model';
import { WhatsappContact } from './whatsapp-contact.model';
import { WhatsappMessage } from './whatsapp-message.model';
import { WhatsappWebhook } from './whatsapp-webhook.model';

@Entity('whatsapp_session')
@Index('idx_whatsapp_session_tenant_id', ['tenantId'])
@Index('idx_whatsapp_session_phone', ['phoneNumber'])
export class WhatsappSession {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id!: number;

  @Column('bigint', { name: 'tenant_id' })
  tenantId!: number;

  @Column('varchar', { name: 'phone_number', length: 50 })
  phoneNumber!: string;

  @Column('varchar', {
    name: 'status',
    length: 50,
    default: EWhatsappSessionStatus.DISCONNECTED,
  })
  status!: EWhatsappSessionStatus;

  @Column('varchar', { name: 'pairing_code', length: 100, nullable: true })
  pairingCode!: string | null;

  @Column('varchar', { name: 'disconnect_reason', length: 255, nullable: true })
  disconnectReason!: string | null;

  @Column('int', { name: 'reconnect_count', default: 0 })
  reconnectCount!: number;

  @Column({ name: 'last_connected_at', type: 'timestamptz', nullable: true })
  lastConnectedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToOne(() => WaAuthCreds, (creds) => creds.session)
  authCreds!: WaAuthCreds;

  @OneToMany(() => WaAuthState, (state) => state.session)
  authStates!: WaAuthState[];

  @OneToMany(() => WhatsappContact, (contact) => contact.session)
  contacts!: WhatsappContact[];

  @OneToMany(() => WhatsappMessage, (message) => message.session)
  messages!: WhatsappMessage[];

  @OneToMany(() => WhatsappWebhook, (webhook) => webhook.session)
  webhooks!: WhatsappWebhook[];
}
