import { Injectable } from '@nestjs/common';
import { TenantDriver } from '../../../drivers/auth/tenant.driver';
import { ResponseBase } from '../../common/entity/response-base.model';
import { RESPONSE_CODE } from '../../../commons/response-codes/general-codes';
import { IcreateTenant, ITenant } from '../entity/tenant.entity';

@Injectable()
export class CreateTenantUseCase {
  constructor(private readonly tenantDriver: TenantDriver) {}

  async execute(input: IcreateTenant): Promise<ResponseBase> {
    try {
      const existing = await this.tenantDriver.findOne([
        {
          email: input.email,
        },
        {
          referenceId: input.referenceId,
        },
      ]);
      if (existing) {
        return new ResponseBase(RESPONSE_CODE.EXIST);
      }

      const tenant = await this.tenantDriver.create(input);
      return new ResponseBase<ITenant>(RESPONSE_CODE.CREATED, tenant);
    } catch (error) {
      return new ResponseBase(RESPONSE_CODE.ERROR, {
        error: (error as Error)?.message,
      });
    }
  }
}
