import { join } from 'node:path';
import type { DataSourceOptions } from 'typeorm';

export function createDataSourceOptions(url: string): DataSourceOptions {
  return {
    type: 'postgres',
    url,
    entities: [],
    migrations: [join(import.meta.dirname, 'migrations', '*.js')],
    synchronize: false,
  };
}
