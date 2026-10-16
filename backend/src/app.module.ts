import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validateEnv, type Env } from './config/env.js';
import { createDataSourceOptions } from './database/database.options.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { IngestModule } from './ingest/ingest.module.js';
import { LogsModule } from './logs/logs.module.js';
import { TracesModule } from './traces/traces.module.js';
import { ErrorsModule } from './errors/errors.module.js';
import { DeploymentsModule } from './deployments/deployments.module.js';
import { MetricsModule } from './metrics/metrics.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) =>
        createDataSourceOptions(config.get('DATABASE_URL', { infer: true })),
    }),
    UsersModule,
    AuthModule,
    ProjectsModule,
    LogsModule,
    TracesModule,
    ErrorsModule,
    DeploymentsModule,
    MetricsModule,
    IngestModule,
  ],
})
export class AppModule {}
