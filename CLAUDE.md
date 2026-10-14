## Zasady pracy
- Backend (`backend/`) piszę SAMODZIELNIE w celach nauki.
  CLAUDE pokazuje kod do przepisania, ze ścieżką pliku i krótkim wyjaśnieniem
  co i dlaczego.
- CLAUDE sam edytuje pliki na backendzie tylko jesli ja go poprosze
- Dzielimy pracę na małe kroki, jeden plik lub koncept na raz.
- Gdy poproszę o review, Claude czyta moje pliki i wskazuje błędy,
  ale ich nie poprawia.
- Frontend (`frontend/`): piszę SAMODZIELNIE w celach nauki.
  CLAUDE pokazuje kod do przepisania, ze ścieżką pliku i krótkim wyjaśnieniem
  co i dlaczego.
- CLAUDE sam edytuje pliki na frontendzie tak samo jak na backendzie tylko jesli ja go poprosze
- Nie dodawaj komentarzy do kodu
- Technologie i wzorce pisania kodu są takie same jak w projekcie
  `~/Desktop/ai-agents-platform`. W razie wątpliwości co do stylu
  (struktura modułów, DTO, encje, serwisy, Server Actions, komponenty)
  wzoruj się na tamtym projekcie.

## Struktura repo
- `backend/` — NestJS (TypeScript, ES modules), TypeORM + PostgreSQL
- `frontend/` — Next.js (App Router, TypeScript, Tailwind)

## Konwencje backendu
- ORM: TypeORM (nie Prisma).
- Bez surowego SQL w kodzie aplikacji (`dataSource.query(...)`,
  `queryRunner.query(...)` itp.) — wszystko przez repozytoria i metody TypeORM.
  Wyjątek: pliki migracji generowane przez TypeORM.
- Zmiany struktury bazy tylko przez migracje (`synchronize: false`).
- Projekt jest ESM — importy własnych plików z końcówką `.js`.
- Zmienne środowiskowe walidowane przez Zod w `src/config/env.ts`,
  odczyt przez `ConfigService<Env, true>`.
- Walidacja wejścia przez DTO z `class-validator` (globalny `ValidationPipe`).
- Testy: Vitest. Lint: oxlint. Formatowanie: Prettier.
- Jeden moduł Nest na domenę: `<domena>/` z `<domena>.module.ts`,
  `<domena>.controller.ts`, `<domena>.service.ts`, `dto/`, `entities/`.

## Konwencje frontendu
- Design system: `frontend/DESIGN.md` (do stworzenia). Gdy już powstanie,
  każdy kod frontendu, który pokazuje Claude, musi być z nim zgodny.
- Struktura `frontend/src/` (grupowanie po domenie):
  - `app/` — tylko trasy (page, layout, error, loading, not-found) i rzeczy
    używane przez jedną stronę (np. `settings/actions.ts`).
  - `components/ui/` — design system bez wiedzy o domenie (Button, Input...).
    Nie importuje nic z `features/`.
  - `components/layout/` — powłoka aplikacji (sidebar).
  - `features/<domena>/` — `projects`, `overview`, `services`, `errors`,
    `logs`, `traces`, `metrics`, `incidents`, `deployments`, `analysis`,
    `alerts`, `auth`. W środku: `components/`, `actions.ts`
    (Server Actions), `types.ts`, helpery domeny.
  - `lib/` — infrastruktura bez domeny (`api.ts`, `session.ts`, `format.ts`).
    Nie importuje nic z `features/`.
  - Importy bezpośrednio do pliku, bez `index.ts` (barrel).

---

# AI Observability & Incident Response Platform

## 1. Overview

Build a developer-focused observability platform for monitoring applications in production.

The platform should collect and correlate:

* logs,
* metrics,
* traces,
* errors,
* deployment events,
* application metadata.

The main purpose is to help developers answer:

> What is happening in my production system?

and:

> Why is it happening?

AI should be used as an analysis layer on top of structured observability data.

The product should not be just a log viewer with a chatbot.

Its main value should come from combining multiple sources of production information.

---

# 2. Target User

The primary users are:

* software developers,
* backend engineers,
* DevOps engineers,
* SREs,
* engineering teams.

The user owns or maintains an application and wants to monitor its health.

---

# 3. Core User Journey

Typical workflow:

