import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ApiKey } from './models/api-key.model';
import { EAuthApikeyScope } from '../../commons/enum/auth/apikey-scope.enum';

@Injectable()
export class ApiKeyDriver {
  private readonly apiKeyRepo: Repository<ApiKey>;

  constructor(private readonly dataSource: DataSource) {
    this.apiKeyRepo = this.dataSource.getRepository(ApiKey);
  }

  async create(data: {
    tenantId: number;
    name: string;
    keyPrefix: string;
    keyHash: string;
    scopes: EAuthApikeyScope[];
  }): Promise<ApiKey> {
    const apiKey = this.apiKeyRepo.create(data);
    return this.apiKeyRepo.save(apiKey);
  }

  async findByPrefix(keyPrefix: string): Promise<ApiKey | null> {
    return this.apiKeyRepo.findOne({ where: { keyPrefix } });
  }

  async findAllByTenant(tenantId: number): Promise<ApiKey[]> {
    return this.apiKeyRepo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateLastUsed(id: number): Promise<void> {
    await this.apiKeyRepo.update(id, { lastUsedAt: new Date() });
  }

  async revoke(id: number): Promise<void> {
    await this.apiKeyRepo.delete(id);
  }
}
