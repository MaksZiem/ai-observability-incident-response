import { describe, expect, it } from 'vitest';
import { computeFingerprint, normalizeMessage } from './fingerprint.js';

describe('normalizeMessage', () => {
  it('replaces variable parts with placeholders', () => {
    expect(
      normalizeMessage(
        'Order 18291 for user 3f8b6c2e-1d4a-4b7e-9c2f-5a6d7e8f9a0b failed at 0x1f',
      ),
    ).toBe('Order <n> for user <uuid> failed at <hex>');
  });
});

describe('computeFingerprint', () => {
  const base = {
    service: 'payment-service',
    type: 'DatabaseConnectionTimeout',
    message: 'Connection timed out after 5000ms',
  };

  it('groups errors that differ only in variable parts', () => {
    expect(computeFingerprint(base)).toBe(
      computeFingerprint({
        ...base,
        message: 'Connection timed out after 3000ms',
      }),
    );
  });

  it('separates errors from different services or types', () => {
    expect(computeFingerprint(base)).not.toBe(
      computeFingerprint({ ...base, service: 'auth-service' }),
    );
    expect(computeFingerprint(base)).not.toBe(
      computeFingerprint({ ...base, type: 'QueryFailedError' }),
    );
  });
});
