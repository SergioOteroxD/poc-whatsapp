import { Injectable } from '@nestjs/common';
import { RESPONSE_CODE } from '../../../commons/response-codes/general-codes';
import { WhatsappSessionDriver } from '../../../drivers/whatsapp/whatsapp-session.driver';
import { WhatsappWebhookDriver } from '../../../drivers/whatsapp/whatsapp-webhook.driver';
import { ResponseBase } from '../../common/entity/response-base.model';
import { IcreateWebhookInput } from '../entity/whatsapp-webhook.entity';

@Injectable()
export class CreateWebhookUseCase {
  constructor(
    private readonly webhookDriver: WhatsappWebhookDriver,
    private readonly sessionDriver: WhatsappSessionDriver,
  ) {}

  async execute(input: IcreateWebhookInput): Promise<ResponseBase> {
    try {
      const session = await this.sessionDriver.findById(input.sessionId);
      if (!session) {
        return new ResponseBase(RESPONSE_CODE.NOT_FOUND);
      }

      if (session.tenantId !== input.tenantId) {
        return new ResponseBase(RESPONSE_CODE.FORBIDDEN);
      }

      const webhook = await this.webhookDriver.create(input);
      return new ResponseBase(RESPONSE_CODE.CREATED, webhook as any);
    } catch (error) {
      return new ResponseBase(RESPONSE_CODE.ERROR, {
        error: (error as Error)?.message,
      } as any);
    }
  }
}
