import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { EWhatsappMessageDirection } from '../../commons/enum/whatsapp/whatsapp-message-direction.enum';
import { EWhatsappMessageStatus } from '../../commons/enum/whatsapp/whatsapp-message-status.enum';
import { EWhatsappMessageType } from '../../commons/enum/whatsapp/whatsapp-message-type.enum';
import { WhatsappMessage } from './models/whatsapp-message.model';

export interface ISaveMessageInput {
  sessionId: number;
  waMessageId: string;
  remoteJid: string;
  fromMe: boolean;
  participant: string | null;
  direction: EWhatsappMessageDirection;
  messageType: EWhatsappMessageType;
  status: EWhatsappMessageStatus;
  body: string | null;
  rawPayload: Record<string, unknown>;
  timestampWa: Date;
}

@Injectable()
export class WhatsappMessageDriver {
  private readonly messageRepo: Repository<WhatsappMessage>;

  constructor(private readonly dataSource: DataSource) {
    this.messageRepo = this.dataSource.getRepository(WhatsappMessage);
  }

  async saveIfNotExists(input: ISaveMessageInput): Promise<WhatsappMessage> {
    const existing = await this.messageRepo.findOne({
      where: {
        sessionId: input.sessionId,
        waMessageId: input.waMessageId,
        remoteJid: input.remoteJid,
      },
    });
    if (existing) return existing;

    const msg = this.messageRepo.create(input);
    return this.messageRepo.save(msg);
  }
}
