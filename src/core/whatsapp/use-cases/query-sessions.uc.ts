import { Injectable } from '@nestjs/common';
import { RESPONSE_CODE } from '../../../commons/response-codes/general-codes';
import { WhatsappSessionDriver } from '../../../drivers/whatsapp/whatsapp-session.driver';
import {
  ResponseBase,
  ResponseQuery,
} from '../../common/entity/response-base.model';
import { IwhatsappSessionFilter } from '../entity/whatsapp-session.entity';

@Injectable()
export class QuerySessionsUseCase {
  constructor(private readonly sessionDriver: WhatsappSessionDriver) {}

  async execute(
    filter: IwhatsappSessionFilter,
  ): Promise<ResponseBase | ResponseQuery> {
    try {
      const page = filter.page ?? 1;
      const limit = filter.limit ?? 10;
      const [data, total] = await this.sessionDriver.findAll({
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