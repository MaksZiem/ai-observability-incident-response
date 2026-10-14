import { createHash, randomBytes } from 'node:crypto';

const API_KEY_PREFIX = 'obs_';
const VISIBLE_PREFIX_LENGTH = 12;

export interface GeneratedApiKey {
  key: string;
  hash: string;
  prefix: string;
}

export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

export function generateApiKey(): GeneratedApiKey {
  const key = `${API_KEY_PREFIX}${randomBytes(32).toString('base64url')}`;

  return {
    key,
    hash: hashApiKey(key),
    prefix: key.slice(0, VISIBLE_PREFIX_LENGTH),
  };
}
