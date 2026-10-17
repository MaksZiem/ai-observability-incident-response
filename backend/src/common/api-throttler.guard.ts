import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';
import { hashApiKey } from '../projects/api-key.js';

@Injectable()
export class ApiThrottlerGuard extends ThrottlerGuard {
  protected getTracker(request: Request): Promise<string> {
    const apiKey = request.header('x-api-key');

    return Promise.resolve(
      apiKey ? `key:${hashApiKey(apiKey)}` : `ip:${request.ip ?? 'unknown'}`,
    );
  }
}
