import { EWhatsappWebhookEvent } from '../../../commons/enum/whatsapp/whatsapp-webhook-event.enum';
import { EWhatsappWebhookStatus } from '../../../commons/enum/whatsapp/whatsapp-webhook-status.enum';

export interface IWhatsappWebhookLog {
  id: number;
  webhookId: number;
  messageId: number | null;
  eventType: EWhatsappWebhookEvent;
  payload: Record<string, unknown>;
  responseStatus: number | null;
  responseBody: string | null;
  attemptNumber: number;
  nextRetryAt: Date | null;
  status: EWhatsappWebhookStatus;
  createdAt: Date;
  updatedAt: Date;
}
