import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { ApiKeyDriver } from '../../../drivers/auth/api-key.driver';
import { TenantDriver } from '../../../drivers/auth/tenant.driver';
import { ResponseBase } from '../../common/entity/response-base.model';
import { RESPONSE_CODE } from '../../../commons/response-codes/general-codes';
import { EAuthApikeyScope } from '../../../commons/enum/auth/apikey-scope.enum';
import { IcreateApiKey, IcreateApiKeyResult } from '../entity/api-key.entity';

@Injectable()
export class CreateApiKeyUseCase {
  constructor(
    private readonly apiKeyDriver: ApiKeyDriver,
    private readonly tenantDriver: TenantDriver,
    private readonly configService: ConfigService,
  ) {}

  async execute(input: IcreateApiKey): Promise<ResponseBase> {
    try {
      const tenant = await this.tenantDriver.findById(input.tenantId);
      if (!tenant) {
        return new ResponseBase(RESPONSE_CODE.NOT_FOUND);
      }

      const envPrefix = this.configService.get<string>('general.API_KEY_PREFIX') ?? 'biz_';
      const keyPrefix = crypto.randomBytes(6).toString('hex');
      const secret = crypto.randomBytes(24).toString('hex');
      const rawKey = `${envPrefix}${keyPrefix}.${secret}`;

      const keyHash = await argon2.hash(rawKey, { type: argon2.argon2id });

      const scopes: EAuthApikeyScope[] = input.scopes ?? [];
      const apiKey = await this.apiKeyDriver.create({
        tenantId: input.tenantId,
        name: input.name,
        keyPrefix,
        keyHash,
        scopes,
      });

      const result: IcreateApiKeyResult = {
        id: apiKey.id,
        tenantId: apiKey.tenantId,
        name: apiKey.name,
        keyPrefix: apiKey.keyPrefix,
        scopes: apiKey.scopes,
        expiresAt: apiKey.expiresAt,
        lastUsedAt: apiKey.lastUsedAt,
        createdAt: apiKey.createdAt,
        updatedAt: apiKey.updatedAt,
        rawKey,
      };

      return new ResponseBase<IcreateApiKeyResult>(RESPONSE_CODE.CREATED, result);
    } catch (error) {
      return new ResponseBase(RESPONSE_CODE.ERROR, { error: (error as Error)?.message });
    }
  }
}
