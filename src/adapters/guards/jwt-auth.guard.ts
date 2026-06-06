import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ValidateJwtUseCase } from '../../core/auth/use-cases/validate-jwt.uc';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly validateJwtUseCase: ValidateJwtUseCase) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Record<string, unknown>>();
    const authHeader = (request.headers as Record<string, string>)[
      'authorization'
    ];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autenticación requerido');
    }

    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedException('Token de autenticación requerido');
    }

    const result = await this.validateJwtUseCase.execute({ token });

    if (result.status !== 200) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    request['collaboratorContext'] = result.data;
    return true;
  }
}
