import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { ApiKeyDriver } from '../../../drivers/auth/api-key.driver';
import { ResponseBase } from '../../common/entity/response-base.model';
import { RESPONSE_CODE } from '../../../commons/response-codes/general-codes';
import { ItenantContext } from '../entity/api-key.entity';

@Injectable()
export class ValidateApiKeyUseCase {
  constructor(
    private readonly apiKeyDriver: ApiKeyDriver,
    private readonly configService: ConfigService,
  ) {}

  async execute(input: { rawKey: string }): Promise<ResponseBase> {
    try {
      const envPrefix =
        this.configService.get<string>('general.API_KEY_PREFIX') ?? 'biz_';
      const keyWithoutPrefix = input.rawKey.startsWith(envPrefix)
        ? input.rawKey.slice(envPrefix.length)
        : input.rawKey;

      const [keyPrefix] = keyWithoutPrefix.split('.');
      if (!keyPrefix) {
        return new ResponseBase(RESPONSE_CODE.FORBIDDEN);
      }

      const apiKey = await this.apiKeyDriver.findByPrefix(keyPrefix);
      if (!apiKey) {
        return new ResponseBase(RESPONSE_CODE.FORBIDDEN);
      }

      const valid = await argon2.verify(apiKey.keyHash, input.rawKey);
      if (!valid) {
        return new ResponseBase(RESPONSE_CODE.FORBIDDEN);
      }

      await this.apiKeyDriver.updateLastUsed(apiKey.id);

      return new ResponseBase<ItenantContext>(RESPONSE_CODE.QUERY_OK, {
        tenantId: apiKey.tenantId,
        scopes: apiKey.scopes,
      });
    } catch (error) {
      return new ResponseBase(RESPONSE_CODE.ERROR, {
        error: (error as Error)?.message,
      });
    }
  }
}
