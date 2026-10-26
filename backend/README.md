# Backend — AI Observability & Incident Response

NestJS + TypeORM + PostgreSQL. Zbiera logi, spany, błędy i deploymenty, liczy metryki, prowadzi incydenty i analizuje je przez Gemini.

## Uruchomienie

Wymagania: Node 24, PostgreSQL, Redis (kolejka ingestu).

```bash
psql -d postgres -c "CREATE ROLE observability WITH LOGIN PASSWORD 'observability';"
psql -d postgres -c "CREATE DATABASE ai_observability OWNER observability;"
psql -d postgres -c "CREATE DATABASE ai_observability_test OWNER observability;"

cp .env.example .env
npm install
npm run migration:run
npm run start:dev
```

API działa pod `http://localhost:3001/api`, health check pod `/api/health`.

## Zmienne środowiskowe

| Zmienna | Opis |
|---|---|
| `DATABASE_URL` | baza aplikacji |
| `REDIS_URL` | Redis dla kolejki ingestu (domyślnie `redis://localhost:6379`) |
| `QUEUE_PREFIX` | prefiks kluczy kolejki w Redisie (domyślnie `observability`; testy e2e używają `observability-test`) |
| `JWT_SECRET` | min. 32 znaki, np. `openssl rand -base64 48` |
| `JWT_EXPIRES_IN_SECONDS` | ważność tokena dostępu (domyślnie 3600) |
| `GEMINI_API_KEY` | klucz z aistudio.google.com |
| `GEMINI_MODEL` | domyślnie `gemini-3.8-flash` |
| `ALLOW_PRIVATE_WEBHOOKS` | `true` tylko lokalnie — pozwala na webhooki do `localhost` |
| `FRONTEND_URL` | origin dopuszczony przez CORS |
| `TEST_DATABASE_URL` | opcjonalnie; domyślnie `DATABASE_URL` z sufiksem `_test` |

## Skrypty

| Skrypt | Co robi |
|---|---|
| `npm run start:dev` | serwer z przeładowaniem |
| `npm test` | testy jednostkowe |
| `npm run test:e2e` | build, migracje bazy testowej i test pełnego przepływu (AI zastąpione atrapą) |
| `npm run demo` | wypełnia działający backend danymi demo (patrz niżej) |
| `npm run migration:generate -- src/database/migrations/Nazwa` | nowa migracja z encji |
| `npm run migration:run` | wykonanie migracji |
| `npm run lint` / `npm run format` | oxlint / Prettier |

## Dane demo

Przy działającym backendzie:

```bash
npm run demo
```

Tworzy użytkownika `demo@example.com` / `demo-password` i od nowa projekt „My E-commerce API” z 3 godzinami ruchu:
deploy `v1.42.3` (zmniejszenie puli połączeń do 5) → po 4 minutach wzrost latency i błędów `DatabaseConnectionTimeout`
→ alert tworzy incydent z podpiętymi dowodami. Do tego dwa historyczne, rozwiązane incydenty do wyszukiwania podobnych.
Adres API można zmienić przez `DEMO_API_URL`.

## Kolejka ingestu

`POST /ingest/logs`, `/ingest/spans` i `/ingest/errors` po walidacji i sprawdzeniu klucza API wrzucają batch do kolejki BullMQ (`ingest`) i od razu odpowiadają `202 { accepted }`. Worker (`IngestProcessor`, 4 joby równolegle) zapisuje go przez `LogsService`, `TracesService` i `ErrorsService`.

- Brakujący `timestamp` logu lub błędu jest uzupełniany czasem przyjęcia requestu, zanim batch trafi do kolejki.
- Nieudany zapis (np. baza niedostępna) jest ponawiany 8 razy z wykładniczym odstępem od 2 s (łącznie ok. 8 minut), potem job trafia do kolejki `ingest-dead-letter` razem z błędem — nic nie ginie po cichu.
- Głębokość kolejki, ponowienia, dead-letter i opóźnienie kolejki są w `GET /platform/stats` (`queue`, `queueLagMs`, `ingest.*.stored/retried/deadLettered`), a dostępność Redisa w `GET /health` (`ingestQueue`).
- `POST /ingest/deployments` zostaje synchroniczny, bo zwraca utworzony deployment.

## API

Wszystkie ścieżki mają prefiks `/api`.

| Obszar | Endpointy | Uwierzytelnienie |
|---|---|---|
| Konto | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/change-password`, `PATCH /users/me` | JWT (`Authorization: Bearer`) |
| Projekty | `/projects`, `POST /projects/:id/api-key/rotate` | JWT |
| Ingest | `POST /ingest/logs`, `/ingest/spans`, `/ingest/errors`, `/ingest/deployments` | `X-Api-Key` |
| Logi | `GET /projects/:id/logs` (filtry, kursor), `/logs/:logId` | JWT |
| Trace'y | `GET /projects/:id/traces`, `/traces/:traceId` | JWT |
| Błędy | `GET /projects/:id/errors`, `/errors/:groupId/events`, `PATCH /errors/:groupId` | JWT |
| Deploymenty | `GET`/`POST /projects/:id/deployments` | JWT |
| Metryki | `GET /projects/:id/metrics/overview?range=`, `/metrics/services` | JWT |
| Incydenty | `/projects/:id/incidents` + `/notes`, `/links`, `/timeline`, `/evidence`, `/similar` | JWT |
| AI | `/incidents/:incidentId/analyses`, `/incidents/:incidentId/chat` | JWT |
| Alerty | `/projects/:id/alerts`, `POST /alerts/:ruleId/evaluate` | JWT |
| Real-time | `POST /auth/stream-token`, potem SSE `GET /projects/:id/stream?token=` | token strumienia |
| Platforma | `GET /health` (publiczny), `GET /platform/stats` | — / JWT |

## Znane ograniczenia

- Restart w trakcie analizy AI zostawia ją w stanie `pending`.
- Kolejka daje dostarczenie „co najmniej raz”: jeśli worker padnie po zapisie, a przed potwierdzeniem joba, batch zapisze się ponownie.
- Joby z `ingest-dead-letter` nie mają jeszcze endpointu do ponownego przetworzenia — trzeba je przenieść ręcznie (np. skryptem z `bullmq`).
- Scheduler alertów, liczniki rate limitingu, szyna zdarzeń SSE i statystyki platformy żyją w pamięci jednego procesu; przy wielu instancjach trzeba je przenieść do Redisa.
- Projekt ma jednego właściciela — brak członków zespołu, ról i przypisywania incydentów.
- `/platform/stats` pokazuje statystyki całej platformy każdemu zalogowanemu użytkownikowi; w produkcji powinien być tylko dla administratorów.
