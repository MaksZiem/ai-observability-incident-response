import { describe, expect, it } from 'vitest';
import { generateApiKey, hashApiKey } from './api-key.js';

describe('generateApiKey', () => {
  it('generates a prefixed key with matching hash and visible prefix', () => {
    const { key, hash, prefix } = generateApiKey();

    expect(key.startsWith('obs_')).toBe(true);
    expect(hash).toBe(hashApiKey(key));
    expect(key.startsWith(prefix)).toBe(true);
    expect(prefix).toHaveLength(12);
  });

  it('generates a different key every time', () => {
    expect(generateApiKey().key).not.toBe(generateApiKey().key);
  });
});

describe('hashApiKey', () => {
  it('is deterministic', () => {
    expect(hashApiKey('obs_test')).toBe(hashApiKey('obs_test'));
  });
});
