import { execSync } from 'node:child_process';
import { testDatabaseUrl } from './test-database.js';

export default function setup(): void {
  execSync('npm run typeorm -- migration:run -d dist/database/data-source.js', {
    env: { ...process.env, DATABASE_URL: testDatabaseUrl() },
    stdio: 'ignore',
  });
}
