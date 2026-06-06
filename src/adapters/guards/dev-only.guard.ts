import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class DevOnlyGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    if (process.env.NODE_ENV !== 'development') {
      throw new ForbiddenException(
        'Este endpoint solo está disponible en entorno de desarrollo',
      );
    }
    return true;
  }
}