# Owner to-do

Tasks only the owner can do (GitHub, npm, Cloudflare, domains, commits). Agents keep this
list current: they add a task when work needs an owner step, and tick it when the owner says
it's done. Context for each step: "Current status and next steps" in
[`plans/form-rework.md`](plans/form-rework.md).

## Now

- [ ] **Commit both repos.** Nothing since phase 8 is committed.
  - nos-sr (branch `moderation`): contract 0.3.0, `packages/ip`, catalog migrations
    0003–0010, the router and verification Workers, the gateway changes, CI.
  - nos-client (branch `rework-appearance-internal`): report dialog, shared components,
    review notice, `nofollow`, the URL key change, `.env.example`, docs.
  - Then delete `nos-client/.superpowers/sdd/2026-10-02-catalog-derived-data/` (an executor
    ledger, gitignored).
- [ ] **Create the private moderation repo** on GitHub.
  1. Push `nos-sr/services/moderation` (already its own `git init`) to it.
  2. In nos-sr, remove the `services/moderation/` line from `.gitignore`.
  3. Run `git submodule add <url> services/moderation`.
- [ ] **Publish `@nosnocabo/contract` 0.3.0** (from `nos-sr/packages/contract`).
  - Then run `pnpm add @nosnocabo/contract@0.3.0` in nos-client.
  - Until then, `pnpm install` in nos-client breaks the build: it replaces a hand-copied
    local build.

## Staging deploy (in this order)

- [ ] Create the queues: `npx wrangler queues create moderation-jobs-staging` and
      `npx wrangler queues create moderation-jobs-staging-dlq`.
- [ ] Deploy the catalog: `npm run deploy:staging -w @nosnocabo/catalog`. This applies
      migrations 0003–0010. Deploy the rest right after: the old code can't insert once
      0005 is applied.
- [ ] Deploy verification, then the router: `npm run deploy:staging -w @nosnocabo/verification`
      and `npm run deploy:staging -w @nosnocabo/router`.
- [ ] Deploy moderation: `npm run deploy:staging` in `services/moderation`.
- [ ] Deploy the gateway: `npm run deploy:staging -w @nosnocabo/gateway`.
- [ ] Rebuild the client for staging with `VITE_RING_BASE_URL` set to the router's
      `workers.dev` URL (see `.env.example`).
- [ ] **Smoke test, one request at a time, no bursts:**
  - one submission, and watch it get moderated;
  - one report;
  - `npm run review:staging -- list`;
  - `npm run review:staging -- rebuild`;
  - one "Verificar" press;
  - one `/ring/<id>/next` link and one `/r/<code>` link on the router URL.
- [ ] **The next day:**
  - The 00:05 UTC AI backlog drain ran (moderation logs).
  - The hourly verification re-check ran (verification logs).

## GitHub (once available)

- [ ] Add repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in nos-sr
      and in the moderation repo.
- [ ] Add a deploy workflow to the moderation repo. It must run after the catalog deploy.
- [ ] Set up an npm Trusted Publisher for `@nosnocabo/contract` (repository
      `joaolfern/nos-no-cabo-server`, workflow `workers.yml`). Releases then publish from a
      `contract-vX.Y.Z` tag.

## Before launch (needs `nosnocabo.com.br`)

- [ ] **Buy `nosnocabo.com.br`.**
- [ ] **Before anyone installs a widget**, point these at the domain:
  - the client's `VITE_NOS_NO_CABO_URL` and `VITE_RING_BASE_URL`;
  - the gateway's `ALLOWED_ORIGINS`;
  - a production Turnstile widget.
- [ ] Route `nosnocabo.com.br/ring/*` and `/r/*` to the router Worker, and set its
      `HOME_URL`.
- [ ] Add the domain to the verification Worker's `HOME_HOSTS`.
- [ ] Set up Cloudflare caching for public lists and firewall rate-limiting rules on the
      domain, with thresholds that fit a classroom sharing one address.
- [ ] Create the production queues `moderation-jobs` and `moderation-jobs-dlq`.
- [ ] **Turn on report alerts:**
  1. Enable Email Routing on the domain.
  2. Verify your address as a destination.
  3. Add to the catalog's `wrangler.jsonc`, in each environment:
     `"send_email": [{ "name": "ALERT_EMAIL", "destination_address": "<you>" }]`
  4. Add the vars `ALERT_FROM` (e.g. `alertas@nosnocabo.com.br`) and `ALERT_TO`.
- [ ] Plan production deploys so a column drop (like 0005) ships after the code that no
      longer uses it.

## Decisions waiting on you

- [ ] Remove the leftovers in `nos-client/.oxlintrc.json` from another project: the
      `android`/`ios`/`.expo` ignores, and the `zod` import ban pointing at a non-existent
      `src/lib/validation.ts`. Harmless either way.
