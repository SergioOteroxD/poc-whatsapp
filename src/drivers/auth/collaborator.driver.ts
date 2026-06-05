import { Injectable } from '@nestjs/common';
import {
  DataSource,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { Collaborator } from './models/collaborator.model';
import { EAuthCollaboratorRole } from '../../commons/enum/auth/collaborator-role.enum';
import { EAuthCollaboratorStatus } from '../../commons/enum/auth/collaborator-status.enum';

@Injectable()
export class CollaboratorDriver {
  private readonly collaboratorRepo: Repository<Collaborator>;

  constructor(private readonly dataSource: DataSource) {
    this.collaboratorRepo = this.dataSource.getRepository(Collaborator);
  }

  async create(data: {
    tenantId: number;
    email: string;
    password: string;
    name: string;
    role?: EAuthCollaboratorRole;
    status?: EAuthCollaboratorStatus;
  }): Promise<Collaborator> {
    const collaborator = this.collaboratorRepo.create({
      tenantId: data.tenantId,
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role ?? EAuthCollaboratorRole.AGENT,
      status: data.status ?? EAuthCollaboratorStatus.ACTIVE,
    });
    return this.collaboratorRepo.save(collaborator);
  }

  async findById(
    id: number,
    select?: FindOptionsSelect<Collaborator>,
    relations?: FindOptionsRelations<Collaborator>,
  ): Promise<Collaborator | null> {
    return this.collaboratorRepo.findOne({ where: { id }, relations, select });
  }

  async findOne(
    filter: FindOptionsWhere<Collaborator> | FindOptionsWhere<Collaborator>[],
    select?: FindOptionsSelect<Collaborator>,
    relations?: FindOptionsRelations<Collaborator>,
  ): Promise<Collaborator | null> {
    return this.collaboratorRepo.findOne({ where: filter, relations, select });
  }

  async findByEmail(
    tenantId: number,
    email: string,
  ): Promise<Collaborator | null> {
    return this.collaboratorRepo.findOne({ where: { tenantId, email } });
  }

  async findAll(
    page: number,
    limit: number,
    filter?: FindOptionsWhere<Collaborator>,
  ): Promise<[Collaborator[], number]> {
    return this.collaboratorRepo.findAndCount({
      where: filter,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async count(filter?: FindOptionsWhere<Collaborator>): Promise<number> {
    return this.collaboratorRepo.count({ where: filter });
  }

  async update(
    id: number,
    data: Partial<Pick<Collaborator, 'name' | 'password' | 'role' | 'status'>>,
  ): Promise<void> {
    await this.collaboratorRepo.update(id, data);
  }

  async delete(id: number): Promise<void> {
    await this.collaboratorRepo.delete(id);
  }
}
