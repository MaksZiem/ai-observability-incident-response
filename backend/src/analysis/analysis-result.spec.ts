import { describe, expect, it } from 'vitest';
import { parseAnalysisResult } from './analysis-result.js';

const valid = {
  summary: 'Payment requests are slow.',
  observedFacts: [
    { statement: 'P95 latency increased 3.2x', evidence: 'timeline 14:04' },
  ],
  hypotheses: [
    {
      cause: 'Database connection pool configuration',
      confidence: 'medium',
      reasoning: 'Errors started after v1.42.3',
    },
  ],
  relatedDeployments: ['v1.42.3'],
  suggestedInvestigation: ['Inspect database connection pool metrics'],
};

describe('parseAnalysisResult', () => {
  it('accepts a response matching the schema', () => {
    expect(parseAnalysisResult(JSON.stringify(valid))).toEqual(valid);
  });

  it('rejects text that is not JSON', () => {
    expect(() => parseAnalysisResult('The root cause is...')).toThrow(
      'Model returned invalid JSON',
    );
  });

  it('rejects JSON with an unknown confidence level', () => {
    const invalid = {
      ...valid,
      hypotheses: [{ ...valid.hypotheses[0], confidence: 'certain' }],
    };

    expect(() => parseAnalysisResult(JSON.stringify(invalid))).toThrow(
      'Model returned an invalid analysis',
    );
  });
});
