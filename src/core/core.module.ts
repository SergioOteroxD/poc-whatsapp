import { Module } from '@nestjs/common';
import { DriversModule } from '../drivers/drivers.module';
import { CreateApiKeyUseCase } from './auth/use-cases/create-api-key.uc';
import { CreateTenantUseCase } from './auth/use-cases/create-tenant.uc';
import { ValidateApiKeyUseCase } from './auth/use-cases/validate-api-key.uc';
import { CreateSessionUseCase } from './whatsapp/use-cases/create-session.uc';
import { QuerySessionsUseCase } from './whatsapp/use-cases/query-sessions.uc';
import { SendMessageUseCase } from './whatsapp/use-cases/send-message.uc';

@Module({
  imports: [DriversModule],
  providers: [
    CreateSessionUseCase,
    SendMessageUseCase,
    QuerySessionsUseCase,
    CreateTenantUseCase,
    CreateApiKeyUseCase,
    ValidateApiKeyUseCase,
  ],
  exports: [
    CreateSessionUseCase,
    SendMessageUseCase,
    QuerySessionsUseCase,
    CreateTenantUseCase,
    CreateApiKeyUseCase,
    ValidateApiKeyUseCase,
  ],
})
export class CoreModule {}
