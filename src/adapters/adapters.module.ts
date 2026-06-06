import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { CollaboratorController } from './apis/collaborator/collaborator.controller';
import { ApiKeyGuard } from './guards/api-key.guard';
import { DevOnlyGuard } from './guards/dev-only.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ExceptionManager } from './lib/exceptions-manager.filter';
import { RequestHttpInterceptor } from './lib/request-http.interceptor';
import { WhatsappController } from './apis/whatsapp/whatsapp.controller';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ManagementController } from './apis/management/management.controller';
import { AuthController } from './apis/auth/auth.controller';

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
    DevOnlyGuard,
    JwtAuthGuard,
  ],
  controllers: [
    AuthController,
    ManagementController,
    WhatsappController,
    CollaboratorController,
  ],
})
export class AdaptersModule {}
