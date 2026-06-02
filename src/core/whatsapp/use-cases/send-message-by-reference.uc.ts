import { Injectable } from '@nestjs/common';
import { ResponseBase } from '../../common/entity/response-base.model';
import { RESPONSE_CODE } from '../../../commons/response-codes/general-codes';
import { TenantDriver } from '../../../drivers/auth/tenant.driver';
import { WhatsappSessionDriver } from '../../../drivers/whatsapp/whatsapp-session.driver';
import { WhatsappSocketDriver } from '../../../drivers/whatsapp/whatsapp-socket.driver';
import { EWhatsappSessionStatus } from '../../../commons/enum/whatsapp/whatsapp-session-status.enum';

export interface ISendMessageByReferenceInput {
  tenantId: number;
  referenceId: string;
  jid: string;
  message: string;
}

@Injectable()
export class SendMessageByReferenceUseCase {
  constructor(
    private readonly tenantDriver: TenantDriver,
    private readonly sessionDriver: WhatsappSessionDriver,
    private readonly socketDriver: WhatsappSocketDriver,
  ) {}

  async execute(input: ISendMessageByReferenceInput): Promise<ResponseBase> {
    try {
      const tenant = await this.tenantDriver.findOne({
        referenceId: input.referenceId,
      });
      if (!tenant) {
        return new ResponseBase(RESPONSE_CODE.NOT_FOUND);
      }

      if (tenant.id !== input.tenantId) {
        return new ResponseBase(RESPONSE_CODE.FORBIDDEN);
      }

      const [sessions] = await this.sessionDriver.findAll({
        tenantId: tenant.id,
        status: EWhatsappSessionStatus.CONNECTED,
        page: 1,
        limit: 1,
      });

      if (sessions.length == 0) {
        return new ResponseBase(RESPONSE_CODE.ERROR, {
          error: 'El tenant no tiene ninguna sesión activa de WhatsApp.',
        } as any);
      }

      const session = sessions[0];

      await this.socketDriver.sendMessage(session.id, input.jid, input.message);

      return new ResponseBase(RESPONSE_CODE.QUERY_OK, { sent: true });
    } catch (error) {
      return new ResponseBase(RESPONSE_CODE.ERROR, {
        error: (error as Error)?.message,
      } as any);
    }
  }
}
