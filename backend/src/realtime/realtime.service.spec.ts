import { firstValueFrom, take, toArray } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { ProjectEventType } from './project-event.js';
import { RealtimeService } from './realtime.service.js';

describe('RealtimeService', () => {
  it('delivers only the events of the subscribed project', async () => {
    const realtime = new RealtimeService();
    const received = firstValueFrom(
      realtime.stream('project-a').pipe(take(2), toArray()),
    );

    realtime.publish('project-a', ProjectEventType.LOGS_INGESTED, { count: 2 });
    realtime.publish('project-b', ProjectEventType.LOGS_INGESTED, { count: 9 });
    realtime.publish('project-a', ProjectEventType.INCIDENT_CHANGED, {
      incidentId: 'i1',
    });

    expect(await received).toEqual([
      { type: ProjectEventType.LOGS_INGESTED, data: { count: 2 } },
      { type: ProjectEventType.INCIDENT_CHANGED, data: { incidentId: 'i1' } },
    ]);
  });
});
