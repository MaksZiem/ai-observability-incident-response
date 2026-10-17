import { Injectable, MessageEvent } from '@nestjs/common';
import { filter, interval, map, merge, Observable, Subject } from 'rxjs';
import { ProjectEvent, ProjectEventType } from './project-event.js';

const HEARTBEAT_INTERVAL_MS = 25_000;

@Injectable()
export class RealtimeService {
  private readonly events$ = new Subject<ProjectEvent>();

  publish(
    projectId: string,
    type: ProjectEventType,
    data: Record<string, unknown> = {},
  ): void {
    this.events$.next({ projectId, type, data });
  }

  stream(projectId: string): Observable<MessageEvent> {
    const events = this.events$.pipe(
      filter((event) => event.projectId === projectId),
      map(({ type, data }) => ({ type, data })),
    );
    const heartbeat = interval(HEARTBEAT_INTERVAL_MS).pipe(
      map(() => ({ type: 'ping', data: {} })),
    );

    return merge(events, heartbeat);
  }
}
