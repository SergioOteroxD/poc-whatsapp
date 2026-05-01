/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

enum Environment {
  local = 'local',
  development = 'development',
  production = 'production',
}

//Declaración de variables de ambiente requeridas u obligatorias
class EnvironmentVariables {
  NODE_ENV!: Environment;

  @IsNumber()
  PORT!: number;

  @IsString()
  APPLICATION_ID!: string;

  @IsEnum(['OFF', 'ERROR', 'WARN', 'INFO', 'DEBUG'])
  LOG_LEVEL!: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const variables = errors.map((error) => error.property);
    Logger.log(
      'ERROR',
      'No se encontró valores para las siguientes variables:',
      'Validating environment',
      {
        data: variables,
        tags: 'ENVIRONMNET',
      },
    );
    throw new Error('Pendiente configuración de ambiente.');
  }

  return validatedConfig;
}
