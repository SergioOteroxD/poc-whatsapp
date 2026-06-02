import { Injectable } from '@nestjs/common';
import { ResponseBase } from '../../common/entity/response-base.model';
import { RESPONSE_CODE } from '../../../commons/response-codes/general-codes';
import { WhatsappSessionDriver } from '../../../drivers/whatsapp/whatsapp-session.driver';
import { WhatsappSocketDriver } from '../../../drivers/whatsapp/whatsapp-socket.driver';

export interface ISendMessageInput {
  sessionId: number;
  tenantId: number;
  jid: string;
  message: string;
}

@Injectable()
export class SendMessageUseCase {
  constructor(
    private readonly sessionDriver: WhatsappSessionDriver,
    private readonly socketDriver: WhatsappSocketDriver,
  ) {}

  async execute(input: ISendMessageInput): Promise<ResponseBase> {
    try {
      const session = await this.sessionDriver.findById(input.sessionId);
      if (!session) {
        return new ResponseBase(RESPONSE_CODE.NOT_FOUND);
      }

      if (session.tenantId !== input.tenantId) {
        return new ResponseBase(RESPONSE_CODE.FORBIDDEN);
      }

      if (!this.socketDriver.isConnected(input.sessionId)) {
        return new ResponseBase(RESPONSE_CODE.ERROR, {
          error:
            'La sesión no tiene una conexión activa. Escanea el QR primero.',
        } as any);
      }

      await this.socketDriver.sendMessage(
        input.sessionId,
        input.jid,
        input.message,
      );

      return new ResponseBase(RESPONSE_CODE.QUERY_OK, { sent: true });
    } catch (error) {
      return new ResponseBase(RESPONSE_CODE.ERROR, {
        error: (error as Error)?.message,
      } as any);
    }
  }
}
