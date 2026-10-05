# 0006. Metrics: cookieless clicks, net likes

- Status: accepted
- Date: 2026-10-05
- Builds on: [0004](0004-ranking.md) (the score), [0005](0005-derived-data.md) (absolute pushes)

## Context

"Melhores" needs clicks per site (ADR 0004), and the website page shows visits, recent visits,
referrals and likes. The app is shown in colleges, where a whole room shares one IPv4 address,
so no limit may key on an IP or a session. Nothing about a visitor should be stored or
followed across days, and the site has no consent banner.

## Decision

- **A separate `metrics` Worker owns its own D1.** The router records clicks over RPC
  (`MetricsRpc.recordClick`); the gateway forwards `GET /v1/websites/:id/stats` and
  `POST /v1/websites/:id/votes` to it. Only the catalog writes the catalog: a cron every 3
  hours pushes absolute `rank_score` and `likes` values through `CatalogRpc.setMetrics`, and
  only the ones that changed. Hourly would cost about 24k D1 writes a day at 200 active sites,
  a quarter of the Free plan's 100k; every 3 hours costs a third of that, and "Melhores" lags
  by up to 3 hours.
- **Every click goes through the router.** "Visitar site" links point to `/r/<code>`, like the
  short links and the widget's ring links. The router answers the 302 first and records the
  click in `waitUntil`; a failed record never blocks the visitor. HEAD requests and redirects
  to the home page aren't counted.
- **A ring link also credits the site it came from** with a referral, shown on its page as
  "redirecionamentos para a aliança".
- **Dedupe without cookies.** A visitor is
  `SHA-256(VISITOR_SALT : UTC day : IP (IPv6 /64) : user-agent)`, as Plausible does it. The
  day in the hash makes today's visitors unlinkable to yesterday's, the raw IP is never
  stored, and the dedupe rows are deleted after their day. One row per visitor per site per day
  counts; triggers roll new rows into `daily_stats` and `site_totals`.
- **Bots and link previews don't count**: an empty user-agent, or one matching crawlers and
  preview fetchers (WhatsApp, Discord, Slack, Telegram, facebookexternalhit, bot, crawl,
  spider, curl…).
- **Votes are 👍 or 👎, and a 👎 is a negative like.** The catalog's `likes` is the net value
  (up − down) that "Curtidos" sorts by; the page shows both counts. A vote can be changed or
  removed. The browser keeps a random voter id in `localStorage`, stored hashed on the server,
  and every vote passes Turnstile. The net value is pushed right after the vote, so
  "Curtidos" is live; the cron corrects a failed push. Votes don't change the "Melhores" score.
- **The website page is one public request.** The gateway composes
  `GET /v1/websites/:id/page` (`WebsitePage`: the site, its ring neighbours and its stats) from
  the catalog and metrics over service bindings, which don't count toward the Workers daily
  request limit. When metrics can't answer, `stats` is `null` and the page shows "–".
- **Ring links fail open.** The router's routes are set to fail open in the dashboard, so over
  the daily request limit `/ring/*` and `/r/*` reach the site, which sends the visitor home
  instead of showing Cloudflare's error page.

## Consequences

- A classroom on one IP whose browsers send the same user-agent counts as one visitor that
  day. That only makes the ranking a little less accurate; nobody is blocked.
- Clicks can be inflated by varying the user-agent, and votes by clearing storage and solving
  Turnstile again. The logarithms in the score and Turnstile bound the effect; the owner can
  reset a site's rows in the metrics D1.
- A visitor whose browser blocks storage gets a new voter id per page load.
- On the Free plan (100k Workers requests a day), an engaged visitor costs about 8–10
  requests with the client's 60-second query cache, so roughly 10k such visitors a day. A
  ring-link hop costs one.
- The metrics cron is the account's third of five Free-plan cron triggers. Production
  environments of the Workers with crons will need their schedules merged.
