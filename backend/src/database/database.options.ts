import { join } from 'node:path';
import type { DataSourceOptions } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { Project } from '../projects/entities/project.entity.js';
import { Log } from '../logs/entities/log.entity.js';
import { ErrorEvent } from '../errors/entities/error-event.entity.js';
import { ErrorGroup } from '../errors/entities/error-group.entity.js';
import { Span } from '../traces/entities/span.entity.js';

export function createDataSourceOptions(url: string): DataSourceOptions {
  return {
    type: 'postgres',
    url,
    entities: [User, Project, Log, Span, ErrorGroup, ErrorEvent],
    migrations: [join(import.meta.dirname, 'migrations', '*.js')],
    synchronize: false,
  };
}
