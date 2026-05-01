import { EWhatsappSessionStatus } from '../../../commons/enum/whatsapp/whatsapp-session-status.enum';

export interface IWhatsappSession {
  id: number;
  tenantId: number;
  phoneNumber: string;
  status: EWhatsappSessionStatus;
  pairingCode: string | null;
  disconnectReason: string | null;
  reconnectCount: number;
  lastConnectedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IwhatsappSessionFilter {
  tenantId?: number;
  phoneNumber?: string;
  status?: EWhatsappSessionStatus;
  page?: number;
  limit?: number;
}
