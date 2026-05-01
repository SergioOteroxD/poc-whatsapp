import { Injectable } from '@nestjs/common';
import { ResponseBase } from '../../common/entity/response-base.model';
import { RESPONSE_CODE } from '../../../commons/response-codes/general-codes';
import { WhatsappSessionDriver } from '../../../drivers/whatsapp/whatsapp-session.driver';
import { WhatsappSocketDriver } from '../../../drivers/whatsapp/whatsapp-socket.driver';

export interface ICreateSessionInput {
  tenantId: number;
  phoneNumber: string;
}

export interface ICreateSessionResult {
  sessionId: number;
  qr: string;
}

@Injectable()
export class CreateSessionUseCase {
  constructor(
    private readonly sessionDriver: WhatsappSessionDriver,
    private readonly socketDriver: WhatsappSocketDriver,
  ) {}

  async execute(
    input: ICreateSessionInput,
  ): Promise<ResponseBase<ICreateSessionResult>> {
    try {
      let session = await this.sessionDriver.findOne(
        input.tenantId,
        input.phoneNumber,
      );
      if (!session) {
        session = await this.sessionDriver.create(
          input.tenantId,
          input.phoneNumber,
        );
      }

      const qr = await this.socketDriver.initSocket(session);

      return new ResponseBase(RESPONSE_CODE.CREATE_OK, {
        sessionId: session.id,
        qr,
      });
    } catch (error) {
      return new ResponseBase(RESPONSE_CODE.ERROR, {
        error: (error as Error)?.message,
      } as any);
    }
  }
}
