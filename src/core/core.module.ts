import { Module } from '@nestjs/common';
import { DriversModule } from '../drivers/drivers.module';
import { CreateApiKeyUseCase } from './auth/use-cases/create-api-key.uc';
import { CreateTenantUseCase } from './auth/use-cases/create-tenant.uc';
import { ValidateApiKeyUseCase } from './auth/use-cases/validate-api-key.uc';
import { ValidateJwtUseCase } from './auth/use-cases/validate-jwt.uc';
import { LoginCollaboratorUseCase } from './auth/use-cases/login-collaborator.uc';
import { RevokeSessionUseCase } from './auth/use-cases/revoke-session.uc';
import { CreateSessionUseCase } from './whatsapp/use-cases/create-session.uc';
import { CreateWebhookUseCase } from './whatsapp/use-cases/create-webhook.uc';
import { QuerySessionsUseCase } from './whatsapp/use-cases/query-sessions.uc';
import { QueryWebhooksUseCase } from './whatsapp/use-cases/query-webhooks.uc';
import { SendMessageByReferenceUseCase } from './whatsapp/use-cases/send-message-by-reference.uc';
import { SendMessageUseCase } from './whatsapp/use-cases/send-message.uc';

@Module({
  imports: [DriversModule],
  providers: [
    CreateSessionUseCase,
    SendMessageUseCase,
    SendMessageByReferenceUseCase,
    QuerySessionsUseCase,
    CreateWebhookUseCase,
    QueryWebhooksUseCase,
    CreateTenantUseCase,
    CreateApiKeyUseCase,
    ValidateApiKeyUseCase,
    ValidateJwtUseCase,
    LoginCollaboratorUseCase,
    RevokeSessionUseCase,
  ],
  exports: [
    CreateSessionUseCase,
    SendMessageUseCase,
    SendMessageByReferenceUseCase,
    QuerySessionsUseCase,
    CreateWebhookUseCase,
    QueryWebhooksUseCase,
    CreateTenantUseCase,
    CreateApiKeyUseCase,
    ValidateApiKeyUseCase,
    ValidateJwtUseCase,
    LoginCollaboratorUseCase,
    RevokeSessionUseCase,
  ],
})
export class CoreModule {}