1. User creates a project.
2. User receives a project/API key.
3. User connects an application.
4. Application sends telemetry.
5. Platform ingests telemetry.
6. Platform stores and processes telemetry.
7. Dashboard displays application health.
8. User notices an anomaly.
9. User opens the relevant endpoint/error/trace.
10. User investigates related logs and metrics.
11. User opens an incident.
12. AI analyzes the available evidence.
13. AI generates a structured incident summary.
14. User investigates the suggested causes.
15. User resolves the incident.
16. The platform stores the incident history.

---

# 4. Application Structure

Main navigation:

```text
Overview
Services
Errors
Logs
Traces
Metrics
Incidents
Deployments
AI Analysis
Settings
```

The interface should feel like a professional developer tool.

---

# 5. Project Management

The user can create projects.

Example:

```text
My E-commerce API
Production
```

A project should have:

* name,
* environment,
* API key,
* services,
* telemetry configuration.

Possible environments:

```text
development
staging
production
```

---

# 6. Overview Dashboard

The main dashboard should show system health.

Example:

```text
Production

Requests       1.24M
Error Rate       2.8%
P95 Latency      842ms
Active Users     18,421
```

Below:

```text
Request volume
Error rate
Latency
```

The dashboard should provide time-range selection:

```text
Last 15 minutes
Last hour
Last 24 hours
Last 7 days
```

---

# 7. Services

The platform should understand that a project may contain multiple services.

Example:

```text
Services

api
payment-service
auth-service
worker
notification-service
```

Each service should have its own health overview.

Example:

```text
payment-service

Requests       421k
Error rate     3.8%
P95 latency    921ms

Status:
DEGRADED
```

---

# 8. Metrics

The platform should collect basic metrics.

Examples:

* request count,
* error count,
* error rate,
* latency,
* CPU,
* memory,
* database connections,
* queue depth.

The initial version can focus primarily on application-level metrics.

The dashboard should display time-series charts.

---

# 9. Logs

Users should be able to browse application logs.

Example:

```text
14:32:11 INFO
POST /payments

14:32:12 INFO
Payment processing started

14:32:13 ERROR
Database connection timeout

14:32:13 ERROR
Payment failed
```

Users should be able to filter logs by:

* time,
* service,
* level,
* endpoint,
* trace ID,
* request ID.

---

# 10. Log Detail

Opening a log should show structured data.

Example:

```text
Error

Database connection timeout

Service:
payment-service

Trace:
abc123

Request:
POST /payments

User:
user_18291

Timestamp:
14:32:13
```

Additional metadata should be expandable.

---

# 11. Traces

The platform should support distributed traces.

Example:

```text
POST /payments

Total duration: 1.42s

API Gateway       12ms
Authentication     8ms
Payment Service   82ms
PostgreSQL      1210ms
Response          20ms
```

The trace view should make bottlenecks visually obvious.

Users should be able to click individual spans and inspect:

* duration,
* service,
* operation,
* metadata,
* errors,
* logs associated with the span.

---

# 12. Correlation

One of the most important features is correlation between telemetry types.

A user should be able to go from:

```text
Error
 ↓
Trace
 ↓
Logs
 ↓
Service
 ↓
Deployment
```

and vice versa.

Example:

An error contains a trace ID.

The trace contains several spans.

A slow span contains associated logs.

The service has a recent deployment.

The platform should expose these relationships.

---

# 13. Error Tracking

The platform should group similar errors.

Instead of showing:

```text
500
500
500
500
500
```

it should show:

```text
DatabaseConnectionTimeout

Occurrences:
1,842

Affected endpoint:
POST /payments

First seen:
14:03

Last seen:
14:31
```

Errors should have statuses:

```text
OPEN
INVESTIGATING
RESOLVED
```

---

# 14. Deployment Tracking

Users should be able to register or ingest deployment events.

Example:

```text
Deployments

v1.42.3
Today 14:00
production

v1.42.2
Yesterday 18:42
production
```

Deployments should appear on the metrics timeline.

This allows the user to correlate:

```text
deployment
      ↓
latency increase
      ↓
error increase
```

---

# 15. Incident Management

Users should be able to create an incident.

Example:

```text
Incident #382

Title:
Payment API degraded

Severity:
HIGH

Status:
INVESTIGATING

Assigned:
Alice

Started:
14:04
```

The incident should contain:

* timeline,
* related errors,
* metrics,
* traces,
* logs,
* deployments,
* notes,
* AI analysis.

---

# 16. Incident Timeline

Example:

```text
14:00
Deployment v1.42.3

14:04
P95 latency increases

14:05
Error rate increases

14:07
Database connection usage increases

14:10
Incident created

14:12
AI analysis requested
```

This timeline should be generated from system events where possible.

---

