import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseHttp } from '../../../core/common/entity/response-http.model';
import { CreateTenantUseCase } from '../../../core/auth/use-cases/create-tenant.uc';
import { CreateApiKeyUseCase } from '../../../core/auth/use-cases/create-api-key.uc';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly createTenantUseCase: CreateTenantUseCase,
    private readonly createApiKeyUseCase: CreateApiKeyUseCase,
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
}
