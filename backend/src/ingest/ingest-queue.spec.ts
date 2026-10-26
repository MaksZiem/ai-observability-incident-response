import { describe, expect, it } from 'vitest';
import { withReceivedAt } from './ingest-queue.js';

type LogItem = { message: string; timestamp?: string };

describe('withReceivedAt', () => {
  const receivedAt = new Date('2026-10-25T14:00:00.000Z');

  it('stamps items without a timestamp with the time the request arrived', () => {
    const items: LogItem[] = [{ message: 'a' }];

    expect(withReceivedAt(items, receivedAt)).toEqual([
      { message: 'a', timestamp: '2026-10-25T14:00:00.000Z' },
    ]);
  });

  it('keeps timestamps sent by the client', () => {
    const items: LogItem[] = [
      { message: 'a', timestamp: '2026-10-25T13:59:00.000Z' },
    ];

    expect(withReceivedAt(items, receivedAt)).toEqual(items);
  });
});
