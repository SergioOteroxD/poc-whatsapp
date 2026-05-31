import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ResponseHttp } from '../../core/common/entity/response-http.model';
import { CreateSessionUseCase } from '../../core/whatsapp/use-cases/create-session.uc';
import { QuerySessionsUseCase } from '../../core/whatsapp/use-cases/query-sessions.uc';
import { SendMessageUseCase } from '../../core/whatsapp/use-cases/send-message.uc';
import { CreateSessionDto } from './dto/create-session.dto';
import { FilterSessionDto } from './dto/filter-session.dto';
import { SendMessageDto } from './dto/send-message.dto';

@ApiTags('WhatsApp')
@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private readonly createSessionUseCase: CreateSessionUseCase,
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly querySessionsUseCase: QuerySessionsUseCase,
  ) {}

  @Get('session')
  @ApiOperation({
    summary:
      'Lista sesiones de WhatsApp con filtro opcional por status, tenant y teléfono',
  })
  async getSessions(@Query() filter: FilterSessionDto): Promise<ResponseHttp> {
    const result = await this.querySessionsUseCase.execute(filter);
    return new ResponseHttp(result.status, result);
  }

  @Post('session')
  @ApiOperation({
    summary: 'Crea una sesión de WhatsApp y retorna el QR para escanear',
  })
  async createSession(
    @Body() dto: CreateSessionDto,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.createSessionUseCase.execute(dto);

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
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Body() dto: SendMessageDto,
  ): Promise<ResponseHttp> {
    const result = await this.sendMessageUseCase.execute({ sessionId, ...dto });
    return new ResponseHttp(result.status, result);
  }
}
