import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { AuthController } from './auth/auth.controller';
import { CollaboratorController } from './auth/collaborator.controller';
import { ApiKeyGuard } from './lib/api-key.guard';
import { JwtAuthGuard } from './lib/jwt-auth.guard';
import { ExceptionManager } from './lib/exceptions-manager.filter';
import { RequestHttpInterceptor } from './lib/request-http.interceptor';
import { WhatsappController } from './whatsapp/whatsapp.controller';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [CoreModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionManager,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestHttpInterceptor,
    },
    ApiKeyGuard,
    JwtAuthGuard,
  ],
  controllers: [WhatsappController, AuthController, CollaboratorController],
})
export class AdaptersModule {}
