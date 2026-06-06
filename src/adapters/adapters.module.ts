import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { AuthController } from './apis/auth/auth.controller';
import { CollaboratorController } from './apis/auth/collaborator.controller';
import { ApiKeyGuard } from './guards/api-key.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ExceptionManager } from './lib/exceptions-manager.filter';
import { RequestHttpInterceptor } from './lib/request-http.interceptor';
import { WhatsappController } from './apis/whatsapp/whatsapp.controller';
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
