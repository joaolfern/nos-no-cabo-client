# 0004. "Melhores" ranking, computed by the backend

- Status: accepted
- Date: 2026-10-01
- Amends: [0001](0001-community-registration-and-verification.md), item 5 ("verified sites rank first")

## Context

The feed's default order should show the projects people actually visit, not just the newest.
Sorting today happens in the browser over the full list, which can't scale and can't use
metrics the client never receives. Verification should help a site's position, but a verified
site nobody visits shouldn't outrank one the community uses every day.

## Decision

- **The backend sorts.** `GET /v1/websites?sort=melhores|recentes|curtidos|az` (default
  `melhores`) returns pages already in order. The client never re-sorts a server page.
- **"Melhores" uses three signals per site:**
  - `clicks_30d`: clicks in the last 30 days, the strongest signal;
  - `clicks_total`: all-time clicks;
  - `verified`: whether the widget is on the site.

  A click is a visitor leaving Nós no Cabo for the site: "Visitar site", the short link
  `/r/:code`, or a ring link (`/ring/:id/…`) that lands on it. These are the metrics service's
  `click` events.
- **Score:**

  ```
  score = 3 · ln(1 + clicks_30d) + ln(1 + clicks_total) + (verified ? 2 : 0)
  ```

  - The logarithms keep one viral site from burying everything else, and give early clicks
    more weight than the thousandth.
  - Recent clicks weigh 3× as much, so the order follows what is active now.
  - Verification adds a fixed bonus worth about the same as doubling recent clicks. It decides
    between similar sites without overriding real usage.
  - Ties go to the most recently published.
- **When it's computed:** an hourly cron in the metrics service reads `daily_stats`, computes
  the score and pushes `{website_id, rank_score}` to the catalog's internal API. The catalog
  stores `websites.rank_score` and serves `ORDER BY rank_score DESC, published_at DESC`. An
  index on `(status, rank_score)` keeps the query cheap.
- **One exception, on the client:** while a submission is in review, its draft card stays at
  the top of the submitter's feed (see 0003). Once the check passes, the draft is dropped and
  the site appears in its ranked place, like any other.
- **Ring order is unchanged.** Anterior and Próximo follow a stable order (verified first, then
  publication date), so a member's neighbours don't change every hour.

## Consequences

- The weights are product decisions and live in one function on the backend. Tuning them needs
  no client release.
- A new site starts with no clicks and lands near the bottom of "Melhores". "Recentes" is where
  new sites get discovered; a time-limited boost for new sites can be added to the score later.
- Clicks can be gamed. Events are deduplicated per `visitor_hash` per site per day before they
  count, and the gateway's rate limit applies.
- Until `/v1/websites` exists, the legacy list endpoint returns sites in "Melhores" order (the
  mock does this), and the client keeps the other sort options locally.
