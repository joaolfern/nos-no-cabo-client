# 0002. Move the backend to Cloudflare Workers

- Status: proposed
- Date: 2026-09-30

## Context

The backend (`nos-sr`) is a single Flask app with Postgres, run with Docker and Flask's debug
server. Production needs independent services (catalog, moderation, verification, metrics,
routing), background jobs, scheduled jobs and an AI classifier, at close to zero cost. The
frontend is already hosted on Cloudflare Pages (`nosnocabo.pages.dev`).

## Decision

Rebuild the backend as TypeScript Cloudflare Workers, one per service, behind a gateway Worker:

| Need | Cloudflare product |
| --- | --- |
| HTTP services | Workers (Hono router), connected by service bindings |
| Relational data | D1 (SQLite): one database for catalog, one for metrics |
| Short links, ring order cache | KV |
| Background SFW check | Queues → moderation consumer |
| Periodic verification, metric rollups | Cron Triggers |
| SFW classification | Workers AI (`@cf/meta/llama-guard-3-8b` for text; optional vision model for `og:image`) |
| Screenshots (optional) | Browser Rendering |
| Bot protection | Turnstile |

**Shared contract.** A small `contract` package with zod schemas for `/v1` is used by the Workers
for validation and by the SPA for types and MSW fixtures. This replaces the hand-copied
`src/interfaces/IWebsite.ts`, which currently disagrees with the backend (id types, `url`).

**Data ownership.** Only the catalog Worker writes the catalog database. Moderation and
verification call its internal API over service bindings, so each service can be deployed and
tested on its own.

## Free-tier budget

Checked on 2026-09-30; confirm again before launch.

- **Queues:** 10,000 operations per day, 24 h retention (free since February 2026).
- **D1:** 5 M rows read and 100 k rows written per day, 5 GB storage.
- **Workers AI:** 10,000 neurons per day. llama-guard-3-8b costs about 44 k neurons per million
  input tokens, so roughly 100 checks a day at ~2 k tokens each. That is enough for the expected
  volume of submissions. Excess jobs wait in the queue instead of failing.
- **Browser Rendering:** 10 browser-minutes per day. Screenshot moderation therefore stays
  optional; text plus `og:image` covers the default case.

Sources:

- [Queues on the free plan](https://developers.cloudflare.com/changelog/2026-02-04-queues-free-plan/)
- [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [Browser Rendering limits](https://developers.cloudflare.com/browser-rendering/limits/)

## Consequences

- The Python code is retired. Its scraping heuristics (title, description, favicon, theme colour)
  are ported to `HTMLRewriter` in the catalog Worker.
- Postgres data is exported once, with URLs restored from `url_mappings` (they are currently
  overwritten by short codes), and imported into D1.
- The admin password disappears from the client bundle. Moderation tooling, if needed, goes
  behind Cloudflare Access.
- Vendor lock-in to Cloudflare increases. It is limited by keeping business logic in plain
  TypeScript modules and the Worker entry points thin.

## Alternative considered

**GCP:** Cloud Run services, Cloud Tasks and Cloud Scheduler, Firestore or Cloud SQL, and the
Vertex AI safety classifier. It has a free tier too, but it scales to zero with cold starts,
Cloud SQL is not free, and it adds a second vendor next to Pages. It remains the fallback if
Workers AI moderation quality proves insufficient.
