import { existsSync } from 'node:fs';

export function testDatabaseUrl(): string {
  if (existsSync('.env')) {
    process.loadEnvFile('.env');
  }

  if (process.env.TEST_DATABASE_URL) {
    return process.env.TEST_DATABASE_URL;
  }

  const url = new URL(process.env.DATABASE_URL ?? '');
  url.pathname = `${url.pathname}_test`;
  return url.toString();
}
