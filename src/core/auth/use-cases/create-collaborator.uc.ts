import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { CollaboratorDriver } from '../../../drivers/auth/collaborator.driver';
import { ResponseBase } from '../../common/entity/response-base.model';
import { RESPONSE_CODE } from '../../../commons/response-codes/general-codes';
import { EAuthCollaboratorRole } from '../../../commons/enum/auth/collaborator-role.enum';
import {
  IcreateCollaborator,
  IcollaboratorPublic,
} from '../entity/collaborator.entity';

@Injectable()
export class CreateCollaboratorUseCase {
  constructor(private readonly collaboratorDriver: CollaboratorDriver) {}

  async execute(input: IcreateCollaborator): Promise<ResponseBase> {
    try {
      if (input.executorRole !== EAuthCollaboratorRole.OWNER) {
        return new ResponseBase(RESPONSE_CODE.FORBIDDEN);
      }

      if (input.role === EAuthCollaboratorRole.OWNER) {
        return new ResponseBase(RESPONSE_CODE.FORBIDDEN);
      }

      const existing = await this.collaboratorDriver.findByEmail(
        input.tenantId,
        input.email,
      );
      if (existing) {
        return new ResponseBase(RESPONSE_CODE.EXIST);
      }

      const passwordHash = await argon2.hash(input.password);

      const collaborator = await this.collaboratorDriver.create({
        tenantId: input.tenantId,
        email: input.email,
        name: input.name,
        password: passwordHash,
        role: input.role,
      });

      const { password, ...publicData } = collaborator;
      return new ResponseBase<IcollaboratorPublic>(
        RESPONSE_CODE.CREATED,
        publicData as IcollaboratorPublic,
      );
    } catch (error) {
      return new ResponseBase(RESPONSE_CODE.ERROR, {
        error: (error as Error)?.message,
      });
    }
  }
}
