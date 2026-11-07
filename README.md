# CASEWORK
**A working technical-support investigation desk: reproduce → diagnose → resolve or escalate → verify → document.**

**[Live application](https://casework-investigation-desk-parthhhh.vercel.app/)** · [Automated tests](https://github.com/Parthhhhhh30/casework-investigation-desk/actions)

CASEWORK is an independent interactive portfolio case study built around **four fictional support incidents**: an expired login session, a GraphQL mutation returning HTTP 200 but failing application validation, a stale document-import snapshot, and an unverified AI-generated patent citation. All organisations, communications, records and diagnostic environments are synthetic.

## What you can actually do
1. Open any incident and run a real HTTP request to a **controlled fictional server**; inspect returned errors and evidence.
2. Record findings, change a simulated configuration, rerun diagnostics and verify a fresh passing result.
3. Prepare a customer response, approve it locally, and close only when evidence and verification gates pass.
4. Escalate suspected confidentiality issues to Security and questionable patent reasoning to a qualified specialist; neither can be casually marked resolved.
5. Record an audit trail and publish a locally approved knowledge article after a verified technical resolution.
6. Request **real Gemini 3.5 Flash-Lite** feedback on a fictional response, review a proposed improvement and explicitly choose whether to copy it into an **unapproved** draft. No automated customer message or closure occurs.

## How it works
- **Client:** HTML, CSS and vanilla JavaScript; responsive investigation workspace; browser-local IndexedDB casebook.
- **Deterministic backend:** Vercel functions under `/api/graphql` and `/api/lab`, with reproducible HTTP responses and scenario-specific faults. No LLM determines incident status, evidence or closure.
- **Optional AI review:** `/api/ai` calls Google's Gemini API server-side, validates a constrained structured response and refuses unsupported assurances.
- **Abuse controls:** signed HttpOnly browser-session cookies and atomic Neon PostgreSQL quota reservations (up to **3 requests per session per UTC day**, **12 total per UTC day**). Requests consume quota before upstream calls; limits apply across deployments sharing the database. No Google credential or database URL is sent to the browser.

## Run and test
Node.js 22+ recommended. The default local mode runs the deterministic server and browser, with external AI disabled.

```bash
npm install
npm run serve
# open http://127.0.0.1:4173
npm test
```

GitHub Actions runs JavaScript syntax checks, deterministic/API tests and real Chromium end-to-end exercises, including a GraphQL repair/verification/closure path, illegal closure refusal, response suggestion handling and mobile use.

To enable the **optional real provider** in a privately controlled deployment, create a separate PostgreSQL database, apply `schema.sql`, and configure the server-only values described in `.env.example`. Set `CASEWORK_ALLOW_MODEL_CALLS=true` only with the database, a strong `CASEWORK_SESSION_SECRET`, and a valid `GEMINI_API_KEY`. The live-provider acceptance workflow can be triggered separately and uses fictional text only.

## Boundaries
This is **not** a connected vendor service, a real customer incident system, patent-law advice, or a shared authenticated ticket database. Browser casebooks are isolated and user-editable; the Neon database only stores model-use counters. Gemini supplies communication suggestions, never evidence, legal certification or autonomous case actions. All measurements and examples are demonstration results; no commercial deployment or customer outcomes are claimed.

Developed with AI-assisted implementation, reviewed through executable regression tests and live-provider acceptance checks.
