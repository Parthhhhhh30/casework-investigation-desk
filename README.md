# CASEWORK
**From reported fault to verified resolution — an interactive technical support investigation desk.**

**[Live demo](https://casework-investigation-desk-parthhhh.vercel.app/) · [GitHub-backed preview](https://casework-investigation-desk-9nllwwv1k-parthhhh.vercel.app/)**

CASEWORK is an independent portfolio exercise using four fictional support cases: login/access, silent failures, document integration and permissions, and questionable AI-generated patent material. Every organisation, case and investigation record is synthetic.

## Try it
1. Open a case, reproduce its fault, and inspect server diagnostic evidence.
2. Record observations, investigate the cause, and document next steps.
3. Apply a simulated correction and retest before verifying resolution.
4. Review escalation requirements, customer communications, investigation history and knowledge records.

## Architecture
Original responsive HTML/CSS/JavaScript UI; deterministic JavaScript case rules; simulated GraphQL and diagnostic serverless endpoints; IndexedDB local persistence. Optional Gemini communication critique is protected by a private access-code gate and remains disabled in production until model access and durable usage controls are validated.

## Local setup
Requires Node.js 20+. Run `npm run serve` and open `http://127.0.0.1:4173` to exercise the same-origin simulated GraphQL and diagnostic endpoints. Run `npm test` for deterministic rules and API contract tests. GitHub Actions additionally runs real Chromium end-to-end checks for all four cases, GraphQL repair, verified closure, legal escalation safeguards and browser reload.

## Limits and provenance
This is not a real customer, patent-service or production integration. Data are fictional; local browser data are editable and there is no authenticated multi-user database. Model suggestions cannot establish truth, provide legal advice or authorise closure. There are no commercial adoption or performance claims. Developed with AI-assisted implementation and testing.

**Release verification:** GitHub Actions passes deterministic and Chromium browser workflows. The GitHub-backed preview is deployed; live Gemini inference and final production promotion are not yet verified. The existing production deployment remains unchanged.
