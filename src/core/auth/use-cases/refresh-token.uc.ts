import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { CollaboratorSessionDriver } from '../../../drivers/auth/collaborator-session.driver';
import { CollaboratorDriver } from '../../../drivers/auth/collaborator.driver';
import { ResponseBase } from '../../common/entity/response-base.model';
import { RESPONSE_CODE } from '../../../commons/response-codes/general-codes';
import { IjwtPayload } from '../entity/collaborator.entity';
import { IrefreshTokenResult } from '../entity/refresh-token.entity';

const REFRESH_TOKEN_EXPIRY_DAYS = 7;

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly collaboratorSessionDriver: CollaboratorSessionDriver,
    private readonly collaboratorDriver: CollaboratorDriver,
    private readonly jwtService: JwtService,
  ) {}

  async execute(refreshToken: string): Promise<ResponseBase> {
    try {
      // 1. Compute deterministic SHA-256 hash to look up session
      const refreshTokenHash = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');

      // 2. Find session by refreshTokenHash
      const session = await this.collaboratorSessionDriver.findOne({
        refreshTokenHash,
      });

      if (!session) {
        return new ResponseBase(RESPONSE_CODE.UNAUTHORIZED);
      }

      // 3. Reject if already revoked
      if (session.isRevoked) {
        return new ResponseBase(RESPONSE_CODE.UNAUTHORIZED);
      }

      // 4. Reject if expired
      if (new Date() > new Date(session.expiresAt)) {
        return new ResponseBase(RESPONSE_CODE.UNAUTHORIZED);
      }

      // 5. Revoke the old session BEFORE issuing new tokens (rotation)
      await this.collaboratorSessionDriver.revoke(Number(session.id));

      // 6. Update lastUsedAt on the old session
      await this.collaboratorSessionDriver.updateLastUsed(Number(session.id));

      // 7. Load collaborator to build JWT payload
      const collaborator = await this.collaboratorDriver.findById(
        Number(session.collaboratorId),
      );

      if (!collaborator) {
        return new ResponseBase(RESPONSE_CODE.UNAUTHORIZED);
      }

      // 8. Sign new accessToken
      const jwtPayload: IjwtPayload = {
        collaboratorId: Number(collaborator.id),
        tenantId: Number(collaborator.tenantId),
        role: collaborator.role,
      };
      const accessToken = this.jwtService.sign(jwtPayload);

      // 9. Generate new opaque refreshToken and its SHA-256 hash
      const newRawToken = crypto.randomBytes(40).toString('hex');
      const newRefreshTokenHash = crypto
        .createHash('sha256')
        .update(newRawToken)
        .digest('hex');

      // 10. Calculate new expiresAt (7 days)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

      // 11. Persist new session
      await this.collaboratorSessionDriver.create({
        collaboratorId: Number(collaborator.id),
        refreshTokenHash: newRefreshTokenHash,
        expiresAt,
        deviceInfo: session.deviceInfo,
        ipAddress: session.ipAddress,
      });

      const result: IrefreshTokenResult = {
        accessToken,
        refreshToken: newRawToken,
      };

      return new ResponseBase<IrefreshTokenResult>(RESPONSE_CODE.QUERY_OK, result);
    } catch (error) {
      return new ResponseBase(RESPONSE_CODE.ERROR, {
        error: (error as Error)?.message,
      });
    }
  }
}
