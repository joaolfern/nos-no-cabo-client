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

## Web Push (in this order)

Built on 2026-10-07 in both repos' working trees, uncommitted. Context: "Web Push" in
[`plans/form-rework.md`](plans/form-rework.md).

- [x] Make a VAPID key pair: `node scripts/vapidKeys.mjs` in `nos-sr/services/catalog`.
- [x] Put the public key in `wrangler.jsonc` (`env.staging.vars.VAPID_PUBLIC_KEY`) and in
      nos-client's `.env.production` (`VITE_VAPID_PUBLIC_KEY`).
- [x] `pnpm exec wrangler secret put VAPID_PRIVATE_KEY --env staging` in `services/catalog`.
- [ ] Publish `@nosnocabo/contract` 0.5.0 (the client doesn't need it; it sends the browser's
      own subscription JSON).
- [ ] Commit both repos. CI deploys the catalog (applies migration 0011, adds the hourly cron),
      then `pnpm run deploy:web`.
- [ ] Smoke test, once: submit a site, press the bell, close the tab, approve it with
      `pnpm review`, and wait for the notification (within the hour, from the cron).

## Phase 10: metrics (in this order)

Deployed by hand on 2026-10-05 from nos-sr branch `metrics` and nos-client's working tree, with
the capacity changes (one request per site page, 60 s client cache, 3-hour rank push). Context:
ADR 0006.

- [x] Create the metrics database `nnc-metrics-staging` (id in `services/metrics/wrangler.jsonc`).
- [x] Set `VISITOR_SALT` and `TURNSTILE_SECRET` on `nnc-metrics-staging`.
- [x] Deploy catalog → metrics → router → gateway, then the site (`pnpm run deploy:web`).
- [x] Smoke test: one `/r/` click was counted, and one vote passed Turnstile, reached the
      catalog's `likes` and was then removed.
- [x] Publish `@nosnocabo/contract` 0.4.0; nos-client depends on it (2026-10-05).
- [x] Commit both repos and merge `metrics` into nos-sr's `main` (CI redeployed, green).
- [x] The metrics cron ran: PNAAT's `rank_score` became 2.772589 from the smoke-test click
      (checked 2026-10-06).

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
  - `pnpm review list` (from the nos-sr root);
  - `pnpm review rebuild`;
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

## Docs site `docs.nosnocabo.com.br` (in this order)

- [ ] Review the reworked `docs/architecture/` (v0 + v1; `current/` and `target/` are gone) and
  commit it with `docs/site/`, `wrangler.docs.jsonc` and the d3 dev dependencies.
- [ ] `pnpm deploy:docs` (needs Docker for the diagrams and a `wrangler login`). The first
  deploy creates the `nosnocabo-docs` Worker and the `docs.nosnocabo.com.br` custom domain
  and its DNS record.
- [ ] Open https://docs.nosnocabo.com.br and check the map, a flow and the Diagrams tab.

## Domain `nosnocabo.com.br` (bought 2026-10-05)

The domain runs on the current stack (the `*-staging` Workers, D1 and queues): the site on
`nosnocabo.com.br`, the router on `nosnocabo.com.br/ring/*` and `/r/*`, and the API on
`api.nosnocabo.com.br`. Live since 2026-10-05: the site, `api.nosnocabo.com.br`, and the ring and short links on the
domain all work.

- [x] **Add the domain to Cloudflare:**
  1. In Cloudflare, add the domain `nosnocabo.com.br` on the Free plan.
  2. At registro.br, replace `a.auto.dns.br`/`b.auto.dns.br` with the two Cloudflare
     nameservers.
  3. Wait until Cloudflare shows the domain as **Active**.
- [x] **Turnstile:** add `nosnocabo.com.br` to the hostnames of the existing widget. The site
      key doesn't change.
- [x] **Tell the agent the domain is active.** It then pushes, CI deploys the API domain and
      the router's routes, and `pnpm run deploy:web` deploys the site's domain and the URLs
      baked into widget snippets.
- [x] **Always Use HTTPS:** `nosnocabo.com.br` → SSL/TLS → Edge Certificates → turn on "Always
      Use HTTPS". Today `http://nosnocabo.com.br` serves the site unencrypted (no redirect), so
      a browser that remembers the `http://` address shows "Not secure". Later, once all is
      well over HTTPS, consider HSTS on the same page (hard to undo, so not in a hurry).
- [ ] **Ring links fail open:** in the Cloudflare dashboard's route settings for the router
      (`nnc-router-staging`), set the request-limit failure mode of `nosnocabo.com.br/ring/*`
      and `nosnocabo.com.br/r/*` to **Fail open**. Over the daily request limit, members' ring links then land on the site
      instead of Cloudflare's error page. Check it's still set after the next router deploy.
- [ ] Redirect `www.nosnocabo.com.br` to `nosnocabo.com.br`: a Redirect Rule in the dashboard
      (needs a proxied DNS record for `www`).
- [ ] Set up Cloudflare caching for public lists and firewall rate-limiting rules, with
      thresholds that fit a classroom sharing one address. The Free plan includes one rate
      limiting rule.
- [x] **Report alerts** (2026-10-06): Email Routing is on (Cloudflare MX, SPF and DKIM; the old
      null MX and `-all` SPF were removed; DMARC `p=reject` stays). The catalog sends from
      `alertas@nosnocabo.com.br` to the verified destination stored in the `ALERT_TO` secret.
      To change the recipient: verify the new address in Email Routing, then
      `pnpm exec wrangler secret put ALERT_TO --env staging` in `services/catalog`.
- [x] The alert test arrived (2026-10-06); its report on PNAAT was declined (now `pnpm review dismiss <id>`).
- [ ] Plan future deploys so a column drop (like 0005) ships after the code that no longer
      uses it.

## Decisions waiting on you

- [ ] Remove the leftovers in `nos-client/.oxlintrc.json` from another project: the
      `android`/`ios`/`.expo` ignores, and the `zod` import ban pointing at a non-existent
      `src/lib/validation.ts`. Harmless either way.
