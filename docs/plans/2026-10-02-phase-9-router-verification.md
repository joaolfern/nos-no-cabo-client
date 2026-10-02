# Phase 9: router and verification

Status: implemented and tested locally (2026-10-02); not deployed.

**Goal:** Make the widget's links work and verify that a member's site actually shows the widget.

**Decisions** (owner, 2026-10-02):
- A separate router Worker and a separate verification Worker.
- A manual "Verificar" can only grant the badge. Only the periodic re-check removes it, after
  two misses in a row (ADR 0001).
- No per-IP limits anywhere (memory: no-per-ip-limits). The verify cooldown is per site.

## Architecture

- **catalog** (owns D1). New `CatalogRpc` methods:
  - `getRing()`, extended to `{ version, sites: [{ id, url, shortCode }] }`.
  - `getVerificationTarget(id)` returns `{ id, url, status, verifiedAt }` or `null`.
  - `claimVerificationCheck(id)` is atomic. It sets `last_verification_check_at = now` only
    when the last check is over 60 s old, and returns a boolean.
  - `recordVerification(id, found, kind: 'manual' | 'recheck')`:

    | Kind | Found | Effect |
    |---|---|---|
    | manual | yes | `verified_at = COALESCE(verified_at, now)`, misses = 0 |
    | manual | no | nothing |
    | recheck | yes | misses = 0 |
    | recheck | no | misses + 1; at 2, `verified_at = NULL` and misses = 0 |

    Every recheck also sets `last_verification_check_at = now`.
  - `dueForRecheck(limit)` returns verified, published sites, oldest check first, skipping
    those checked in the last 20 h.
  - Migration `0010_verification.sql` adds `verification_misses INTEGER NOT NULL DEFAULT 0` and
    a partial index on `last_verification_check_at WHERE verified_at IS NOT NULL`.
- **verification Worker** (`services/verification`, `workers_dev: false`):
  - `POST /v1/websites/:id/verify` returns the contract's `VerificationResult`.
    - 404 when the site is unknown or not published.
    - 429 `rate_limited` inside the cooldown.
    - `reason: 'unreachable'` when the fetch fails, `reason: 'widget_not_found'` otherwise.
  - An hourly `scheduled()` checks up to 20 due sites. The Free plan allows about 50
    outbound requests per invocation.
  - `detectWidget(response, id, homeHosts)` uses HTMLRewriter. It looks for an element with
    `data-nnc-widget="<id>"` containing an `<a href>` whose host is in `HOME_HOSTS`.
    Pages are read up to 1 MB.
- **router Worker** (`services/router`, public `workers.dev`):
  - `/ring/:id/prev|next|random` and `/r/:code` answer with a 302 to the member site,
    `cache-control: no-store` and `x-robots-tag: noindex`.
  - Unknown ids and codes, an empty ring, or a catalog failure with no snapshot all redirect
    to `HOME_URL`.
  - An id not in the ring: next goes to the first site, prev to the last, random to any site.
  - Random is uniform over the snapshot and never the current site.
  - The snapshot lives in module memory. At most once a minute it asks `getRingVersion()`, and
    it refetches `getRing()` only on a new version. If the catalog fails, it keeps the stale
    snapshot.
  - `GET /robots.txt` disallows `/ring/` and `/r/`.
- **gateway:**
  - `POST /v1/websites/:id/verify` goes to the `VERIFICATION` service binding.
  - Every other `/v1/*` request still goes to the catalog.
- **Config:**
  - Staging `RING_BASE_URL` (client build) is the router's `workers.dev` URL.
  - `HOME_URL` and `HOME_HOSTS` (router and verification vars) list the SPA hosts:
    `nosnocabo.pages.dev`, `nosnocabo.joaolfern.workers.dev`, and later `nosnocabo.com.br`.

## Tasks (TDD, owner commits)

1. **Catalog:** migration 0010, `src/db/verification.ts`, `getRing` entries, and the RPC
   methods. Tests: `test/verification.test.ts` covers the cooldown, each row of the
   `recordVerification` table and the due-list order. Update `test/ring.test.ts` for the
   entries.
2. **Verification Worker:** `detectWidget` (fixtures: right id, wrong id, link outside the
   widget, no home link, nested markup); `verify()` and `recheck()` with injected deps; the Hono
   route and `scheduled`. Workspace entry and wrangler config (both environments, hourly
   cron, `CATALOG` RPC binding).
3. **Router Worker:**
   - `ring.ts`: pure navigation over the snapshot.
   - `snapshot.ts`: the version-checked cache with a clock and catalog injected.
   - The Hono app (redirects, unknown codes, `robots.txt`).
   - Workspace entry and wrangler config.
4. **Gateway:** the verify route goes to `VERIFICATION`, tested with stubs.
5. **Client:** the verify UI shows the 429 message. Document the staging `RING_BASE_URL`.
6. **Docs and CI:**
   - Update `10-services.puml` and `15-seq-verification.puml`.
   - Add the deploy steps (catalog → verification → router → gateway) to `workers.yml`
     and to the status section in `form-rework.md`.
   - Mark phase 9 in the roadmap.

## Review focus

- A snippet copied to another site (wrong id) never verifies.
- A widget that only mentions the home link outside `data-nnc-widget` doesn't verify.
- The router never redirects to the current site. When no other site is in the ring, every
  link goes to the home page.
- A catalog outage doesn't break redirects that already have a snapshot.
- The cooldown can't be bypassed by parallel requests (atomic claim).
