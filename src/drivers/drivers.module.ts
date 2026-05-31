import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKey } from './auth/models/api-key.model';
import { Tenant } from './auth/models/tenant.model';
import { ApiKeyDriver } from './auth/api-key.driver';
import { TenantDriver } from './auth/tenant.driver';
import { WaAuthCreds } from './whatsapp/models/wa-auth-creds.model';
import { WaAuthState } from './whatsapp/models/wa-auth-state.model';
import { WhatsappContact } from './whatsapp/models/whatsapp-contact.model';
import { WhatsappMessage } from './whatsapp/models/whatsapp-message.model';
import { WhatsappSession } from './whatsapp/models/whatsapp-session.model';
import { WhatsappWebhook } from './whatsapp/models/whatsapp-webhook.model';
import { WhatsappWebhookLog } from './whatsapp/models/whatsapp-webhook-log.model';
import { WhatsappAuthDriver } from './whatsapp/whatsapp-auth.driver';
import { WhatsappMessageDriver } from './whatsapp/whatsapp-message.driver';
import { WhatsappSessionDriver } from './whatsapp/whatsapp-session.driver';
import { WhatsappSocketDriver } from './whatsapp/whatsapp-socket.driver';
import { WhatsappWebhookDriver } from './whatsapp/whatsapp-webhook.driver';

const whatsappModels = [
  WaAuthCreds,
  WaAuthState,
  WhatsappContact,
  WhatsappMessage,
  WhatsappSession,
  WhatsappWebhook,
  WhatsappWebhookLog,
];

const authModels = [Tenant, ApiKey];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('database.postgres.host'),
        port: config.get<number>('database.postgres.port'),
        username: config.get<string>('database.postgres.user'),
        password: config.get<string>('database.postgres.pw'),
        database: config.get<string>('database.postgres.db'),
        entities: [...whatsappModels, ...authModels],
        synchronize: true,
        logging: config.get<string>('general.NODE_ENV') === 'development',
      }),
    }),
    TypeOrmModule.forFeature([...whatsappModels, ...authModels]),
  ],
  providers: [
    WhatsappAuthDriver,
    WhatsappMessageDriver,
    WhatsappSessionDriver,
    WhatsappSocketDriver,
    WhatsappWebhookDriver,
    TenantDriver,
    ApiKeyDriver,
  ],
  exports: [
    WhatsappAuthDriver,
    WhatsappMessageDriver,
    WhatsappSessionDriver,
    WhatsappSocketDriver,
    WhatsappWebhookDriver,
    TenantDriver,
    ApiKeyDriver,
  ],
})
export class DriversModule {}
