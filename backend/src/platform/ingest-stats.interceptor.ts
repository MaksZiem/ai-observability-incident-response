import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { Observable, tap } from 'rxjs';
import {
  ingestedItems,
  telemetryLagsMs,
  telemetryTypeOf,
} from './ingest-items.js';
import { PlatformStatsService } from './platform-stats.service.js';

@Injectable()
export class IngestStatsInterceptor implements NestInterceptor {
  constructor(private readonly platformStats: PlatformStatsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const receivedAt = Date.now();
    const type = telemetryTypeOf(request.path);

    return next.handle().pipe(
      tap(() => {
        if (!type) {
          return;
        }

        const items = ingestedItems(request.body);
        this.platformStats.recordIngestAccepted(
          type,
          items.length,
          Date.now() - receivedAt,
          telemetryLagsMs(items, receivedAt),
        );
      }),
    );
  }
}
