import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { CollaboratorDriver } from '../../../drivers/auth/collaborator.driver';
import { CollaboratorSessionDriver } from '../../../drivers/auth/collaborator-session.driver';
import { ResponseBase } from '../../common/entity/response-base.model';
import { RESPONSE_CODE } from '../../../commons/response-codes/general-codes';
import { EAuthCollaboratorStatus } from '../../../commons/enum/auth/collaborator-status.enum';
import { IjwtPayload } from '../entity/collaborator.entity';
import {
  IloginCollaborator,
  IloginCollaboratorResult,
} from '../entity/collaborator-login.entity';

const REFRESH_TOKEN_EXPIRY_DAYS = 7;

@Injectable()
export class LoginCollaboratorUseCase {
  constructor(
    private readonly collaboratorDriver: CollaboratorDriver,
    private readonly collaboratorSessionDriver: CollaboratorSessionDriver,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: IloginCollaborator): Promise<ResponseBase> {
    try {
      // 1. Buscar colaborador por tenantId + email
      const collaborator = await this.collaboratorDriver.findByEmail(
        input.tenantId,
        input.email,
      );

      if (!collaborator) {
        return new ResponseBase(RESPONSE_CODE.UNAUTHORIZED);
      }

      // 2. Rechazar si está SUSPENDED
      if (collaborator.status === EAuthCollaboratorStatus.SUSPENDED) {
        return new ResponseBase(RESPONSE_CODE.UNAUTHORIZED);
      }

      // 3. Verificar password con argon2
      const passwordValid = await argon2.verify(
        collaborator.password,
        input.password,
      );
      if (!passwordValid) {
        return new ResponseBase(RESPONSE_CODE.UNAUTHORIZED);
      }

      // 4. Firmar accessToken (15 min — usa expiresIn por defecto del JwtModule)
      const jwtPayload: IjwtPayload = {
        collaboratorId: Number(collaborator.id),
        tenantId: Number(collaborator.tenantId),
        role: collaborator.role,
      };
      const accessToken = this.jwtService.sign(jwtPayload);

      // 5. Generar refreshToken opaco y hashear con argon2
      const refreshToken = crypto.randomBytes(40).toString('hex');
      const refreshTokenHash = await argon2.hash(refreshToken, {
        type: argon2.argon2id,
      });

      // 6. Calcular expiresAt para la sesión (7 días)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

      // 7. Persistir sesión en CollaboratorSession
      await this.collaboratorSessionDriver.create({
        collaboratorId: Number(collaborator.id),
        refreshTokenHash,
        expiresAt,
        deviceInfo: input.deviceInfo ?? null,
        ipAddress: input.ipAddress ?? null,
      });

      // 8. Retornar tokens
      const result: IloginCollaboratorResult = {
        accessToken,
        refreshToken,
      };

      return new ResponseBase<IloginCollaboratorResult>(
        RESPONSE_CODE.QUERY_OK,
        result,
      );
    } catch (error) {
      return new ResponseBase(RESPONSE_CODE.ERROR, {
        error: (error as Error)?.message,
      });
    }
  }
}
