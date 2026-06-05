import { EWhatsappWebhookEvent } from '../../../commons/enum/whatsapp/whatsapp-webhook-event.enum';

export interface IWhatsappWebhook {
  id: number;
  sessionId: number;
  url: string;
  secret: string | null;
  events: EWhatsappWebhookEvent[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IcreateWebhookInput {
  sessionId: number;
  tenantId: number;
  url: string;
  secret?: string | null;
  events: EWhatsappWebhookEvent[];
}

export interface IwhatsappWebhookFilter {
  sessionId: number;
  tenantId?: number;
  isActive?: boolean;
  page?: number;
  limit?: number;
}
