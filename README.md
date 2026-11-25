# CASEWORK

A technical-support investigation desk for reproducing a problem, inspecting evidence and verifying a resolution before closing the case.

[Live application](https://casework-investigation-desk-parthhhh.vercel.app/) · [Automated checks](https://github.com/Parthhhhhh30/casework-investigation-desk/actions)

Support work can go wrong when a plausible explanation becomes a customer assurance before anyone has checked it. CASEWORK makes that boundary visible: a response needs local approval, a repair needs fresh evidence, and specialist questions remain escalated.

## Explore an investigation

Four fictional incidents cover an expired login session, a GraphQL mutation that returns HTTP 200 but fails validation, a stale document-import snapshot and an unverified AI-generated patent citation.

1. Run a real HTTP request against the controlled fictional server and inspect its response.
2. Record findings, change a simulated configuration and rerun the diagnostic.
3. Prepare and approve a customer response. Closure requires passing evidence and verification gates.
4. Escalate suspected confidentiality issues to Security and patent reasoning to a qualified specialist.
5. After a verified technical resolution, approve a knowledge article locally and inspect the audit trail.

Optional Gemini feedback can suggest improvements to a fictional response. You decide whether to copy a suggestion into an **unapproved** draft. It cannot send a message, determine incident status or close a case.

## Run locally

Node.js 22+ is recommended. External AI is disabled in the default local mode.

```sh
npm install
npm run serve
# Open http://127.0.0.1:4173
npm test
```

The interface uses HTML, CSS and JavaScript, with browser-local IndexedDB casebooks. Vercel functions provide deterministic lab and GraphQL responses. Hosted GraphQL settings and optional AI quotas use Neon PostgreSQL; the Google API key stays server-side.

GitHub Actions runs syntax checks, deterministic/API tests and Chromium journeys, including repair, closure refusal, response suggestions and mobile use. Optional provider setup, storage behaviour and manual workflow boundaries are in [operations and verification](docs/OPERATIONS.md).

## Evidence and limitations

All organisations, communications, records and diagnostic environments are synthetic. This is an independent prototype, not a connected vendor service, real customer incident system or patent-law advice. No commercial customer outcomes are claimed.

Response approval checks are guardrails, not a guarantee of accurate support writing. Recorded model responses can be screened against case-specific rules; those results do not establish general model reliability.

Browser casebooks are isolated and user-editable, rather than a shared authenticated ticket database. Server storage contains fictional settings and hashed model-use counters, not customer messages or case history. Optional model requests are quota-limited and require server configuration.

Developed with AI-assisted implementation and reviewed through executable regression tests and separately recorded provider acceptance checks.
