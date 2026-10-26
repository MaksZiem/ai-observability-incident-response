import type { ConnectionOptions } from 'bullmq';

const DEFAULT_REDIS_PORT = 6379;

export function redisConnection(url: string): ConnectionOptions {
  const { protocol, hostname, port, username, password, pathname } = new URL(
    url,
  );

  return {
    host: hostname,
    port: port ? Number(port) : DEFAULT_REDIS_PORT,
    username: username ? decodeURIComponent(username) : undefined,
    password: password ? decodeURIComponent(password) : undefined,
    db: pathname.length > 1 ? Number(pathname.slice(1)) : 0,
    tls: protocol === 'rediss:' ? {} : undefined,
  };
}
