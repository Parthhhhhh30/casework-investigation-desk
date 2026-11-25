# CASEWORK operations and verification

The default local server runs deterministic fictional incidents with external AI disabled. Use Node.js 22+, `npm install`, `npm run serve` and `npm test` from the repository root. The browser opens at `http://127.0.0.1:4173`.

## Optional provider setup

For a privately controlled deployment, create a separate PostgreSQL database, apply [`schema.sql`](../schema.sql), and configure the server-only values in [`.env.example`](../.env.example). Enable `CASEWORK_ALLOW_MODEL_CALLS=true` only with that database, a strong `CASEWORK_SESSION_SECRET` and a valid `GEMINI_API_KEY`. Never commit these values or expose them to the browser.

The GraphQL repair requires the `demo_draft_settings` table in hosted mode. A missing table or unavailable database causes the diagnostic to fail rather than claim a successful repair. Local development uses an isolated in-process test store.

Signed HttpOnly session cookies and atomic PostgreSQL quota reservations limit optional AI feedback to three requests per session and twelve globally per UTC day across deployments sharing the database. Requests consume quota before the provider call. These controls do not provide authenticated ticket ownership.

## Evidence and limits

- Response approval checks fictional case context and is invalidated when diagnostic evidence changes. It cannot guarantee correct support writing.
- A routine access issue needs a recorded security indicator before Security routing; suspected exposure and patent reasoning retain specialist routing.
- The GraphQL diagnostic writes an isolated fictional record and independently reads back its saved revision before reporting a pass.
- The knowledge panel screens recorded real model responses against case-specific heuristics, separately from eight deterministic routing cases. Neither establishes general model reliability.
- Browser casebooks remain in IndexedDB. Server storage contains fictional GraphQL settings and hashed AI-use counters, not customer messages or case history.

The [quality workflow](../.github/workflows/quality.yml) runs syntax, deterministic/API and Chromium checks, including repair, verification, closure refusal, suggestion handling and mobile use. The [provider check](../.github/workflows/ai-provider-check.yml) and [production browser workflow](../.github/workflows/production-browser.yml) are separate manual checks. They can call a provider or change fictional hosted records; do not run them against a shared demonstration without separate authorisation.
