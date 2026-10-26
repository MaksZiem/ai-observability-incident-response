const API_URL = process.env.DEMO_API_URL ?? 'http://localhost:3001/api';
const EMAIL = process.env.DEMO_EMAIL ?? 'demo@example.com';
const PASSWORD = process.env.DEMO_PASSWORD ?? 'demo-password';
const PROJECT_NAME = 'My E-commerce API';

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;
const HISTORY_MS = 3 * 60 * MINUTE_MS;
const REQUEST_INTERVAL_MS = 15_000;
const DEPLOY_AGO_MS = 40 * MINUTE_MS;
const DEGRADATION_DELAY_MS = 4 * MINUTE_MS;
const BATCH_SIZE = 1000;
const QUEUE_POLL_MS = 250;
const QUEUE_DRAIN_TIMEOUT_MS = 60_000;

type Json = Record<string, unknown>;

interface CallOptions {
  token?: string;
  apiKey?: string;
  body?: unknown;
}

interface Telemetry {
  spans: Json[];
  logs: Json[];
  errors: Json[];
}

function random(seed: number): () => number {
  let state = seed;

  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

async function call<T>(
  method: string,
  path: string,
  { token, apiKey, body }: CallOptions = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(apiKey && { 'X-Api-Key': apiKey }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(
      `${method} ${path} failed with ${response.status}: ${await response.text()}`,
    );
  }

  return (response.status === 204 ? undefined : await response.json()) as T;
}

async function authenticate(): Promise<string> {
  try {
    const { accessToken } = await call<{ accessToken: string }>(
      'POST',
      '/auth/login',
      { body: { email: EMAIL, password: PASSWORD } },
    );
    return accessToken;
  } catch {
    const { accessToken } = await call<{ accessToken: string }>(
      'POST',
      '/auth/register',
      { body: { email: EMAIL, password: PASSWORD, name: 'Alice' } },
    );
    return accessToken;
  }
}

async function recreateProject(
  token: string,
): Promise<{ projectId: string; apiKey: string }> {
  const projects = await call<{ id: string; name: string }[]>(
    'GET',
    '/projects',
    { token },
  );

  for (const project of projects.filter(({ name }) => name === PROJECT_NAME)) {
    await call('DELETE', `/projects/${project.id}`, { token });
  }

  const { project, apiKey } = await call<{
    project: { id: string };
    apiKey: string;
  }>('POST', '/projects', {
    token,
    body: { name: PROJECT_NAME, environment: 'production' },
  });

  return { projectId: project.id, apiKey };
}

function generateTelemetry(now: number): Telemetry {
  const next = random(42);
  const telemetry: Telemetry = { spans: [], logs: [], errors: [] };
  const degradedFrom = now - DEPLOY_AGO_MS + DEGRADATION_DELAY_MS;
  let sequence = 0;

  for (let at = now - HISTORY_MS; at < now; at += REQUEST_INTERVAL_MS) {
    const degraded = at >= degradedFrom;
    const paymentFails = degraded && next() < 0.35;
    const dbMs = degraded ? 900 + next() * 600 : 15 + next() * 30;
    const paymentMs = dbMs + 40 + next() * 20;
    const traceId = `pay-${(sequence += 1).toString(16).padStart(6, '0')}`;
    const status = paymentFails ? 'error' : 'ok';
    const iso = (offsetMs: number) => new Date(at + offsetMs).toISOString();

    telemetry.spans.push(
      {
        traceId,
        spanId: 'gateway',
        service: 'api-gateway',
        name: 'POST /payments',
        startTime: iso(0),
        durationMs: paymentMs + 30,
        status,
      },
      {
        traceId,
        spanId: 'auth',
        parentSpanId: 'gateway',
        kind: 'server',
        service: 'auth-service',
        name: 'Authentication',
        startTime: iso(5),
        durationMs: 6 + next() * 4,
      },
      {
        traceId,
        spanId: 'payment',
        parentSpanId: 'gateway',
        kind: 'server',
        service: 'payment-service',
        name: 'Payment Service',
        startTime: iso(15),
        durationMs: paymentMs,
        status,
      },
      {
        traceId,
        spanId: 'db',
        parentSpanId: 'payment',
        service: 'payment-service',
        name: 'PostgreSQL',
        startTime: iso(25),
        durationMs: dbMs,
        status,
        attributes: { 'db.system': 'postgresql', 'db.operation': 'INSERT' },
      },
    );

    telemetry.logs.push({
      service: 'payment-service',
      level: 'info',
      message: 'Payment processing started',
      traceId,
      endpoint: 'POST /payments',
      timestamp: iso(16),
      attributes: { userId: `user_${18000 + Math.floor(next() * 900)}` },
    });

    if (paymentFails) {
      telemetry.logs.push(
        {
          service: 'payment-service',
          level: 'error',
          message: 'Database pool exhausted (5/5 connections in use)',
          traceId,
          spanId: 'db',
          endpoint: 'POST /payments',
          timestamp: iso(dbMs),
        },
        {
          service: 'payment-service',
          level: 'error',
          message: 'Payment failed',
          traceId,
          endpoint: 'POST /payments',
          timestamp: iso(paymentMs),
        },
      );

      telemetry.errors.push({
        service: 'payment-service',
        type: 'DatabaseConnectionTimeout',
        message: `Timed out acquiring a connection after ${Math.round(dbMs)}ms`,
        stackTrace:
          'DatabaseConnectionTimeout: Timed out acquiring a connection\n    at Pool.acquire (pg-pool/index.js:45:11)\n    at PaymentRepository.save (payment.repository.ts:31:18)',
        endpoint: 'POST /payments',
        traceId,
        spanId: 'db',
        timestamp: iso(dbMs),
      });
    }

    const catalogTraceId = `cat-${sequence.toString(16).padStart(6, '0')}`;
    const catalogMs = 40 + next() * 60;

    telemetry.spans.push(
      {
        traceId: catalogTraceId,
        spanId: 'gateway',
        service: 'api-gateway',
        name: 'GET /products',
        startTime: iso(7_000),
        durationMs: catalogMs + 10,
      },
      {
        traceId: catalogTraceId,
        spanId: 'catalog',
        parentSpanId: 'gateway',
        kind: 'server',
        service: 'catalog-service',
        name: 'Catalog Service',
        startTime: iso(7_005),
        durationMs: catalogMs,
      },
    );

    if (next() < 0.01) {
      telemetry.errors.push({
        service: 'auth-service',
        type: 'InvalidTokenError',
        message: 'Token expired',
        endpoint: 'POST /payments',
        traceId,
        timestamp: iso(8),
      });
    }
  }

  return telemetry;
}

async function sendInBatches(
  apiKey: string,
  type: keyof Telemetry,
  items: Json[],
): Promise<void> {
  for (let start = 0; start < items.length; start += BATCH_SIZE) {
    await call('POST', `/ingest/${type}`, {
      apiKey,
      body: { [type]: items.slice(start, start + BATCH_SIZE) },
    });
  }
}

interface QueueDepth {
  waiting: number;
  active: number;
  delayed: number;
}

async function waitForIngestQueue(token: string): Promise<void> {
  const deadline = Date.now() + QUEUE_DRAIN_TIMEOUT_MS;

  for (;;) {
    const { queue } = await call<{ queue: QueueDepth | null }>(
      'GET',
      '/platform/stats',
      { token },
    );

    if (queue && queue.waiting + queue.active + queue.delayed === 0) {
      return;
    }
    if (Date.now() > deadline) {
      throw new Error('The ingest queue did not drain in time');
    }
    await new Promise((resolve) => setTimeout(resolve, QUEUE_POLL_MS));
  }
}

async function createPastIncident(
  token: string,
  projectId: string,
  incident: Json,
  errorGroupId: string | undefined,
): Promise<void> {
  const { id } = await call<{ id: string }>(
    'POST',
    `/projects/${projectId}/incidents`,
    { token, body: incident },
  );

  if (errorGroupId) {
    await call('POST', `/projects/${projectId}/incidents/${id}/links`, {
      token,
      body: { kind: 'error_group', targetId: errorGroupId },
    });
  }

  await call('PATCH', `/projects/${projectId}/incidents/${id}`, {
    token,
    body: { status: 'resolved' },
  });
}

async function main(): Promise<void> {
  const now = Date.now();
  const token = await authenticate();
  const { projectId, apiKey } = await recreateProject(token);
  const telemetry = generateTelemetry(now);

  await call('POST', '/ingest/deployments', {
    apiKey,
    body: {
      version: 'v1.42.1',
      commitSha: '7c1e9a2',
      deployedAt: new Date(now - 2 * DAY_MS).toISOString(),
    },
  });
  await call('POST', '/ingest/deployments', {
    apiKey,
    body: {
      version: 'v1.42.2',
      commitSha: '9f04b11',
      deployedAt: new Date(now - DAY_MS).toISOString(),
    },
  });
  const deployment = await call<{ id: string }>('POST', '/ingest/deployments', {
    apiKey,
    body: {
      version: 'v1.42.3',
      service: 'payment-service',
      commitSha: 'a1b2c3d',
      description: 'Reduce database connection pool size to 5',
      deployedAt: new Date(now - DEPLOY_AGO_MS).toISOString(),
    },
  });

  await sendInBatches(apiKey, 'spans', telemetry.spans);
  await sendInBatches(apiKey, 'logs', telemetry.logs);
  await sendInBatches(apiKey, 'errors', telemetry.errors);
  await waitForIngestQueue(token);

  const errorGroups = await call<{ id: string; type: string }[]>(
    'GET',
    `/projects/${projectId}/errors`,
    { token },
  );
  const groupOf = (type: string) =>
    errorGroups.find((group) => group.type === type)?.id;

  await createPastIncident(
    token,
    projectId,
    {
      title: 'Database connection pool exhaustion',
      description:
        'Resolved by raising the payment-service database pool from 5 to 20 connections.',
      severity: 'high',
      startedAt: new Date(now - 90 * DAY_MS).toISOString(),
    },
    groupOf('DatabaseConnectionTimeout'),
  );
  await createPastIncident(
    token,
    projectId,
    {
      title: 'Login outage',
      description: 'Expired signing key in auth-service, rotated the key.',
      severity: 'critical',
      startedAt: new Date(now - 150 * DAY_MS).toISOString(),
    },
    groupOf('InvalidTokenError'),
  );

  const rule = await call<{ id: string }>(
    'POST',
    `/projects/${projectId}/alerts`,
    {
      token,
      body: {
        name: 'Payment error rate',
        metric: 'error_rate',
        comparator: 'gt',
        threshold: 0.05,
        windowMinutes: 5,
        service: 'payment-service',
        incidentSeverity: 'high',
      },
    },
  );
  await call('POST', `/projects/${projectId}/alerts/${rule.id}/evaluate`, {
    token,
  });

  const [incident] = await call<{ id: string; number: number }[]>(
    'GET',
    `/projects/${projectId}/incidents?status=open`,
    { token },
  );
  const failedTrace = telemetry.errors.find(
    (error) => error.type === 'DatabaseConnectionTimeout',
  )?.traceId;

  if (incident) {
    for (const link of [
      { kind: 'deployment', targetId: deployment.id },
      { kind: 'error_group', targetId: groupOf('DatabaseConnectionTimeout') },
      { kind: 'trace', targetId: failedTrace },
    ]) {
      if (link.targetId) {
        await call(
          'POST',
          `/projects/${projectId}/incidents/${incident.id}/links`,
          {
            token,
            body: link,
          },
        );
      }
    }

    await call('PATCH', `/projects/${projectId}/incidents/${incident.id}`, {
      token,
      body: {
        status: 'investigating',
        startedAt: new Date(
          now - DEPLOY_AGO_MS + DEGRADATION_DELAY_MS,
        ).toISOString(),
      },
    });
  }

  console.log(
    [
      'Demo data ready.',
      `  Login:     ${EMAIL} / ${PASSWORD}`,
      `  Project:   ${PROJECT_NAME} (${projectId})`,
      `  API key:   ${apiKey}`,
      `  Telemetry: ${telemetry.spans.length} spans, ${telemetry.logs.length} logs, ${telemetry.errors.length} errors`,
      `  Incident:  #${incident?.number ?? '-'} created by the "Payment error rate" alert`,
    ].join('\n'),
  );
}

await main();
