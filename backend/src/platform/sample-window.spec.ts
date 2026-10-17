import { describe, expect, it } from 'vitest';
import { SampleWindow } from './sample-window.js';

describe('SampleWindow', () => {
  it('reports nothing before the first sample', () => {
    expect(new SampleWindow(10).percentiles()).toEqual({
      count: 0,
      p50: null,
      p95: null,
    });
  });

  it('computes nearest-rank percentiles', () => {
    const window = new SampleWindow(100);

    for (let value = 1; value <= 100; value++) {
      window.add(value);
    }

    expect(window.percentiles()).toEqual({ count: 100, p50: 50, p95: 95 });
  });

  it('keeps only the most recent samples', () => {
    const window = new SampleWindow(3);

    [1000, 1, 2, 3].forEach((value) => window.add(value));

    expect(window.percentiles()).toEqual({ count: 3, p50: 2, p95: 3 });
  });
});
