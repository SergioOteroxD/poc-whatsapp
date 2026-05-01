import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    user: process.env.POSTGRES_USER,
    pw: process.env.POSTGRES_PASSWORD,
    db: process.env.POSTGRES_DB,
    port: Number(process.env.POSTGRES_PORT || '5432'),
  },
}));
