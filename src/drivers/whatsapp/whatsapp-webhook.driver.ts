import { Injectable } from '@nestjs/common';
import { createHmac } from 'crypto';
import { DataSource, Repository } from 'typeorm';
import { EWhatsappWebhookEvent } from '../../commons/enum/whatsapp/whatsapp-webhook-event.enum';
import { EWhatsappWebhookStatus } from '../../commons/enum/whatsapp/whatsapp-webhook-status.enum';
import { WhatsappWebhook } from './models/whatsapp-webhook.model';
import { WhatsappWebhookLog } from './models/whatsapp-webhook-log.model';

interface IwebhookCreateInput {
  sessionId: number;
  url: string;
  secret?: string | null;
  events: EWhatsappWebhookEvent[];
}

interface IwebhookFindAllInput {
  sessionId: number;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class WhatsappWebhookDriver {
  private readonly webhookRepo: Repository<WhatsappWebhook>;
  private readonly logRepo: Repository<WhatsappWebhookLog>;

  constructor(private readonly dataSource: DataSource) {
    this.webhookRepo = this.dataSource.getRepository(WhatsappWebhook);
    this.logRepo = this.dataSource.getRepository(WhatsappWebhookLog);
  }

  async create(data: IwebhookCreateInput): Promise<WhatsappWebhook> {
    const entity = this.webhookRepo.create({
      sessionId: data.sessionId,
      url: data.url,
      secret: data.secret ?? null,
      events: data.events,
    });
    return this.webhookRepo.save(entity);
  }

  async findAll(filter: IwebhookFindAllInput): Promise<[WhatsappWebhook[], number]> {
    const { sessionId, isActive, page = 1, limit = 10 } = filter;
    const qb = this.webhookRepo
      .createQueryBuilder('w')
      .where('w.sessionId = :sessionId', { sessionId });

    if (isActive !== undefined) {
      qb.andWhere('w.isActive = :isActive', { isActive });
    }

    return qb
      .orderBy('w.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
  }

  async findActiveBySessionAndEvent(
    sessionId: number,
    event: EWhatsappWebhookEvent,
  ): Promise<WhatsappWebhook[]> {
    return this.webhookRepo
      .createQueryBuilder('w')
      .where('w.sessionId = :sessionId', { sessionId })
      .andWhere('w.isActive = true')
      .andWhere(':event = ANY(w.events)', { event })
      .getMany();
  }

  async dispatch(
    webhook: WhatsappWebhook,
    messageId: number | null,
    eventType: EWhatsappWebhookEvent,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const log = this.logRepo.create({
      webhookId: webhook.id,
      messageId,
      eventType,
      payload,
      status: EWhatsappWebhookStatus.PENDING,
    });
    await this.logRepo.save(log);

    try {
      const body = JSON.stringify(payload);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (webhook.secret) {
        const sig = createHmac('sha256', webhook.secret)
          .update(body)
          .digest('hex');
        headers['X-Webhook-Signature'] = `sha256=${sig}`;
      }

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body,
        signal: AbortSignal.timeout(10_000),
      });

      const responseBody = await response.text();

      await this.logRepo.update(log.id, {
        responseStatus: response.status,
        responseBody: responseBody.slice(0, 1000),
        status: response.ok
          ? EWhatsappWebhookStatus.SUCCESS
          : EWhatsappWebhookStatus.FAILED,
      });
    } catch (err) {
      await this.logRepo.update(log.id, {
        responseBody: (err as Error).message.slice(0, 1000),
        status: EWhatsappWebhookStatus.FAILED,
      });
    }
  }
}
