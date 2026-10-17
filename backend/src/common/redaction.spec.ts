import { describe, expect, it } from 'vitest';
import { redactString, redactValue } from './redaction.js';

describe('redactString', () => {
  it('masks bearer tokens, JWTs and our API keys', () => {
    expect(
      redactString(
        'Auth failed: Bearer abc.def-123 with eyJhbGciOi.eyJzdWIiOi.c2lnbmF0dXJl key obs_4jlpP5Rs9xA8zxJigkcEa_Nk6b',
      ),
    ).toBe('Auth failed: Bearer [REDACTED] with [REDACTED] key [REDACTED]');
  });

  it('masks secrets in query strings', () => {
    expect(redactString('GET /login?user=alice&password=hunter2&x=1')).toBe(
      'GET /login?user=alice&password=[REDACTED]&x=1',
    );
  });

  it('masks valid card numbers but keeps timestamps and ids', () => {
    expect(redactString('card 4111 1111 1111 1111 charged')).toBe(
      'card [REDACTED] charged',
    );
    expect(redactString('at 1792235771174 order 4111111111111112')).toBe(
      'at 1792235771174 order 4111111111111112',
    );
  });
});

describe('redactValue', () => {
  it('masks sensitive keys at any depth and keeps the rest', () => {
    expect(
      redactValue({
        userId: 'user_18291',
        password: 'hunter2',
        request: {
          headers: { Authorization: 'Bearer abc', 'x-request-id': 'r1' },
          items: [{ apiKey: 'k' }, { sku: 'A1' }],
        },
      }),
    ).toEqual({
      userId: 'user_18291',
      password: '[REDACTED]',
      request: {
        headers: { Authorization: '[REDACTED]', 'x-request-id': 'r1' },
        items: [{ apiKey: '[REDACTED]' }, { sku: 'A1' }],
      },
    });
  });
});
