import { lookup } from 'node:dns/promises';
import { BlockList, isIP } from 'node:net';

const PRIVATE_RANGES = new BlockList();

PRIVATE_RANGES.addSubnet('0.0.0.0', 8, 'ipv4');
PRIVATE_RANGES.addSubnet('10.0.0.0', 8, 'ipv4');
PRIVATE_RANGES.addSubnet('100.64.0.0', 10, 'ipv4');
PRIVATE_RANGES.addSubnet('127.0.0.0', 8, 'ipv4');
PRIVATE_RANGES.addSubnet('169.254.0.0', 16, 'ipv4');
PRIVATE_RANGES.addSubnet('172.16.0.0', 12, 'ipv4');
PRIVATE_RANGES.addSubnet('192.168.0.0', 16, 'ipv4');
PRIVATE_RANGES.addAddress('::', 'ipv6');
PRIVATE_RANGES.addAddress('::1', 'ipv6');
PRIVATE_RANGES.addSubnet('fc00::', 7, 'ipv6');
PRIVATE_RANGES.addSubnet('fe80::', 10, 'ipv6');

export function isPrivateAddress(address: string): boolean {
  return PRIVATE_RANGES.check(address, isIP(address) === 6 ? 'ipv6' : 'ipv4');
}

export async function assertPublicHost(url: string): Promise<void> {
  const hostname = new URL(url).hostname.replace(/^\[|\]$/g, '');
  const addresses = isIP(hostname)
    ? [hostname]
    : (await lookup(hostname, { all: true })).map(({ address }) => address);

  if (addresses.some(isPrivateAddress)) {
    throw new Error(`Webhook host ${hostname} resolves to a private address`);
  }
}
