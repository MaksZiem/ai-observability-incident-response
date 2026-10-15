import { describe, expect, it } from 'vitest';
import { Span, SpanStatus } from './entities/span.entity.js';
import { buildTraceDetail } from './trace-detail.js';

function span(data: Partial<Span>): Span {
  return Object.assign(new Span(), {
    parentSpanId: null,
    status: SpanStatus.OK,
    ...data,
  });
}

describe('buildTraceDetail', () => {
  const spans = [
    span({
      spanId: 'root',
      service: 'api',
      startTime: new Date('2026-10-14T14:32:11.000Z'),
      durationMs: 1420,
    }),
    span({
      spanId: 'db',
      parentSpanId: 'root',
      service: 'payment-service',
      status: SpanStatus.ERROR,
      startTime: new Date('2026-10-14T14:32:11.100Z'),
      durationMs: 1210,
    }),
  ];

  it('summarizes the trace', () => {
    const detail = buildTraceDetail('abc123', spans);

    expect(detail.rootSpan?.spanId).toBe('root');
    expect(detail.startTime).toEqual(new Date('2026-10-14T14:32:11.000Z'));
    expect(detail.durationMs).toBe(1420);
    expect(detail.spanCount).toBe(2);
    expect(detail.services).toEqual(['api', 'payment-service']);
    expect(detail.hasError).toBe(true);
  });

  it('extends the duration when a child span outlives the root', () => {
    const detail = buildTraceDetail('abc123', [
      ...spans,
      span({
        spanId: 'late',
        parentSpanId: 'root',
        service: 'worker',
        startTime: new Date('2026-10-14T14:32:12.000Z'),
        durationMs: 1000,
      }),
    ]);

    expect(detail.durationMs).toBe(2000);
  });
});
