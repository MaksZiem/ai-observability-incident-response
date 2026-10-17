import { describe, expect, it } from 'vitest';
import {
  compareIncidents,
  IncidentFeatures,
  titleWords,
} from './similar-incidents.js';

function features(
  errorTypes: string[],
  services: string[],
  title: string,
): IncidentFeatures {
  return {
    errorTypes: new Set(errorTypes),
    services: new Set(services),
    titleWords: titleWords(title),
  };
}

describe('titleWords', () => {
  it('keeps meaningful lowercase words', () => {
    expect(titleWords('Payment API degraded on EU')).toEqual(
      new Set(['payment', 'api', 'degraded']),
    );
  });
});

describe('compareIncidents', () => {
  const current = features(
    ['DatabaseConnectionTimeout'],
    ['payment-service'],
    'Payment API degraded',
  );

  it('scores an identical incident as 1 and explains why', () => {
    expect(compareIncidents(current, current)).toEqual({
      score: 1,
      reasons: [
        'Same error: DatabaseConnectionTimeout',
        'Same service: payment-service',
        'Similar title',
      ],
    });
  });

  it('ranks a shared error above a shared title', () => {
    const sameError = features(
      ['DatabaseConnectionTimeout'],
      ['auth-service'],
      'Login outage',
    );
    const sameTitle = features(
      ['QueueFull'],
      ['worker'],
      'Payment API degraded',
    );

    expect(compareIncidents(current, sameError).score).toBeGreaterThan(
      compareIncidents(current, sameTitle).score,
    );
  });

  it('scores unrelated incidents as 0', () => {
    expect(
      compareIncidents(current, features(['QueueFull'], ['worker'], 'Disk')),
    ).toEqual({ score: 0, reasons: [] });
  });
});
