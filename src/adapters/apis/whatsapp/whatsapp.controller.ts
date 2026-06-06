import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import type { ItenantContext } from '../../../core/auth/entity/api-key.entity';
import { ResponseHttp } from '../../../core/common/entity/response-http.model';
import { CreateSessionUseCase } from '../../../core/whatsapp/use-cases/create-session.uc';
import { CreateWebhookUseCase } from '../../../core/whatsapp/use-cases/create-webhook.uc';
import { QuerySessionsUseCase } from '../../../core/whatsapp/use-cases/query-sessions.uc';
import { QueryWebhooksUseCase } from '../../../core/whatsapp/use-cases/query-webhooks.uc';
import { SendMessageByReferenceUseCase } from '../../../core/whatsapp/use-cases/send-message-by-reference.uc';
import { SendMessageUseCase } from '../../../core/whatsapp/use-cases/send-message.uc';
import { TenantContext } from '../../decorator/tenant-context.decorator';
import { ApiKeyGuard } from '../../guards/api-key.guard';
import { CreateSessionDto } from './dto/create-session.dto';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { FilterSessionDto } from './dto/filter-session.dto';
import { FilterWebhookDto } from './dto/filter-webhook.dto';
import { SendMessageDto } from './dto/send-message.dto';

@ApiTags('WhatsApp')
@ApiSecurity('x-api-key')
@UseGuards(ApiKeyGuard)
@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private readonly createSessionUseCase: CreateSessionUseCase,
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly sendMessageByReferenceUseCase: SendMessageByReferenceUseCase,
    private readonly querySessionsUseCase: QuerySessionsUseCase,
    private readonly createWebhookUseCase: CreateWebhookUseCase,
    private readonly queryWebhooksUseCase: QueryWebhooksUseCase,
  ) {}

  @Get('session')
  @ApiOperation({
    summary:
      'Lista sesiones de WhatsApp con filtro opcional por status y teléfono',
  })
  async getSessions(
    @TenantContext() tenant: ItenantContext,
    @Query() filter: FilterSessionDto,
  ): Promise<ResponseHttp> {
    const result = await this.querySessionsUseCase.execute({
      ...filter,
      tenantId: tenant.tenantId,
    });
    return new ResponseHttp(result.status, result);
  }

  @Post('session')
  @ApiOperation({
    summary: 'Crea una sesión de WhatsApp y retorna el QR para escanear',
  })
  async createSession(
    @TenantContext() tenant: ItenantContext,
    @Body() dto: CreateSessionDto,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.createSessionUseCase.execute({
      tenantId: tenant.tenantId,
      phoneNumber: dto.phoneNumber,
    });

    if (result.status !== 201 || !result.data?.qr) {
      res.status(result.status).json(new ResponseHttp(result.status, result));
      return;
    }

    const buffer = Buffer.from(result.data.qr, 'base64');
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('X-Session-Id', String(result.data.sessionId));
    res.status(200).send(buffer);
  }

  @Post('session/:sessionId/message')
  @ApiOperation({
    summary: 'Envía un mensaje de texto por una sesión activa de WhatsApp',
  })
  async sendMessage(
    @TenantContext() tenant: ItenantContext,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Body() dto: SendMessageDto,
  ): Promise<ResponseHttp> {
    const result = await this.sendMessageUseCase.execute({
      sessionId,
      tenantId: tenant.tenantId,
      ...dto,
    });
    return new ResponseHttp(result.status, result);
  }

  @Post('by-reference/:referenceId/message')
  @ApiOperation({
    summary:
      'Envía un mensaje usando el referenceId del tenant; usa su primera sesión CONNECTED automáticamente',
  })
  async sendMessageByReference(
    @TenantContext() tenant: ItenantContext,
    @Param('referenceId') referenceId: string,
    @Body() dto: SendMessageDto,
  ): Promise<ResponseHttp> {
    const result = await this.sendMessageByReferenceUseCase.execute({
      tenantId: tenant.tenantId,
      referenceId,
      ...dto,
    });
    return new ResponseHttp(result.status, result);
  }

  @Post('session/:sessionId/webhook')
  @ApiOperation({ summary: 'Registra un webhook en una sesión de WhatsApp' })
  async createWebhook(
    @TenantContext() tenant: ItenantContext,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Body() dto: CreateWebhookDto,
  ): Promise<ResponseHttp> {
    const result = await this.createWebhookUseCase.execute({
      sessionId,
      tenantId: tenant.tenantId,
      ...dto,
    });
    return new ResponseHttp(result.status, result);
  }

  @Get('session/:sessionId/webhook')
  @ApiOperation({ summary: 'Lista los webhooks registrados en una sesión' })
  async getWebhooks(
    @TenantContext() tenant: ItenantContext,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Query() filter: FilterWebhookDto,
  ): Promise<ResponseHttp> {
    const result = await this.queryWebhooksUseCase.execute({
      sessionId,
      tenantId: tenant.tenantId,
      ...filter,
    });
    return new ResponseHttp(result.status, result);
  }
}
