# Architecture diagrams

PlantUML diagrams of the Nós no Cabo system: this client (`nos-client`) and its API. They exist
to make the production migration safe:

- `current/` is the baseline recorded before the rework.
- `target/` is where the migration is heading.
- `decisions/` records why the target looks the way it does.

The first implementation plan built on them is [`../plans/form-rework.md`](../plans/form-rework.md).

`current/` was snapshotted on 2026-09-30:

- nos-client at `95a05e6` (branch `rework-appearance-internal`)
- nos-sr at `9368c45` (`main`)

## Legend

All diagrams include [`_style.iuml`](_style.iuml).

| Colour / stereotype | Meaning |
| --- | --- |
| Red `<<issue>>`, red arrows, red notes | Bug, contract mismatch or colocation violation to fix during migration |
| Purple `<<mocked>>` | Data or behaviour that exists only on the client (fake or local state) |
| Grey `<<dead>>` | Code with no remaining callers |
| Blue `<<external>>` | Third-party system |
| Green `<<new>>` | Introduced by the target architecture |

## Current state

### System

- [`00-system-context`](current/00-system-context.puml): actors, the SPA, the API, the database, and third parties
- [`01-deployment`](current/01-deployment.puml): static host, browser with MSW, docker-compose, and the production gaps
- [`30-contract-mismatches`](current/30-contract-mismatches.puml): client interfaces compared with the backend schemas

### Backend (nos-sr)

- [`10-backend-layers`](current/backend/10-backend-layers.puml): routes → services → models, schemas and lib
- [`11-data-model`](current/backend/11-data-model.puml): the database tables (ER diagram)
- [`12-api-contract`](current/backend/12-api-contract.puml): every endpoint, its payloads and its error shapes
- [`13-seq-submit-website`](current/backend/13-seq-submit-website.puml): pre-register and approve (approve is a stub)
- [`14-seq-shortener`](current/backend/14-seq-shortener.puml): creating short links, redirects, click analytics

### Frontend (nos-client)

- [`20-frontend-modules`](current/frontend/20-frontend-modules.puml): module dependencies and colocation violations
- [`21-provider-tree`](current/frontend/21-provider-tree.puml): the order providers are nested in
- [`22-routes`](current/frontend/22-routes.puml): route map, navigation and URL state
- [`23-data-layer`](current/frontend/23-data-layer.puml): query hooks → endpoints, MSW coverage, mocked domains
- [`24-seq-feed-load`](current/frontend/24-seq-feed-load.puml): client-side filtering, sorting, search and paging
- [`25-seq-website-form`](current/frontend/25-seq-website-form.puml): the 6-step submission wizard
- [`26-seq-website-details`](current/frontend/26-seq-website-details.puml): the details page data flow

## Target state

### System

- [`00-system-context`](target/00-system-context.puml): community submitters, site owners, the gateway, services, Turnstile, Workers AI
- [`01-deployment`](target/01-deployment.puml): all on Cloudflare (Pages, Workers, D1, KV, Queues, Workers AI), with the free-tier budget

### Backend

- [`10-services`](target/backend/10-services.puml): gateway, catalog, moderation, verification, router, metrics, and who owns which data
- [`11-data-model`](target/backend/11-data-model.puml): the D1 and KV schema
- [`12-website-lifecycle`](target/backend/12-website-lifecycle.puml): checking → published / rejected; unverified ⇄ verified
- [`13-api-contract`](target/backend/13-api-contract.puml): the `/v1` API, its schemas and the single error envelope
- [`14-seq-submit-moderation`](target/backend/14-seq-submit-moderation.puml): submission and the background SFW check
- [`15-seq-verification`](target/backend/15-seq-verification.puml): widget verification, on request and by cron

### Frontend

- [`20-form-modules`](target/frontend/20-form-modules.puml): the SubmitWebsite and WidgetEditor pages, and pending drafts
- [`21-seq-submit-optimistic`](target/frontend/21-seq-submit-optimistic.puml): submitting, the local draft, polling and reconciliation
- [`22-routes`](target/frontend/22-routes.puml): the target route map (the modal is removed)

## Decisions

- [0001: Community registration and widget verification](decisions/0001-community-registration-and-verification.md)
- [0002: Move the backend to Cloudflare Workers](decisions/0002-cloudflare-platform.md) (proposed)
- [0003: Optimistic draft submissions](decisions/0003-optimistic-draft-submissions.md)
- [0004: "Melhores" ranking, computed by the backend](decisions/0004-ranking.md)

## Rendering

- **VS Code:** the *PlantUML* extension (jebbs.plantuml), `Alt+D` to preview.
- **Export everything (Docker, includes Graphviz):**
  ```sh
  npm run docs:diagrams                                  # PNG → out/architecture/
  npm run docs:diagrams -- /tmp/diagrams svg             # custom folder and format
  ```
  [`export-diagrams.sh`](export-diagrams.sh) mirrors the folder layout
  (`out/architecture/target/backend/10-services.png`, …), lists each diagram as
  `ok` or `FAIL`, and exits non-zero when any diagram has a syntax or include error.
  It uses PlantUML's pipe mode because the container cannot write into a
  bind-mounted folder on this WSL/Docker setup.
- **CLI (jar):** `java -jar plantuml.jar -tsvg "docs/architecture/**.puml"`.
  Needs Graphviz (`dot`) installed; without it, only the sequence diagrams render.

Keep rendered output out of git; the `.puml` files are the source of truth.

## Maintenance

- Update a diagram in the same PR as the code change it describes.
- `current/` stays frozen as the baseline. When a red `<<issue>>` is resolved,
  the fix shows up in `target/`.
- As parts of the target ship, move their diagrams' `<<new>>` elements to plain
  styling. A new decision gets the next ADR number; an ADR is superseded, not edited.
