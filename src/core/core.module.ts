import { Module } from '@nestjs/common';
import { DriversModule } from '../drivers/drivers.module';
import { CreateSessionUseCase } from './whatsapp/use-cases/create-session.uc';
import { SendMessageUseCase } from './whatsapp/use-cases/send-message.uc';

@Module({
  imports: [DriversModule],
  providers: [CreateSessionUseCase, SendMessageUseCase],
  exports: [CreateSessionUseCase, SendMessageUseCase],
})
export class CoreModule {}
