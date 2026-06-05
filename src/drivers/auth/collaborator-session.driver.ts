import { Injectable } from '@nestjs/common';
import {
  DataSource,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import {
  CollaboratorSession,
  ICollaboratorSessionDeviceInfo,
} from './models/collaborator-session.model';

@Injectable()
export class CollaboratorSessionDriver {
  private readonly sessionRepo: Repository<CollaboratorSession>;

  constructor(private readonly dataSource: DataSource) {
    this.sessionRepo = this.dataSource.getRepository(CollaboratorSession);
  }

  async create(data: {
    collaboratorId: number;
    refreshTokenHash: string;
    expiresAt: Date;
    deviceInfo?: ICollaboratorSessionDeviceInfo | null;
    ipAddress?: string | null;
  }): Promise<CollaboratorSession> {
    const session = this.sessionRepo.create({
      collaboratorId: data.collaboratorId,
      refreshTokenHash: data.refreshTokenHash,
      expiresAt: data.expiresAt,
      deviceInfo: data.deviceInfo ?? null,
      ipAddress: data.ipAddress ?? null,
      isRevoked: false,
    });
    return this.sessionRepo.save(session);
  }

  async findById(
    id: number,
    select?: FindOptionsSelect<CollaboratorSession>,
    relations?: FindOptionsRelations<CollaboratorSession>,
  ): Promise<CollaboratorSession | null> {
    return this.sessionRepo.findOne({ where: { id }, relations, select });
  }

  async findOne(
    filter:
      | FindOptionsWhere<CollaboratorSession>
      | FindOptionsWhere<CollaboratorSession>[],
    select?: FindOptionsSelect<CollaboratorSession>,
    relations?: FindOptionsRelations<CollaboratorSession>,
  ): Promise<CollaboratorSession | null> {
    return this.sessionRepo.findOne({ where: filter, relations, select });
  }

  async findAllByCollaborator(
    collaboratorId: number,
  ): Promise<CollaboratorSession[]> {
    return this.sessionRepo.find({
      where: { collaboratorId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateLastUsed(id: number): Promise<void> {
    await this.sessionRepo.update(id, { lastUsedAt: new Date() });
  }

  async revoke(id: number): Promise<void> {
    await this.sessionRepo.update(id, { isRevoked: true });
  }

  async revokeAllByCollaborator(collaboratorId: number): Promise<void> {
    await this.sessionRepo.update({ collaboratorId }, { isRevoked: true });
  }

  async delete(id: number): Promise<void> {
    await this.sessionRepo.delete(id);
  }
}
