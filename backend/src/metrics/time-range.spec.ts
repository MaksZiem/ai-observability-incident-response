import { describe, expect, it } from 'vitest';
import { bucketStarts, resolveTimeRange, TimeRange } from './time-range.js';

describe('resolveTimeRange', () => {
  it('aligns the range end to the next bucket boundary', () => {
    const range = resolveTimeRange(
      TimeRange.ONE_HOUR,
      new Date('2026-10-14T14:32:13.000Z'),
    );

    expect(range.to).toEqual(new Date('2026-10-14T14:33:00.000Z'));
    expect(range.from).toEqual(new Date('2026-10-14T13:33:00.000Z'));
    expect(range.stepMs).toBe(60_000);
  });

  it('keeps an already aligned end', () => {
    const range = resolveTimeRange(
      TimeRange.ONE_DAY,
      new Date('2026-10-14T14:30:00.000Z'),
    );

    expect(range.to).toEqual(new Date('2026-10-14T14:30:00.000Z'));
  });
});

describe('bucketStarts', () => {
  it('returns one start per bucket', () => {
    const range = resolveTimeRange(
      TimeRange.FIFTEEN_MINUTES,
      new Date('2026-10-14T14:30:00.000Z'),
    );
    const starts = bucketStarts(range);

    expect(starts).toHaveLength(15);
    expect(starts[0]).toEqual(new Date('2026-10-14T14:15:00.000Z'));
    expect(starts[14]).toEqual(new Date('2026-10-14T14:29:00.000Z'));
  });
});
