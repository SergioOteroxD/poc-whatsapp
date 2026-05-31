import { EAuthApikeyScope } from '../../../commons/enum/auth/apikey-scope.enum';

export interface IApiKey {
  id: number;
  tenantId: number;
  name: string;
  keyPrefix: string;
  scopes: EAuthApikeyScope[];
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IcreateApiKey {
  tenantId: number;
  name: string;
  scopes?: EAuthApikeyScope[];
}

export interface IcreateApiKeyResult extends IApiKey {
  rawKey: string;
}

export interface ItenantContext {
  tenantId: number;
  scopes: EAuthApikeyScope[];
}
