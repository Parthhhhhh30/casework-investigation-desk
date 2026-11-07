# CASEWORK
**From reported fault to verified resolution — an interactive technical support investigation desk.**

**[Live demo](https://casework-investigation-desk-parthhhh.vercel.app/)** · [GitHub-backed preview](https://casework-investigation-desk-9nllwwv1k-parthhhh.vercel.app/)**

CASEWORK is an independent portfolio exercise using four fictional support cases: login/access, silent failures, document integration and permissions, and questionable AI-generated patent material. Every organisation, case and investigation record is synthetic.

## Try it
1. Open a case, reproduce its fault, and inspect server diagnostic evidence.
2. Record observations, investigate the cause, and document next steps.
3. Apply a simulated correction and retest before verifying resolution.
4. Review escalation requirements, customer communications, investigation history and knowledge records.

## Architecture
Original responsive HTML/CSS/JavaScript UI; deterministic JavaScript case rules; simulated GraphQL and diagnostic serverless endpoints; IndexedDB local persistence. Optional Gemini communication critique is **disabled** until public endpoint authentication and usage limits are implemented.

## Local setup
Requires Node.js 20+. Run `npm test` for the deterministic logic and API contract tests. The static site and its serverless endpoints must be served together for full functionality.

## Limits and provenance
This is not a real customer, patent-service or production integration. Data are fictional; local browser data are editable and there is no authenticated multi-user database. Model suggestions cannot establish truth, provide legal advice or authorise closure. There are no commercial adoption or performance claims. Developed with AI-assisted implementation and testing.

**Release verification:** Source is published and the GitHub-backed Vercel preview is deployed. GitHub Actions passes the included deterministic regression tests. Full interactive browser acceptance and real Gemini evaluation are not yet complete. The existing production deployment has not been replaced by this preview.
