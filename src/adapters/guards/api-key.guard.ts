import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ValidateApiKeyUseCase } from '../../core/auth/use-cases/validate-api-key.uc';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly validateApiKeyUseCase: ValidateApiKeyUseCase) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Record<string, unknown>>();
    const rawKey = (request.headers as Record<string, string>)['x-api-key'];

    if (!rawKey) {
      throw new UnauthorizedException('API key requerida');
    }

    const result = await this.validateApiKeyUseCase.execute({ rawKey });

    if (result.status !== 200) {
      throw new UnauthorizedException('API key inválida');
    }

    request['tenantContext'] = result.data;
    return true;
  }
}
