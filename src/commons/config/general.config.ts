import { registerAs } from '@nestjs/config';

export default registerAs('general', () => ({
  VERSION: process.env.VERSION || '1',
  LOG_LEVEL: process.env.LOG_LEVEL,
  LOG_FORMAT: process.env.LOG_FORMAT,
  PEPPER_PASSWORD: process.env.PEPPER_PASSWORD,

  SECRET_JWT: process.env.SECRET_JWT,
  EXPIRES_JWT: process.env.EXPIRES_JWT || '2d',

  API_KEY_PREFIX: process.env.API_KEY_PREFIX ?? 'biz_',

  CRON_DAILY_METRICS: process.env.CRON_DAILY_METRICS || '0 2 * * *',
}));
