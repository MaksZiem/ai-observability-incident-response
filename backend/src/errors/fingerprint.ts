import { createHash } from 'node:crypto';

const UUID_PATTERN =
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;
const HEX_PATTERN = /\b0x[0-9a-f]+\b/gi;
const NUMBER_PATTERN = /\d+/g;

export interface FingerprintSource {
  service: string;
  type: string;
  message: string;
}

export function normalizeMessage(message: string): string {
  return message
    .replace(UUID_PATTERN, '<uuid>')
    .replace(HEX_PATTERN, '<hex>')
    .replace(NUMBER_PATTERN, '<n>');
}

export function computeFingerprint(source: FingerprintSource): string {
  return createHash('sha256')
    .update(
      [source.service, source.type, normalizeMessage(source.message)].join(
        '\n',
      ),
    )
    .digest('hex');
}