# 17. AI Analysis

AI should analyze structured evidence rather than receiving random logs.

Example input:

```text
Metrics:
P95 latency +320%

Errors:
DatabaseConnectionTimeout × 1,842

Deployment:
v1.42.3 at 14:00

Trace:
POST /payments has PostgreSQL span > 1s

Logs:
Database pool exhausted
```

AI should produce a structured analysis.

Example:

```text
Incident Analysis

Summary

Payment requests are experiencing elevated
latency and database-related failures.

Evidence

• P95 latency increased 3.2x
• Error rate increased after deployment
• Database connection usage increased
• Most errors occur in /payments

Related deployment

v1.42.3

Potential causes

1. Database connection pool configuration
2. Increased query duration
3. Connection leak

Suggested investigation

1. Inspect database connection pool metrics
2. Compare v1.42.3 configuration
3. Inspect slow queries
```

The AI should clearly distinguish:

* observed facts,
* hypotheses,
* suggested investigation.

It should not present speculation as confirmed root cause.

---

# 18. AI Chat / Investigation Assistant

The user should be able to ask questions about an incident.

Example:

```text
Why did latency increase?
```

or:

```text
What changed before the errors started?
```

or:

```text
Show me similar incidents.
```

or:

```text
Which service is most likely involved?
```

The AI should answer using the available observability data.

Responses should reference the underlying evidence.

---

# 19. Similar Incidents

The platform should maintain incident history.

Example:

```text
Similar incidents

#312
Database connection pool exhaustion
3 months ago

#241
Payment service latency
5 months ago
```

The user should be able to open historical incidents and compare them.

---

# 20. Alerts

The platform should support basic alert rules.

Example:

```text
Create Alert

Metric:
Error rate

Condition:
> 5%

Duration:
5 minutes

Service:
payment-service
```

Possible actions:

```text
Create incident
Send webhook
```

Email/Slack integrations can be future functionality.

---

# 21. Observability Data Pipeline

The architecture should conceptually look like:

```text
Application
     │
     ↓
Telemetry / SDK
     │
     ↓
Collector / Ingestion API
     │
     ↓
Processing
     │
     ├── Logs
     ├── Metrics
     ├── Traces
     └── Errors
     │
     ↓
Storage
     │
     ↓
API
     │
     ↓
Next.js Dashboard
```

AI analysis should operate on top of this data.

---

# 22. Data Model Concepts

The system will likely contain concepts such as:

```text
Project
Environment
Service
Log
Metric
Trace
Span
Error
Deployment
Incident
Alert
AIAnalysis
```

The exact schema can evolve.

The data model should support correlation between these entities.

---

# 23. Real-Time Updates

The dashboard should update without manual refresh.

Examples:

* new errors appear,
* metrics update,
* incident status changes,
* logs arrive,
* traces are processed.

WebSockets or Server-Sent Events can be used.

The implementation should choose the appropriate technology based on the data flow.

---

# 24. Observability of the Observability Platform

The platform itself should also be designed with reliability in mind.

The system should monitor:

* ingestion latency,
* dropped telemetry,
* processing failures,
* queue depth,
* storage errors,
* AI analysis failures.

The platform should never silently lose telemetry.

---

# 25. Security

Important requirements:

* API key authentication for telemetry ingestion,
* project isolation,
* environment isolation,
* authenticated dashboard,
* authorization,
* rate limiting,
* input validation,
* secrets protection.

Telemetry may contain sensitive data.

The platform should provide mechanisms to avoid accidentally exposing secrets or sensitive fields.

---

# 26. Future Features

Possible future functionality:

* Slack integration,
* PagerDuty-style notifications,
* GitHub integration,
* automatic deployment correlation,
* anomaly detection,
* SLOs,
* uptime monitoring,
* infrastructure metrics,
* browser monitoring,
* mobile monitoring,
* AI-generated postmortems,
* automated incident reports.

These should not be required for the initial implementation.

---

# 27. Product Goal

The final product should demonstrate:

> A production-oriented observability platform that combines logs, metrics, traces, errors and deployments and uses AI to help developers investigate incidents.

The primary demo should look like:

```text
Application
      ↓
Telemetry
      ↓
Platform
      ↓
Dashboard
      ↓
Anomaly detected
      ↓
Incident
      ↓
Logs + Metrics + Traces + Deployment
      ↓
AI Analysis
      ↓
Investigation
      ↓
Resolution
      ↓
Incident History
```

The application should feel like a real developer infrastructure product rather than a dashboard built solely to demonstrate charts.
