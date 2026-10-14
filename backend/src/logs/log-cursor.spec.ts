import { describe, expect, it } from 'vitest';
import { decodeLogCursor, encodeLogCursor } from './log-cursor.js';

describe('log cursor', () => {
  it('round-trips timestamp and id', () => {
    const log = {
      timestamp: new Date('2026-10-14T14:32:13.123Z'),
      id: '3f8b6c2e-1d4a-4b7e-9c2f-5a6d7e8f9a0b',
    };

    expect(decodeLogCursor(encodeLogCursor(log))).toEqual(log);
  });

  it('returns null for a malformed cursor', () => {
    expect(decodeLogCursor('garbage')).toBeNull();
    expect(
      decodeLogCursor(Buffer.from('not-a-date|x').toString('base64url')),
    ).toBeNull();
  });
});
