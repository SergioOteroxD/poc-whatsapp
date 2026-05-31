import { Injectable } from '@nestjs/common';
import {
  DataSource,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { Tenant } from './models/tenant.model';
import { EAuthTenantStatus } from '../../commons/enum/auth/tenant-status.enum';

@Injectable()
export class TenantDriver {
  private readonly tenantRepo: Repository<Tenant>;

  constructor(private readonly dataSource: DataSource) {
    this.tenantRepo = this.dataSource.getRepository(Tenant);
  }

  async create(data: {
    name: string;
    email: string;
    referenceId: string;
  }): Promise<Tenant> {
    const tenant = this.tenantRepo.create({
      name: data.name,
      email: data.email,
      referenceId: data.referenceId,
      status: EAuthTenantStatus.ACTIVE,
    });
    return this.tenantRepo.save(tenant);
  }

  async findById(
    id: number,
    select?: FindOptionsSelect<Tenant>,
    relations?: FindOptionsRelations<Tenant>,
  ): Promise<Tenant | null> {
    return this.tenantRepo.findOne({ where: { id }, relations, select });
  }

  async findOne(
    filter: FindOptionsWhere<Tenant> | FindOptionsWhere<Tenant>[],
    select?: FindOptionsSelect<Tenant>,
    relations?: FindOptionsRelations<Tenant>,
  ): Promise<Tenant | null> {
    return this.tenantRepo.findOne({ where: filter, relations, select });
  }

  async findByEmail(email: string): Promise<Tenant | null> {
    return this.tenantRepo.findOne({ where: { email } });
  }

  async findAll(
    page: number,
    limit: number,
    filter?: FindOptionsWhere<Tenant>,
  ): Promise<[Tenant[], number]> {
    return this.tenantRepo.findAndCount({
      where: filter,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: number,
    data: Partial<Pick<Tenant, 'name' | 'status'>>,
  ): Promise<void> {
    await this.tenantRepo.update(id, data);
  }
}
