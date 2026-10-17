import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  AnalysisModel,
  AnalysisModelOutput,
  ChatModelOutput,
} from '../src/analysis/analysis-model.js';
import type { ChatPrompt } from '../src/analysis/chat-prompt.js';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { User } from '../src/users/entities/user.entity.js';

const MINUTE_MS = 60_000;

class StubAnalysisModel extends AnalysisModel {
  analyze(): Promise<AnalysisModelOutput> {
    return Promise.resolve({
      result: {
        summary: 'Payment requests degraded after v1.42.3.',
        observedFacts: [{ statement: 'P95 increased', evidence: 'timeline' }],
        hypotheses: [
          {
            cause: 'Database pool too small',
            confidence: 'medium',
            reasoning: 'Errors started after the deployment',
          },
        ],
        relatedDeployments: ['v1.42.3'],
        suggestedInvestigation: ['Inspect pool metrics'],
      },
      model: 'stub',
      inputTokens: 1,
      outputTokens: 1,
    });
  }

  answer(prompt: ChatPrompt): Promise<ChatModelOutput> {
    const question = prompt.messages[prompt.messages.length - 1].content;

    return Promise.resolve({
      text: question.includes('v1.42.3')
        ? 'The deployment [deployment v1.42.3] preceded the errors.'
        : 'No evidence.',
      model: 'stub',
      inputTokens: 1,
      outputTokens: 1,
    });
  }
}

function buildTraffic(now: number) {
  const spans: Record<string, unknown>[] = [];

  for (let minute = 50; minute > 0; minute--) {
    const degraded = minute <= 15;

    for (let i = 0; i < 4; i++) {
      const traceId = `e2e-${minute}-${i}`;
      const startTime = new Date(now - minute * MINUTE_MS + i * 10_000);
      const failed = degraded && i < 2;

      spans.push(
        {
          traceId,
          spanId: 'root',
          service: 'api',
          name: 'POST /payments',
          startTime: startTime.toISOString(),
          durationMs: degraded ? 1300 : 110,
          status: failed ? 'error' : 'ok',
        },
        {
          traceId,
          spanId: 'db',
          parentSpanId: 'root',
          kind: 'server',
          service: 'payment-service',
          name: 'PostgreSQL',
          startTime: new Date(startTime.getTime() + 5).toISOString(),
          durationMs: degraded ? 1200 : 40,
          status: failed ? 'error' : 'ok',
        },
      );
    }
  }

  return spans;
}

