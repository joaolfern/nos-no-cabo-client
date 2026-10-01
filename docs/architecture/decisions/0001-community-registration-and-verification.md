# 0001. Community registration and widget verification

- Status: accepted
- Date: 2026-09-30

## Context

In the proof of concept, the site owner registered the site and had to add the webring badge
during the same wizard. In practice, most people who know a good project are not its owner.
Requiring the badge up front also blocked submissions.

## Decision

1. **Anyone can submit any site.** No account is needed.
2. **A submission is public only after a background SFW check passes** (see 0003 for what the
   submitter sees meanwhile).
3. **Verification means the widget is present on the site.** The owner can install it at any
   time after submission. The server checks for it:
   - when anyone presses "Verificar" on the site page (rate limited to one check per site per minute);
   - in a daily batch that rechecks verified sites. A site loses the badge after two
     consecutive misses, so one failed fetch does not remove it.
4. The widget carries the website id (`data-nnc-widget="<id>"`), so a snippet copied from
   another site does not verify.
5. **Verified sites rank higher** and show a colourful icon. Verification is one signal of the
   "Melhores" ranking, next to clicks ([0004](0004-ranking.md)). The ring order still puts
   verified sites first.

### Anti-abuse

- Cloudflare Turnstile on submit, validated server-side.
- A rate limit per hashed IP at the gateway.
- URL normalization (lowercase host; scheme, `www.` and trailing slash removed) as the dedupe key.
  A duplicate returns 409 with the existing id, and the form links to it.
- Raw IPs are not stored; only a salted hash is kept, for abuse review.

## Consequences

- There is no "owner" identity. Verification is proof of control over the site, not of authorship.
- Detection needs the server to fetch member sites. Sites that block bots cannot be verified; the
  failure reason is shown to the owner.
- A community-report flow (published → rejected) is left for later. The lifecycle diagram
  reserves the transition.

Diagrams: [`target/00-system-context`](../target/00-system-context.puml),
[`target/backend/12-website-lifecycle`](../target/backend/12-website-lifecycle.puml),
[`target/backend/15-seq-verification`](../target/backend/15-seq-verification.puml).
