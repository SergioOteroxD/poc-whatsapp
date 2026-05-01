import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { EWhatsappSessionStatus } from '../../commons/enum/whatsapp/whatsapp-session-status.enum';
import { WhatsappSession } from './models/whatsapp-session.model';

@Injectable()
export class WhatsappSessionDriver {
  private readonly sessionRepo: Repository<WhatsappSession>;

  constructor(private readonly dataSource: DataSource) {
    this.sessionRepo = this.dataSource.getRepository(WhatsappSession);
  }

  async create(
    tenantId: number,
    phoneNumber: string,
  ): Promise<WhatsappSession> {
    const session = this.sessionRepo.create({ tenantId, phoneNumber });
    return this.sessionRepo.save(session);
  }

  async findById(id: number): Promise<WhatsappSession | null> {
    return this.sessionRepo.findOne({ where: { id } });
  }

  async findOne(
    tenantId: number,
    phoneNumber: string,
  ): Promise<WhatsappSession | null> {
    return this.sessionRepo.findOne({ where: { tenantId, phoneNumber } });
  }

  async findAllConnected(): Promise<WhatsappSession[]> {
    return this.sessionRepo.find({
      where: { status: EWhatsappSessionStatus.CONNECTED },
    });
  }

  async updateStatus(
    id: number,
    status: EWhatsappSessionStatus,
    extra?: Partial<
      Pick<
        WhatsappSession,
        'disconnectReason' | 'lastConnectedAt' | 'reconnectCount'
      >
    >,
  ): Promise<void> {
    await this.sessionRepo.update(id, { status, ...extra });
  }
}
