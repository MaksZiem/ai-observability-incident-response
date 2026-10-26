# Frontend — AI Observability & Incident Response

Next.js 16 (App Router, Server Components, Server Actions) + Tailwind 4. Dashboard do logów, metryk, trace'ów, błędów, deploymentów, incydentów i analizy AI. Design system: [`DESIGN.md`](DESIGN.md).

## Uruchomienie

Wymagania: Node 24 i działający backend (`../backend`).

```bash
npm install
npm run dev
```

Aplikacja działa pod `http://localhost:3000`. Po `npm run demo` w backendzie można się zalogować jako `demo@example.com` / `demo-password`.

## Zmienne środowiskowe (`.env.local`)

| Zmienna | Opis |
|---|---|
| `API_URL` | adres API dla serwera Next (Server Components i Server Actions) |
| `NEXT_PUBLIC_API_URL` | adres API dla przeglądarki — połączenie SSE z `/projects/:id/stream`; po zmianie trzeba zrestartować `npm run dev` |

## Skrypty

| Skrypt | Co robi |
|---|---|
| `npm run dev` | serwer deweloperski |
| `npm run build` / `npm start` | build produkcyjny i jego uruchomienie |
| `npm test` | testy Vitest czystych funkcji (`*.spec.ts`) |
| `npm run lint` | ESLint |

## Struktura

- `src/app/` — trasy: `(auth)` (logowanie, rejestracja), `(app)` (powłoka z sidebarem), `projects/[projectId]/…` (sekcje projektu), `platform` (stan samej platformy).
- `src/features/<domena>/` — typy, zapytania (`queries.ts`), Server Actions (`actions.ts`), komponenty i helpery jednej domeny.
- `src/components/ui/` — komponenty design systemu bez wiedzy o domenie; `src/components/layout/` — sidebar.
- `src/lib/` — infrastruktura: klient API, sesja, formatowanie.

## Jak to działa

- Token JWT jest w ciasteczku `httpOnly`; tylko serwer Next rozmawia z API (`lib/api.ts`).
- Filtry i zakres czasu są w URL, więc każdy widok da się udostępnić linkiem.
- Real-time: sidebar otwiera jedno połączenie SSE na projekt (token z `POST /auth/stream-token`) i po zdarzeniach odświeża tylko strony, których zdarzenie dotyczy.
