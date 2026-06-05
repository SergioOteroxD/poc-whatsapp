import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { ResponseHttp } from '../../core/common/entity/response-http.model';
import { LoginCollaboratorUseCase } from '../../core/auth/use-cases/login-collaborator.uc';
import { RefreshTokenUseCase } from '../../core/auth/use-cases/refresh-token.uc';
import { RevokeSessionUseCase } from '../../core/auth/use-cases/revoke-session.uc';
import { CreateCollaboratorUseCase } from '../../core/auth/use-cases/create-collaborator.uc';
import { LoginCollaboratorDto } from './dto/login-collaborator.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutCollaboratorDto } from './dto/logout-collaborator.dto';
import { CreateCollaboratorDto } from './dto/create-collaborator.dto';
import { JwtAuthGuard } from '../lib/jwt-auth.guard';
import { CollaboratorContext } from '../lib/collaborator-context.decorator';
import type { IcollaboratorContext } from '../../core/auth/entity/collaborator.entity';

@ApiTags('Collaborators')
@Controller()
export class CollaboratorController {
  constructor(
    private readonly loginCollaboratorUseCase: LoginCollaboratorUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly revokeSessionUseCase: RevokeSessionUseCase,
    private readonly createCollaboratorUseCase: CreateCollaboratorUseCase,
  ) {}

  @Post('auth/collaborators/login')
  @ApiOperation({
    summary: 'Login de colaborador',
    description:
      'Autentica un colaborador y retorna un accessToken (15 min) y un refreshToken opaco (7 días).',
  })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso — par de tokens emitido.',
    schema: {
      example: {
        code: 'QUERY_OK',
        message: 'Consulta ejecutada correctamente.',
        status: 200,
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'a1b2c3d4e5f6...',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas o colaborador suspendido.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async login(
    @Body() dto: LoginCollaboratorDto,
    @Req() req: Request,
  ): Promise<ResponseHttp> {
    const forwarded = req.headers['x-forwarded-for'];
    const ipAddress =
      (Array.isArray(forwarded) ? forwarded[0] : forwarded) ??
      req.socket?.remoteAddress ??
      null;
    const userAgent = req.headers['user-agent'] ?? undefined;

    const result = await this.loginCollaboratorUseCase.execute({
      tenantId: dto.tenantId,
      email: dto.email,
      password: dto.password,
      ipAddress: ipAddress ?? null,
      deviceInfo: userAgent ? { userAgent } : null,
    });

    return new ResponseHttp(result.status, result);
  }

  @Post('auth/collaborators/refresh')
  @ApiOperation({
    summary: 'Rotación de refreshToken',
    description:
      'Revoca el refreshToken recibido y emite un nuevo par de tokens (access + refresh).',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens rotados exitosamente.',
    schema: {
      example: {
        code: 'QUERY_OK',
        message: 'Consulta ejecutada correctamente.',
        status: 200,
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'f6e5d4c3b2a1...',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token de refresco inválido, expirado o ya revocado.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async refresh(@Body() dto: RefreshTokenDto): Promise<ResponseHttp> {
    const result = await this.refreshTokenUseCase.execute(dto.refreshToken);
    return new ResponseHttp(result.status, result);
  }

  @Post('auth/collaborators/logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout — revoca la sesión activa del colaborador autenticado',
    description:
      'Invalida la sesión indicada por `sessionId`. Operación idempotente: si la sesión ya estaba revocada retorna 200 igualmente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sesión revocada (o ya estaba revocada).',
    schema: {
      example: {
        code: 'QUERY_OK',
        message: 'Consulta ejecutada correctamente.',
        status: 200,
        data: null,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token JWT ausente o inválido.' })
  @ApiResponse({ status: 403, description: 'La sesión no pertenece al colaborador autenticado.' })
  @ApiResponse({ status: 204, description: 'Sesión no encontrada.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async logout(
    @Body() dto: LogoutCollaboratorDto,
    @CollaboratorContext() ctx: IcollaboratorContext,
  ): Promise<ResponseHttp> {
    const result = await this.revokeSessionUseCase.execute({
      sessionId: dto.sessionId,
      collaboratorId: ctx.collaboratorId,
    });
    return new ResponseHttp(result.status, result);
  }

  @Post('collaborators')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crea un nuevo colaborador dentro del tenant (solo OWNER)',
    description:
      'Permite al colaborador con rol OWNER crear agentes o administradores en su tenant. No se puede asignar el rol OWNER.',
  })
  @ApiResponse({
    status: 201,
    description: 'Colaborador creado exitosamente.',
    schema: {
      example: {
        code: 'CREATED',
        message: 'Recurso creado exitosamente.',
        status: 201,
        data: {
          id: 7,
          tenantId: 1,
          email: 'agente@empresa.com',
          name: 'Juan García',
          role: 'agent',
          status: 'active',
          createdAt: '2024-01-15T10:00:00.000Z',
          updatedAt: '2024-01-15T10:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token JWT ausente o inválido.' })
  @ApiResponse({ status: 403, description: 'El colaborador autenticado no tiene rol OWNER, o intentó asignar rol OWNER.' })
  @ApiResponse({ status: 404, description: 'Ya existe un colaborador con ese email en el tenant.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async createCollaborator(
    @Body() dto: CreateCollaboratorDto,
    @CollaboratorContext() ctx: IcollaboratorContext,
  ): Promise<ResponseHttp> {
    const result = await this.createCollaboratorUseCase.execute({
      tenantId: ctx.tenantId,
      executorRole: ctx.role,
      email: dto.email,
      name: dto.name,
      password: dto.password,
      role: dto.role,
    });
    return new ResponseHttp(result.status, result);
  }
}
