export interface IWhatsappContact {
  id: number;
  sessionId: number;
  jid: string;
  pushName: string | null;
  verifiedName: string | null;
  isGroup: boolean;
  createdAt: Date;
  updatedAt: Date;
}
