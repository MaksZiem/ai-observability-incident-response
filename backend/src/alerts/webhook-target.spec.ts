import { describe, expect, it } from 'vitest';
import { assertPublicHost, isPrivateAddress } from './webhook-target.js';

describe('isPrivateAddress', () => {
  it('blocks loopback, private networks and cloud metadata', () => {
    for (const address of [
      '127.0.0.1',
      '10.1.2.3',
      '172.20.0.5',
      '192.168.1.10',
      '169.254.169.254',
      '::1',
      '::ffff:127.0.0.1',
      'fd00::1',
    ]) {
      expect(isPrivateAddress(address), address).toBe(true);
    }
  });

  it('allows public addresses', () => {
    expect(isPrivateAddress('8.8.8.8')).toBe(false);
    expect(isPrivateAddress('2606:4700:4700::1111')).toBe(false);
  });
});

describe('assertPublicHost', () => {
  it('rejects URLs pointing at private IP literals', async () => {
    await expect(
      assertPublicHost('http://169.254.169.254/latest/meta-data'),
    ).rejects.toThrow('private address');
    await expect(assertPublicHost('http://[::1]:4555/hook')).rejects.toThrow(
      'private address',
    );
  });

  it('resolves hostnames before checking them', async () => {
    await expect(
      assertPublicHost('http://localhost:4555/hook'),
    ).rejects.toThrow('private address');
  });
});
