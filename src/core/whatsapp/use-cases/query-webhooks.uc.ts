import { Injectable } from '@nestjs/common';
import { RESPONSE_CODE } from '../../../commons/response-codes/general-codes';
import { WhatsappSessionDriver } from '../../../drivers/whatsapp/whatsapp-session.driver';
import { WhatsappWebhookDriver } from '../../../drivers/whatsapp/whatsapp-webhook.driver';
import {
  ResponseBase,
  ResponseQuery,
} from '../../common/entity/response-base.model';
import { IwhatsappWebhookFilter } from '../entity/whatsapp-webhook.entity';

@Injectable()
export class QueryWebhooksUseCase {
  constructor(
    private readonly webhookDriver: WhatsappWebhookDriver,
    private readonly sessionDriver: WhatsappSessionDriver,
  ) {}

  async execute(
    filter: IwhatsappWebhookFilter,
  ): Promise<ResponseBase | ResponseQuery> {
    try {
      if (filter.tenantId !== undefined) {
        const session = await this.sessionDriver.findById(filter.sessionId);
        if (!session || session.tenantId !== filter.tenantId) {
          return new ResponseBase(RESPONSE_CODE.FORBIDDEN);
        }
      }

      const page = filter.page ?? 1;
      const limit = filter.limit ?? 10;
      const [data, total] = await this.webhookDriver.findAll({
        ...filter,
        page,
        limit,
      });

      if (!data || data.length === 0) {
        return new ResponseBase(RESPONSE_CODE.NOT_FOUND);
      }

      return new ResponseQuery(RESPONSE_CODE.QUERY_OK, data, page, limit, total);
    } catch (error) {
      return new ResponseBase(RESPONSE_CODE.ERROR, {
        error: (error as Error)?.message,
      } as any);
    }
  }
}
