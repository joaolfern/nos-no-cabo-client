# Owner to-do

Tasks only the owner can do (GitHub, npm, Cloudflare, domains, commits). Agents keep this
list current: they add a task when work needs an owner step, and tick it when the owner says
it's done. Context for each step: "Current status and next steps" in
[`plans/form-rework.md`](plans/form-rework.md).

## Now

- [x] Commit both repos (history rewritten to one identity and one-line messages, 2026-10-02).
- [ ] Delete `nos-client/.superpowers/sdd/2026-10-02-catalog-derived-data/` (an executor
      ledger, gitignored).
- [x] Create the private moderation repo (`joaolfern/-nos-no-cabo-moderation`), push it and
      mount it as the `services/moderation` submodule.
- [ ] Once you're happy with the rewritten history, delete the backups in
      `~/dev/joao/git-backups-2026-10-02/`.
- [x] **Publish `@nosnocabo/contract` 0.3.0** (from `nos-sr/packages/contract`).
  - Then run `pnpm add @nosnocabo/contract@0.3.0` in nos-client.
  - Until then, `pnpm install` in nos-client breaks the build: it replaces a hand-copied
    local build.

- [x] **Publish `@nosnocabo/contract` 0.3.1** (from `nos-sr/packages/contract`): adds the
      zod-free entries `@nosnocabo/contract/categories` and `/url`, which take Zod out of the
      site's bundle. nos-client now depends on it (2026-10-05).

## Staging deploy (in this order)

CI did the catalog, verification, router and gateway on 2026-10-02 (migrations 0003–0010
applied). Staging reads, search and ring/short links checked.

- [x] Create the queues: `pnpm exec wrangler queues create moderation-jobs-staging` and
      `pnpm exec wrangler queues create moderation-jobs-staging-dlq`.
- [x] Deploy the catalog: `pnpm --filter @nosnocabo/catalog run deploy:staging`. This applies
      migrations 0003–0010. Deploy the rest right after: the old code can't insert once
      0005 is applied.
- [x] Deploy verification, then the router: `pnpm --filter @nosnocabo/verification run deploy:staging`
      and `pnpm --filter @nosnocabo/router run deploy:staging`.
- [x] Deploy moderation: `pnpm run deploy:staging` in `services/moderation` (2026-10-05).
- [x] Deploy the gateway: `pnpm --filter @nosnocabo/gateway run deploy:staging`.
- [x] Deploy the frontend (`nosnocabo` Worker) against staging: `pnpm run deploy:web`
      builds with `.env.production` (real API, router URL, real Turnstile key) and uploads
      `dist` (first run 2026-10-02).
- [ ] **Smoke test, one request at a time, no bursts:**
  - one submission, and watch it get moderated;
  - one report;
  - `pnpm run review:staging list`;
  - `pnpm run review:staging rebuild`;
  - one "Verificar" press;
  - one `/ring/<id>/next` link and one `/r/<code>` link on the router URL.
- [ ] **The next day:**
  - The 00:05 UTC AI backlog drain ran (moderation logs).
  - The hourly verification re-check ran (verification logs).

## GitHub (once available)

- [x] Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` to nos-sr (on the `staging`
      environment). CI now deploys catalog, verification, router and gateway on every push to
      `main` (first run: 2026-10-02, green).
- [ ] Add the same secrets to the moderation repo, once it has a deploy workflow.
- [ ] Add a deploy workflow to the moderation repo. It must run after the catalog deploy.
- [ ] Set up an npm Trusted Publisher for `@nosnocabo/contract` (repository
      `joaolfern/nos-no-cabo-server`, workflow `workers.yml`). Releases then publish from a
      `contract-vX.Y.Z` tag.

## Domain `nosnocabo.com.br` (bought 2026-10-05)

The domain runs on the current stack (the `*-staging` Workers, D1 and queues): the site on
`nosnocabo.com.br`, the router on `nosnocabo.com.br/ring/*` and `/r/*`, and the API on
`api.nosnocabo.com.br`. The config is ready in both repos but not pushed: routes on a zone
that isn't active would fail the deploy.

- [ ] **Add the domain to Cloudflare:**
  1. In Cloudflare, add the domain `nosnocabo.com.br` on the Free plan.
  2. At registro.br, replace `a.auto.dns.br`/`b.auto.dns.br` with the two Cloudflare
     nameservers.
  3. Wait until Cloudflare shows the domain as **Active**.
- [ ] **Turnstile:** add `nosnocabo.com.br` to the hostnames of the existing widget. The site
      key doesn't change.
- [ ] **Tell the agent the domain is active.** It then pushes, CI deploys the API domain and
      the router's routes, and `pnpm run deploy:web` deploys the site's domain and the URLs
      baked into widget snippets.
- [ ] Redirect `www.nosnocabo.com.br` to `nosnocabo.com.br`: a Redirect Rule in the dashboard
      (needs a proxied DNS record for `www`).
- [ ] Set up Cloudflare caching for public lists and firewall rate-limiting rules, with
      thresholds that fit a classroom sharing one address. The Free plan includes one rate
      limiting rule.
- [ ] **Turn on report alerts:**
  1. Enable Email Routing on the domain.
  2. Verify your address as a destination.
  3. Add this to the catalog's `staging` block in `wrangler.jsonc`:
     `"send_email": [{ "name": "ALERT_EMAIL", "destination_address": "<you>" }]`
  4. Add the vars `ALERT_FROM` (e.g. `alertas@nosnocabo.com.br`) and `ALERT_TO`.
- [ ] Plan future deploys so a column drop (like 0005) ships after the code that no longer
      uses it.

## Decisions waiting on you

- [ ] Remove the leftovers in `nos-client/.oxlintrc.json` from another project: the
      `android`/`ios`/`.expo` ignores, and the `zod` import ban pointing at a non-existent
      `src/lib/validation.ts`. Harmless either way.
