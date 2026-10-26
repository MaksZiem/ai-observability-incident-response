import { describe, expect, it } from 'vitest';
import { redisConnection } from './redis-connection.js';

describe('redisConnection', () => {
  it('reads host and port with defaults', () => {
    expect(redisConnection('redis://localhost')).toEqual({
      host: 'localhost',
      port: 6379,
      username: undefined,
      password: undefined,
      db: 0,
      tls: undefined,
    });
  });

  it('reads credentials, database and TLS', () => {
    expect(
      redisConnection('rediss://worker:p%40ss@redis.internal:6380/2'),
    ).toEqual({
      host: 'redis.internal',
      port: 6380,
      username: 'worker',
      password: 'p@ss',
      db: 2,
      tls: {},
    });
  });
});
