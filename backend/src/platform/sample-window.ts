export interface Percentiles {
  count: number;
  p50: number | null;
  p95: number | null;
}

function percentile(sorted: number[], quantile: number): number {
  const index = Math.ceil(quantile * sorted.length) - 1;
  return sorted[Math.min(Math.max(index, 0), sorted.length - 1)];
}

export class SampleWindow {
  private readonly samples: number[] = [];

  constructor(private readonly capacity: number) {}

  add(value: number): void {
    this.samples.push(value);

    if (this.samples.length > this.capacity) {
      this.samples.shift();
    }
  }

  percentiles(): Percentiles {
    if (this.samples.length === 0) {
      return { count: 0, p50: null, p95: null };
    }

    const sorted = [...this.samples].sort((a, b) => a - b);

    return {
      count: sorted.length,
      p50: percentile(sorted, 0.5),
      p95: percentile(sorted, 0.95),
    };
  }
}
