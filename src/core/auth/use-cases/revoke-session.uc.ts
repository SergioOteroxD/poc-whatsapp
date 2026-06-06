import { Injectable } from '@nestjs/common';
import { CollaboratorSessionDriver } from '../../../drivers/auth/collaborator-session.driver';
import { ResponseBase } from '../../common/entity/response-base.model';
import { RESPONSE_CODE } from '../../../commons/response-codes/general-codes';
import { IrevokeSession } from '../entity/revoke-session.entity';

@Injectable()
export class RevokeSessionUseCase {
  constructor(
    private readonly collaboratorSessionDriver: CollaboratorSessionDriver,
  ) {}

  async execute(input: IrevokeSession): Promise<ResponseBase> {
    try {
      // 1. Buscar sesión por ID
      const session = await this.collaboratorSessionDriver.findById(
        input.sessionId,
      );

      // 2. Si no existe, retornar NOT_FOUND
      if (!session) {
        return new ResponseBase(RESPONSE_CODE.NOT_FOUND);
      }

      // 3. Validar que la sesión pertenece al colaborador autenticado
      if (Number(session.collaboratorId) !== input.collaboratorId) {
        return new ResponseBase(RESPONSE_CODE.FORBIDDEN);
      }

      // 4. Idempotente: si ya estaba revocada, retornar éxito sin modificar
      if (session.isRevoked) {
        return new ResponseBase(RESPONSE_CODE.QUERY_OK);
      }

      // 5. Revocar la sesión
      await this.collaboratorSessionDriver.revoke(input.sessionId);

      return new ResponseBase(RESPONSE_CODE.QUERY_OK);
    } catch (error) {
      return new ResponseBase(RESPONSE_CODE.ERROR, {
        error: (error as Error)?.message,
      });
    }
  }
}