describe('Incident investigation flow (e2e)', () => {
  const now = Date.now();
  const email = `e2e-${now}@example.com`;
  const otherEmail = `e2e-other-${now}@example.com`;
  let app: NestExpressApplication;
  let token: string;
  let otherToken: string;
  let projectId: string;
  let apiKey: string;
  let incidentId: string;

  const api = () => request(app.getHttpServer());
  const auth = () => ({ Authorization: `Bearer ${token}` });

  async function register(address: string): Promise<string> {
    const response = await api()
      .post('/api/auth/register')
      .send({ email: address, password: 'password123', name: 'E2E' })
      .expect(201);

    return response.body.accessToken as string;
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(AnalysisModel)
      .useClass(StubAnalysisModel)
      .compile();

    app = moduleRef.createNestApplication<NestExpressApplication>();
    configureApp(app);
    await app.init();

    token = await register(email);
    otherToken = await register(otherEmail);
  });

  afterAll(async () => {
    await app
      .get(DataSource)
      .getRepository(User)
      .delete([{ email }, { email: otherEmail }]);
    await app.close();
  });

  it('creates a project that other users cannot see', async () => {
    const response = await api()
      .post('/api/projects')
      .set(auth())
      .send({ name: 'E2E Shop', environment: 'production' })
      .expect(201);

    projectId = response.body.project.id;
    apiKey = response.body.apiKey;

    expect(response.body.project.apiKeyHash).toBeUndefined();

    await api()
      .get(`/api/projects/${projectId}`)
      .set({ Authorization: `Bearer ${otherToken}` })
      .expect(404);
  });

  it('ingests telemetry and masks secrets', async () => {
    const spans = buildTraffic(now);
    const deployedAt = new Date(now - 16 * MINUTE_MS).toISOString();
    const failedAt = new Date(now - 14 * MINUTE_MS).toISOString();

    await api()
      .post('/api/ingest/spans')
      .set('X-Api-Key', apiKey)
      .send({ spans })
      .expect(202);

    await api()
      .post('/api/ingest/deployments')
      .set('X-Api-Key', apiKey)
      .send({ version: 'v1.42.3', service: 'payment-service', deployedAt })
      .expect(201);

    await api()
      .post('/api/ingest/errors')
      .set('X-Api-Key', apiKey)
      .send({
        errors: [
          {
            service: 'payment-service',
            type: 'DatabaseConnectionTimeout',
            message: 'timeout after 5000ms',
            traceId: 'e2e-14-0',
            timestamp: failedAt,
          },
        ],
      })
      .expect(202);

    await api()
      .post('/api/ingest/logs')
      .set('X-Api-Key', apiKey)
      .send({
        logs: [
          {
            service: 'payment-service',
            level: 'error',
            message: 'Pool exhausted, token=abc123',
            traceId: 'e2e-14-0',
            timestamp: failedAt,
            attributes: { password: 'hunter2' },
          },
        ],
      })
      .expect(202);

    await api()
      .post('/api/ingest/logs')
      .set('X-Api-Key', 'obs_invalid')
      .send({ logs: [] })
      .expect(401);

    const logs = await api()
      .get(`/api/projects/${projectId}/logs?traceId=e2e-14-0`)
      .set(auth())
      .expect(200);

    expect(logs.body.items[0].message).toBe('Pool exhausted, token=[REDACTED]');
    expect(logs.body.items[0].attributes).toEqual({ password: '[REDACTED]' });
  });

  it('reports degraded metrics', async () => {
    const overview = await api()
      .get(`/api/projects/${projectId}/metrics/overview?range=1h`)
      .set(auth())
      .expect(200);

    expect(overview.body.summary.requests).toBe(200);
    expect(overview.body.series).toHaveLength(60);

    const services = await api()
      .get(`/api/projects/${projectId}/metrics/services?range=1h`)
      .set(auth())
      .expect(200);

    expect(services.body).toEqual([
      expect.objectContaining({
        service: 'api',
        requests: 200,
        status: 'degraded',
      }),
      expect.objectContaining({
        service: 'payment-service',
        requests: 200,
        status: 'degraded',
      }),
    ]);
  });

  it('builds the incident timeline and evidence', async () => {
    const incident = await api()
      .post(`/api/projects/${projectId}/incidents`)
      .set(auth())
      .send({
        title: 'Payment API degraded',
        severity: 'high',
        startedAt: new Date(now - 15 * MINUTE_MS).toISOString(),
      })
      .expect(201);

    incidentId = incident.body.id;

    const errors = await api()
      .get(`/api/projects/${projectId}/errors`)
      .set(auth())
      .expect(200);

    await api()
      .post(`/api/projects/${projectId}/incidents/${incidentId}/links`)
      .set(auth())
      .send({ kind: 'error_group', targetId: errors.body[0].id })
      .expect(201);

    await api()
      .post(`/api/projects/${projectId}/incidents/${incidentId}/links`)
      .set(auth())
      .send({ kind: 'trace', targetId: 'e2e-14-0' })
      .expect(201);

    const timeline = await api()
      .get(`/api/projects/${projectId}/incidents/${incidentId}/timeline`)
      .set(auth())
      .expect(200);

    const types = (timeline.body as { type: string }[]).map(
      (entry) => entry.type,
    );

    expect(types).toEqual(
      expect.arrayContaining([
        'deployment',
        'latency_spike',
        'error_rate_spike',
        'error_first_seen',
        'incident_created',
      ]),
    );

    const evidence = await api()
      .get(`/api/projects/${projectId}/incidents/${incidentId}/evidence`)
      .set(auth())
      .expect(200);

    expect(evidence.body.errorGroups[0].type).toBe('DatabaseConnectionTimeout');
    expect(evidence.body.traces[0].durationMs).toBeGreaterThan(1000);
  });

  it('runs the AI analysis and answers questions', async () => {
    const requested = await api()
      .post(`/api/projects/${projectId}/incidents/${incidentId}/analyses`)
      .set(auth())
      .expect(202);

    expect(requested.body.status).toBe('pending');

    await expect
      .poll(
        async () =>
          (
            await api()
              .get(
                `/api/projects/${projectId}/incidents/${incidentId}/analyses/${requested.body.id}`,
              )
              .set(auth())
          ).body.status,
        { timeout: 5_000 },
      )
      .toBe('completed');

    const chat = await api()
      .post(`/api/projects/${projectId}/incidents/${incidentId}/chat`)
      .set(auth())
      .send({ message: 'What changed before the errors?' })
      .expect(201);

    expect(chat.body[1]).toMatchObject({
      role: 'assistant',
      content: 'The deployment [deployment v1.42.3] preceded the errors.',
    });
  });

  it('updates the profile and the password', async () => {
    await api()
      .patch('/api/users/me')
      .set(auth())
      .send({ name: 'Alice' })
      .expect(200);

    await api()
      .post('/api/auth/change-password')
      .set(auth())
      .send({ currentPassword: 'wrong-password', newPassword: 'newpass123' })
      .expect(400);

    await api()
      .post('/api/auth/change-password')
      .set(auth())
      .send({ currentPassword: 'password123', newPassword: 'newpass123' })
      .expect(204);

    const login = await api()
      .post('/api/auth/login')
      .send({ email, password: 'newpass123' })
      .expect(200);

    expect(login.body.user.name).toBe('Alice');
  });
});
