import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiThrottlerGuard } from './common/api-throttler.guard.js';
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
import { IncidentsModule } from './incidents/incidents.module.js';
import { AnalysisModule } from './analysis/analysis.module.js';
import { AlertsModule } from './alerts/alerts.module.js';
import { RealtimeModule } from './realtime/realtime.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) =>
        createDataSourceOptions(config.get('DATABASE_URL', { infer: true })),
    }),
    RealtimeModule,
    UsersModule,
    AuthModule,
    ProjectsModule,
    LogsModule,
    TracesModule,
    ErrorsModule,
    DeploymentsModule,
    MetricsModule,
    IncidentsModule,
    AnalysisModule,
    AlertsModule,
    IngestModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ApiThrottlerGuard }],
})
export class AppModule {}
