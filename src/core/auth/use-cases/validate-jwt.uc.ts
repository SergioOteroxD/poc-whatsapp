import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ResponseBase } from '../../common/entity/response-base.model';
import { RESPONSE_CODE } from '../../../commons/response-codes/general-codes';
import {
  IcollaboratorContext,
  IjwtPayload,
} from '../entity/collaborator.entity';

@Injectable()
export class ValidateJwtUseCase {
  constructor(private readonly jwtService: JwtService) {}

  async execute(input: { token: string }): Promise<ResponseBase> {
    try {
      const payload = await this.jwtService.verifyAsync<IjwtPayload>(
        input.token,
      );

      if (
        payload?.collaboratorId === undefined ||
        payload?.tenantId === undefined ||
        payload?.role === undefined
      ) {
        return new ResponseBase(RESPONSE_CODE.FORBIDDEN);
      }

      return new ResponseBase<IcollaboratorContext>(RESPONSE_CODE.QUERY_OK, {
        collaboratorId: payload.collaboratorId,
        tenantId: payload.tenantId,
        role: payload.role,
      });
    } catch {
      return new ResponseBase(RESPONSE_CODE.FORBIDDEN);
    }
  }
}
