/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import rTracer = require('cls-rtracer');
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  // Enable CORS
  app.enableCors();

  const configService = app.get(ConfigService);
  //Configuración libreria para validación de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  //Configuración libreria para generación de indentificador de solicitud
  app.use(rTracer.expressMiddleware());

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const module = configService.get('MODULE');
  app.setGlobalPrefix(module);

  // Configuración de Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Stream head seller API')
    .setDescription(
      'API REST para la gestión de streaming head sellers y suscripciones.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const stage = configService.get<string>('NODE_ENV');
  if (stage !== 'production')
    SwaggerModule.setup(`${module}/api/docs`, app, document);

  const PORT = configService.get<number>('PORT');

  await app.listen(PORT ?? 3000, async () => {
    Logger.log(
      'INFO',
      `Application is running on: port: ${await app.getUrl()}/${module}/v1`,
      'main',
    );
    Logger.log(
      'INFO',
      `Swagger documentation available at: ${await app.getUrl()}/${module}/api/docs`,
      'main',
    );
  });
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
