import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseHttp } from '../../core/common/entity/response-http.model';
import { CreateTenantUseCase } from '../../core/auth/use-cases/create-tenant.uc';
import { CreateApiKeyUseCase } from '../../core/auth/use-cases/create-api-key.uc';
import { CreateCollaboratorUseCase } from '../../core/auth/use-cases/create-collaborator.uc';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { CreateCollaboratorDto } from './dto/create-collaborator.dto';
import { JwtAuthGuard } from '../lib/jwt-auth.guard';
import { CollaboratorContext } from '../lib/collaborator-context.decorator';
import type { IcollaboratorContext } from '../../core/auth/entity/collaborator.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly createTenantUseCase: CreateTenantUseCase,
    private readonly createApiKeyUseCase: CreateApiKeyUseCase,
    private readonly createCollaboratorUseCase: CreateCollaboratorUseCase,
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

  @Post('collaborators')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Crea un colaborador dentro del tenant (solo OWNER)' })
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
