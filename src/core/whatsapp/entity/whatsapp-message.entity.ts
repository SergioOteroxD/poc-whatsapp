import { EWhatsappMessageDirection } from '../../../commons/enum/whatsapp/whatsapp-message-direction.enum';
import { EWhatsappMessageStatus } from '../../../commons/enum/whatsapp/whatsapp-message-status.enum';
import { EWhatsappMessageType } from '../../../commons/enum/whatsapp/whatsapp-message-type.enum';

export interface IWhatsappMessage {
  id: number;
  sessionId: number;
  waMessageId: string;
  remoteJid: string;
  fromMe: boolean;
  participant: string | null;
  direction: EWhatsappMessageDirection;
  messageType: EWhatsappMessageType;
  status: EWhatsappMessageStatus;
  body: string | null;
  mediaUrl: string | null;
  mediaMimeType: string | null;
  mediaFilename: string | null;
  rawPayload: Record<string, unknown>;
  timestampWa: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IwhatsappMessageFilter {
  sessionId?: number;
  remoteJid?: string;
  direction?: EWhatsappMessageDirection;
  status?: EWhatsappMessageStatus;
  messageType?: EWhatsappMessageType;
  fromMe?: boolean;
  timestampFrom?: Date;
  timestampTo?: Date;
  page?: number;
  limit?: number;
}
