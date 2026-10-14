import { isUUID } from 'class-validator';
import type { Log } from './entities/log.entity.js';

export interface LogCursor {
  timestamp: Date;
  id: string;
}

export function encodeLogCursor(log: Pick<Log, 'timestamp' | 'id'>): string {
  return Buffer.from(`${log.timestamp.toISOString()}|${log.id}`).toString(
    'base64url',
  );
}

export function decodeLogCursor(cursor: string): LogCursor | null {
  const [iso, id] = Buffer.from(cursor, 'base64url')
    .toString('utf8')
    .split('|');
  const timestamp = new Date(iso);

  if (!id || !isUUID(id) || Number.isNaN(timestamp.getTime())) {
    return null;
  }

  return { timestamp, id };
}
