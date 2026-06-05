import { Body, Controller, Delete, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { ResponseHttp } from '../../core/common/entity/response-http.model';
import { CreateTenantUseCase } from '../../core/auth/use-cases/create-tenant.uc';
import { CreateApiKeyUseCase } from '../../core/auth/use-cases/create-api-key.uc';
import { LoginCollaboratorUseCase } from '../../core/auth/use-cases/login-collaborator.uc';
import { RevokeSessionUseCase } from '../../core/auth/use-cases/revoke-session.uc';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { LoginCollaboratorDto } from './dto/login-collaborator.dto';
import { JwtAuthGuard } from '../lib/jwt-auth.guard';
import { CollaboratorContext } from '../lib/collaborator-context.decorator';
import { IcollaboratorContext } from '../../core/auth/entity/collaborator.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly createTenantUseCase: CreateTenantUseCase,
    private readonly createApiKeyUseCase: CreateApiKeyUseCase,
    private readonly loginCollaboratorUseCase: LoginCollaboratorUseCase,
    private readonly revokeSessionUseCase: RevokeSessionUseCase,
  ) {}

  @Post('tenants')
  @ApiOperation({ summary: 'Crea un nuevo tenant' })
  async createTenant(@Body() dto: CreateTenantDto): Promise<ResponseHttp> {
    const result = await this.createTenantUseCase.execute(dto);
    return new ResponseHttp(result.status, result);
  }

  @Post('api-keys')
  @ApiOperation({
    summary: 'Genera una API key para un tenant (se muestra una sola vez)',
  })
  async createApiKey(@Body() dto: CreateApiKeyDto): Promise<ResponseHttp> {
    const result = await this.createApiKeyUseCase.execute(dto);
    return new ResponseHttp(result.status, result);
  }

  @Post('collaborators/login')
  @ApiOperation({
    summary: 'Login de colaborador — retorna accessToken (15 min) y refreshToken (7 días)',
  })
  async loginCollaborator(
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

  @Delete('collaborators/sessions/:sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Revoca la sesión activa del colaborador autenticado (logout)',
  })
  async revokeSession(
    @Param('sessionId') sessionId: string,
    @CollaboratorContext() collaboratorContext: IcollaboratorContext,
  ): Promise<ResponseHttp> {
    const result = await this.revokeSessionUseCase.execute({
      sessionId: Number(sessionId),
      collaboratorId: collaboratorContext.collaboratorId,
    });
    return new ResponseHttp(result.status, result);
  }
}
