# Plan: submission form rework

The form is rebuilt from scratch for the community-driven flow described in
[ADR 0001](../architecture/decisions/0001-community-registration-and-verification.md) and
[ADR 0003](../architecture/decisions/0003-optimistic-draft-submissions.md). The backend (`/v1`,
[ADR 0002](../architecture/decisions/0002-cloudflare-platform.md)) does not exist yet, so the
frontend is built against MSW mocks that follow the target contract
([`13-api-contract`](../architecture/target/backend/13-api-contract.puml)).

## Current status and next steps (2026-10-05)

Read this first when picking the work up in a new session. The owner's own steps (commits,
deploys, GitHub, domain) are tracked as a checklist in [`../owner-todo.md`](../owner-todo.md);
keep it current.

**Where things are**

- **Live on `nosnocabo.com.br`** since 2026-10-05, running on the `*-staging` Workers, D1 and
  queues: the site (the `nosnocabo` static-assets Worker), the API on
  `api.nosnocabo.com.br` (gateway) and the router on `nosnocabo.com.br/ring/*` and `/r/*`.
  Phases 1–9 are deployed, along with the cost hardening. Both repos are on `main`.
- **Phase 10 (metrics, ranking, likes) is deployed (2026-10-05) but not committed:** it went
  out by hand from nos-sr branch `metrics` and nos-client's uncommitted `main`. See "Phase 10"
  below and ADR 0006.
- **No per-IP limits, on purpose.** The app is shown in colleges, where a whole room shares one
  IPv4 address, and a Turnstile "session" can't identify a person. Protection without
  identity comes from Turnstile on every write (submit, report, vote), global caps (the AI
  budget), moderation and the owner's review. Cloudflare caching and firewall rules on the
  domain are still to be set up (owner to-do).
- **nos-sr** (pnpm workspace):
  - **Workspaces:** `packages/contract`, `packages/ip`, `services/catalog`, `gateway`,
    `router`, `verification` and `metrics`. `services/moderation` is a **private** submodule
    with its own pnpm setup, kept out of the workspace. Never put moderation policy in a
    public repo.
  - **Contract:** 0.3.1 is published (zod-free `/categories` and `/url` entries). 0.4.0
    (`Website.likes`, `WebsiteStats`, `VoteSubmission`) is on the `metrics` branch, unpublished.
  - **Catalog:** D1 at migration 0010. Submissions start as `checking` and go to the
    `moderation-jobs` queue; derived data (counts, categories, FTS5) is kept by triggers (ADR
    0005); reports flag a site for review and never hide it; report alerts wait on Email
    Routing.
  - **Moderation** (private): Llama Guard, at most 250 AI checks per UTC day, a backlog drained
    by a 00:05 UTC cron, a dead-letter queue, and the `review` script.
  - **Router:** in-memory ring snapshot, refetched when `getRingVersion()` changes.
  - **Verification:** manual check with a one-minute cooldown, hourly re-check (two misses
    remove the badge).
  - **Free-plan cron triggers:** moderation and verification use 2 (staging only; production
    environments aren't deployed). Metrics adds a third.
- **nos-client** (`main`): reads everything from `/v1` (`v1Api`), MSW mocks the same contract.
  Lazy routes, Zod out of the bundle, per-page meta tags (`usePageMeta`) and `og.png`.
  Deployed with `pnpm run deploy:web`.

**Phase 10 (2026-10-05, ADR 0006)**

- New `metrics` Worker with its own D1 (`visits`, `daily_stats`, `site_totals`, `votes`).
- Clicks: every visit link goes through the router (`/r/<code>`; "Visitar site" too), which
  records the click in `waitUntil`. Ring links also credit the source site with a referral.
  Dedupe is a cookieless daily hash of IP and user-agent; bots and link previews are skipped.
- Votes: 👍/👎 behind Turnstile; the catalog's `likes` is the net value "Curtidos" sorts by.
- A cron every 3 hours (`23 */3 * * *`) pushes changed `rank_score`/`likes` values through
  `CatalogRpc.setMetrics`; votes push `likes` right away.
- Capacity (free plan): the website page is one request (`GET /v1/websites/:id/page`, composed
  by the gateway); the client caches queries for 60 s and doesn't refetch on tab focus; `/ring/*`
  and `/r/*` send the visitor home if they ever reach the SPA (the router failing open). About
  8–10 Workers requests per engaged visitor, so roughly 10k such visitors a day.
- Client: real stats on the website page (with a same-height loading state), real votes,
  real "Curtidas" in the feed, and `visitUrl()` for every visit link. The mocked metrics are
  gone; `src/__mocks__/data/metrics.ts` seeds the mocks.
- Until 0.4.0 is published, nos-client's `node_modules/@nosnocabo/contract` is a symlink to the
  local nos-sr build. `pnpm install` restores the published 0.3.1, which breaks the build until
  `pnpm add @nosnocabo/contract@0.4.0`.

**Open items**

1. **Phase 10 owner steps:** in [`../owner-todo.md`](../owner-todo.md) (create the metrics D1,
   secrets, publish 0.4.0, commit, deploy).
2. **Known limitations, accepted for now:**
   - Renaming a site, or resubmitting a rejected URL, scans the FTS table once.
   - Category-list order relies on ORDER BY inside a subquery. Switch to
     `json_group_array(… ORDER BY …)` once D1's SQLite is 3.44 or newer.
   - Spam is bounded only by Turnstile, the AI budget and moderation. A determined spammer can
     fill each day's AI budget, and real submissions then wait behind spam in the backlog.
   - Reported sites stay visible until the owner reviews them.
   - A dead-letter message that fails 10 more times is dropped, with only an error log.
   - Clicks can be inflated by varying the user-agent, votes by clearing storage and solving
     Turnstile again (ADR 0006).
3. **msw stays on 2.x.** 3.0 breaks the setup and the interception in Vitest.
4. **Never load-test deployed services.** Bursts of requests to staging need explicit
   permission; test limits locally.
5. **Exports:** `wrangler d1 export` refuses databases with the FTS5 table. To export, drop
   `websites_fts`, export, recreate it and run the rebuild (ADR 0005).
6. **Production deploys** should avoid the 0005-style window: ship code that tolerates both
   schemas, or apply column drops in a later deploy.

**Next tracks (owner's choice)**

- The small CLS left on `/websites` (0.0072), and the landing page loading its chunks one
  after another.
- A time-limited boost for new sites in "Melhores" (ADR 0004).
- Web Push for people who left (see "Future steps").

## Goals

- One screen instead of a 6-step modal wizard: paste a URL, review the prefilled fields, pick
  categories, submit.
- A page (`/websites/novo`) instead of a modal, so it can be linked, refreshed and navigated back from.
- The widget (selo) editor becomes an optional, separate page, offered after submission and on
  the site page.
- After submitting, the site appears at the top of the feed as a draft card that survives a refresh.
- Verified sites show an icon and rank first.

## What is removed

- `src/pages/WebsiteForm/`: all six steps, `StepTitle`, `StepContainer`, `StepDescription`,
  `ConfirmButton`, `WebsiteFormContext`, `WebsiteFormModal`, `WebsiteFormFloating`,
  `useWebsiteForm`. `CategoryChip` and the banner code are moved first (see below).
- `WebsiteFormProvider` and `<WebsiteFormModal/>` in `src/providers/RouterProvider/routes.tsx`.
- `usePreregisterWebsite` and `useRegisterWebsite` in `src/hooks/useDataHooks.ts`.
- `src/__mocks__/data/parseRegisterDataToWebsite.tsx`.
- The now-dead `src/pages/Website/components/FloatingButtons` chain (it only renders `WebsiteFormFloating`).

## Target structure

See [`20-form-modules`](../architecture/target/frontend/20-form-modules.puml) and
[`22-routes`](../architecture/target/frontend/22-routes.puml).

```
src/pages/SubmitWebsite/
  SubmitWebsite.tsx                 page: <SubmitForm/> or <SubmitSuccess/>
  SubmitWebsite.module.scss
  SubmitWebsite.test.tsx
  components/
    SubmitForm/                     the one-screen form, layout with sticky preview
    Field/                          label + control + reserved message line
    UrlField/                       url input + preview status / duplicate message
    WebsitePreviewCard/             read-only FeedCard + FeedCardSkeleton while fetching
    CategoryPicker/                 chips (moved CategoryChip) + description line, 1–3 picks
    TurnstileField/                 Cloudflare Turnstile widget, exposes token
    SubmitSuccess/                  "Recebemos {name}!" + CTAs
  hooks/
    useWebsitePreview.ts            useQuery ['websitePreview', normalizedUrl]
    useSubmissionFields.ts          fields follow the preview until edited
    useSubmitWebsite.ts             useMutation (phase 3: adds draft on 202)
    usePendingSubmissions.ts (+ test)  drafts: list/add/update/remove, 7-day expiry
    usePendingStatusPolling.ts      polls GET /v1/websites/:id while checking
  utils/
    submissionForm.ts (+ test)      limits, FIELD_IDS, validateSubmission, toSubmission, toHexColor
    mergeDrafts.ts (+ test)

src/pages/WidgetEditor/
  WidgetEditor.tsx                  route /websites/:id/selo
  components/                       style options + preview + copy (from InitialStep/CodeStep)
  utils/buildWidgetSnippet.ts (+ test)

src/utils/normalizeUrl/             generic URL helpers (toAbsoluteUrl, normalizeUrl), done in phase 1
src/components/Textarea/            generic textarea matching Input, done in phase 2
src/hooks/useLocalStorageJson.ts (+ test)
```

### Where the drafts live

No new root folders. The drafts belong to the submission feature, so they live in
`src/pages/SubmitWebsite/hooks/` and `utils/`. The feed imports `usePendingSubmissions`,
`usePendingStatusPolling` and `mergeDrafts` from there. This one Feed → SubmitWebsite import
is deliberate: the feed shows the drafts but does not own them. Generic helpers go in the
existing global folders (`src/utils/normalizeUrl`, `src/hooks/useLocalStorageJson`).

## Contract and mocks (phase 1) — done

As built:

- `src/interfaces/IWebsite.ts` gains `WebsiteStatus`, `WebsiteRejectionReason`,
  `IWebsitePreview`, `IWebsiteSubmission`, `ISubmittedWebsite` (the `/v1` `Website`) and
  `IVerificationResult`. `IWebsite` gets optional `status` and `verifiedAt`; they become
  required when the feed moves to `/v1/websites`, and so does the `keywords` → `categories` switch.
- `src/interfaces/IApiError.ts`: `ApiErrorCode`, `IApiError` (`{code, message, status?, existingId?}`)
  and the response envelope `IApiErrorResponse`.
- `src/api/toApiError.ts`: the axios interceptor now rejects with an `IApiError` for every
  failure. It reads the `/v1` envelope and the legacy `{error: string}` and `{message}` bodies,
  and derives a code from the HTTP status otherwise, so existing `error.message` callers keep working.
  The base URL is unchanged; new calls use `v1/...` paths, and legacy endpoints keep working.
- `src/utils/normalizeUrl/`: `toAbsoluteUrl` (adds `https://`, rejects non-web or domainless
  input) and `normalizeUrl` (the dedupe key: lowercase host without `www.`, scheme, trailing slash or hash).
- `src/__mocks__/data/submissions.ts`: an in-memory store whose status depends on the elapsed
  time (`MOCK_REVIEW_DELAY_MS` = 5 s). Functions take an optional `now`, so tests don't need timers.
- `src/__mocks__/handlers.ts`: `/v1` handlers placed before the untouched legacy ones.
  Fixture triggers: a URL containing `inacessivel` → 422 `unreachable`; containing
  `rejeitado` → `rejected` / `unsafe` after the delay; any URL of a mock website → 409 `duplicate`.
  Verification succeeds when the id's last character code is even (e.g. `4`).
- `MOCK_WEBSITES` all have `status: 'published'`; ids `1`, `4` and `9` are verified.
- Moved to phase 2: `TURNSTILE_SITE_KEY` in `src/config/env.ts`, added together with the field that uses it.

Tests: `normalizeUrl.test.ts`, `toApiError.test.ts`, `submissions.test.ts` (review state
machine) and `handlers.test.ts` (the handlers through the real axios client).

## The form page (phase 2) — done

As built:

- **Route and entry points.** `/websites/novo` inside `NosNoCaboLayout`. The topbar button and the
  landing page CTA are now `Button asChild` + `Link` to it, which also removes the landing page's
  `<Button>` nested in a `<Link>`. The label changed from "Adicionar meu site" to
  "Adicionar um site", since anyone can submit.
- **Focused layout.** `/websites/novo` uses `<NosNoCaboLayout variant='focused' />`, set in the
  route config. The top bar drops the search (it only filters the feed) and the
  "Adicionar um site" button (it points to the current page). Its content is capped at
  `$layout-focused-max-width` (80rem / 1280px), the same width as the page, and the page scrolls
  normally, so the bar scrolls away instead of covering the form. The wide variant (feed,
  website page) is unchanged. The widget editor (phase 4) reuses the focused variant.
- **Layout.** A title and a short intro, then the fields on the left with a sticky "Assim ele
  aparece no feed" preview on the right. On mobile the preview sits above the fields.
- **Preview.** `WebsitePreviewCard` renders the real `FeedCard` with a new `readOnly` prop (no
  details link, no likes) from the current field values, and `FeedCardSkeleton` while the preview
  request runs, so the placeholder has the same size.
- **URL field.** Accepts `exemplo.com`, debounced 400 ms, then `GET /v1/websites/preview`. Its
  message line reports "Buscando…", "Encontramos o site", the unreachable message (fields stay
  editable), or the duplicate error with a link to `/website/:existingId`; a duplicate blocks submit.
  Changing the URL clears a previous submit error.
- **Fields.** `useSubmissionFields` shows the preview's value until the user edits a field, so
  retyping the URL never wipes edits. Name (3–80) and description (≤ 280) have counters. Colour is
  a native colour swatch plus a hex input. `InputColor` was not reused: its swatch has no styles.
- **Categories.** `CategoryChip` moved (with `git mv`) to `SubmitWebsite/components/CategoryPicker/`
  and gained `disabled`; unchecked chips disable at 3. `KeywordsStep` imports it from there until phase 6.
- **Turnstile.** `TURNSTILE_SITE_KEY` in `src/config/env.ts` (the always-pass test key when mocks
  are on). The token is sent as the `cf-turnstile-response` header; the form asks for it when a
  site key is configured. In Jest no key is set, so the widget is skipped.
- **Form element.** A plain controlled `<form>`, not `@/components/Form`. `Form` builds values
  with `new FormData(form)`, which this form doesn't need, and which throws under
  `jest-fixed-jsdom` because that environment swaps in Node's `FormData`.
- **Spacing.** No gap or margins on the form or on field wrappers (CLAUDE.md). Each `Field`
  reserves its message line, which spaces the fields and keeps errors from shifting the layout.
- **Validation.** Errors show after the first submit attempt, and focus moves to the first
  invalid field.
- **Success.** `SubmitSuccess`: "Recebemos {name}!" with "Ver no feed" and "Enviar outro site".
  The "Adicionar o selo" CTA arrives with the widget editor in phase 4, so the page never links
  to a route that doesn't exist yet.

Tests: `SubmitWebsite.test.tsx` covers the happy path, duplicate, unreachable filled in by hand,
validation with focus, edits surviving a URL change, and the 3-category limit.
`submissionForm.test.ts` covers the rules. Checked in the browser at 1280 px and 390 px, and in dark mode.

Known and left alone: in dark mode the shared `Input` text colour (`--color-neutral-600`) is dim;
that is the global component's style, worth fixing separately.

## Drafts in the feed (phase 3) — done

As built:

- **Storage.** `src/hooks/useLocalStorageJson.ts`: a JSON sibling of `useLocalStorageState`,
  built on `useSyncExternalStore`, so every hook on the same key in a tab stays in sync, and other
  tabs sync through the `storage` event. It falls back to memory only when storage throws.
- **Draft model.** `SubmitWebsite/utils/pendingSubmissions.ts`: the `IPendingSubmission` type, a
  validator for stored data, 7-day expiry, the active checking window, and `reconcileDrafts`
  (a pure function, so the timing rules are unit-tested without timers).
- **Store.** `usePendingSubmissions` (key `nnc-pending-submissions`). `useSubmitWebsite` adds the
  draft on a 202.
- **Status checks.** `usePendingStatusPolling`: one `GET /v1/websites/status?ids=…` for every
  checking draft, every 15 s during the first 2 minutes, then only on page load or tab focus (at
  most once a minute, via `staleTime`). It keeps checking in a background tab only when notification
  permission is granted. Published drafts are dropped and `['websites']` is invalidated; rejected ones keep
  their reason. It runs wherever the feed renders drafts.
- **Feed.** Drafts are the first items of the feed itself: the first cards in the grid and the
  first rows in list view. `FeedCardList` and `FeedTable` take a generic `pending` prop
  (`{ website, tone, status }[]`), so the feed components know nothing about drafts.
  `usePendingFeedItems` (SubmitWebsite) runs the status checks and builds those items, so the feed
  adds a single hook call. Drafts ignore filters and pagination, so a submitter never loses them.
- **Cards and rows.** `FeedCard` gained `tone` (`draft`: dashed primary border; `rejected`: danger
  border and faded content) and an `aside` slot that replaces the like count. Draft table rows have
  a dashed divider and the status in the likes and visit columns. `DraftStatus` shows
  "Em análise" with the generic `@/components/LoadingDots` (three bouncing dots, static without
  motion), or the reason plus "Dispensar".
- **Notifications.** Opt-in from the draft card's bell (see the follow-up below). When a check sees a final
  status, it shows a local `Notification` with `tag: nnc-submission-{id}`, so a second tab or a
  repeated check replaces it instead of duplicating it.
- **Mocks.** `GET /v1/websites/status`, a 20 s review, and published submissions added to the
  legacy `/websites` and `/website/:id` responses, so a published draft becomes a real card.
  The mock store is in memory, so a full page reload forgets submitted sites; drafts in
  localStorage then fall back to the fixture data, which is expected in mock mode only.

Tests: `useLocalStorageJson.test.ts`, `pendingSubmissions.test.ts`, `Feed/FeedPendingSubmissions.test.tsx`
(first card in the real feed, expiry, published becomes the top card, rejected with dismiss, notification), plus draft persistence in
`SubmitWebsite.test.tsx` and the batch status endpoint in the mock tests. Checked in the browser:
publish → normal card at the top of the list, reject → rejected card, which survives a reload.

### Follow-up: skip the success screen — done

- Saving shows a toast through the existing `MessageProvider` ("Site publicado. Ele estará
  visível para outros usuários em minutos.") and navigates straight to `/websites`, where the draft is already the
  first card. `SubmitSuccess` and `NotifyOptIn` were removed.
- Notifications are a one-time opt-in for all sites: a small bell next to "Em análise ···" on
  draft cards, shown only while the browser permission is undecided. One click asks for
  permission; once granted, every draft notifies and the bell disappears from all cards at once
  (`@/hooks/useNotificationPermission`, shared through `useSyncExternalStore`). It can't be turned
  off in the app, and drafts carry no per-site flag.
- Phase 4's "Adicionar o selo" entry points: the website page, and the draft card once phase 4
  lands (the success screen no longer exists).

Tests: `SubmitWebsite.test.tsx` asserts the toast and the redirect (and no redirect on a
duplicate); `FeedPendingSubmissions.test.tsx` covers the one-time permission request hiding every bell, and
the bell's absence without notification support.

## Widget editor and access from the feed (phase 4) — done

Designed and approved in Claude Design ("Nós no Cabo — selo do webring", rounds 1 and 2c), then built:

- **Presets as data** (`WidgetEditor/utils/widgetPresets.ts`): Faixa, Selo 88×31, Cartão, Texto.
  Parameters come from fixed lists: tema (claro / escuro / automático), cor (5 accents with light
  and dark shades), and Anterior/Próximo on or off. The Selo has no Anterior/Próximo; Texto has
  no tema or cor.
- **One implementation of the widget** (`buildWidgetSnippet.ts`): HTML with its own scoped
  `<style>`, no JavaScript, the logo as inline SVG, and a `data-nnc-widget="<id>"` marker for
  verification.
  - **Links:** the webring home (`NOS_NO_CABO_URL`) and `${RING_BASE_URL}/ring/:id/{prev,next,random}`;
    `VITE_RING_BASE_URL` defaults to `NOS_NO_CABO_URL`.
  - **Scoping:** a reset at (0,1,0), rules at (0,2,0), and `!important` link colours. It was
    checked against a hostile page (uppercase, serif, red `!important` links, bordered blocks):
    only the Texto preset adopts host styles, by design.
  - **Theme:** `data-tema="auto"` follows `prefers-color-scheme`. Each snippet only carries its
    own accent rule, so two widgets on one page don't conflict.
- **Preview equals output:** `WidgetRender` renders the generated HTML itself. The editor
  preview, the model thumbnails and the modal preview all show exactly what gets copied.
- **Editor page** `/websites/:id/selo` (focused layout): model cards with live thumbnails,
  radio-chip parameters, a preview on a light or dark mock site, the code block with copy, and a
  404 state. The site name comes from `GET /v1/websites/:id`.
- **Access from the feed** (approved option 2c):
  - `VerificationStatus` shows a muted "?" badge on every unverified feed card, list row and
    website page, and a coloured check badge on verified ones.
  - The badge opens `UnverifiedModal`. It explains the site is community-submitted and not yet
    confirmed by its maintainers, shows the Faixa preview, lists the two benefits (ranking first;
    "prestigiar este e muitos outros projetos de tecnologia brasileiros"), and has "Sou
    responsável pelo {nome}" linking to the editor.
  - On mobile the buttons stack full width.
- **Real-font fixes found in the browser:** on Linux's wide default font the Selo name now uses
  lowercase ("nós no cabo") and a 20px logo column so it fits 88×31, and the Cartão is 300px so
  its links stay on one line.
- **Shared `Modal`:** its surface is now opaque (`--color-surface`) instead of translucent glass,
  to match the design. The only other user is the old wizard modal, removed in phase 6.
- **Test setup:** `jest.setup.ts` now mocks `NOS_NO_CABO_URL` and `RING_BASE_URL`.
- **Review round after the build:**
  - The preview defaults to the dark mock site, and the light mock site's lines are darker.
  - Model thumbnails are `inert`, so their sample links can't be clicked or focused.
  - **Logo** parameter: "Na cor escolhida" (accent), "Gradiente" (the header logo, as inline SVG)
    and "Original" (dark badge with the lilac mark). Used by Faixa, Selo and Cartão.
    "Cor do logo" comes right after it and is only enabled for "Na cor escolhida". It only
    colours the logo: the rest of the widget uses a fixed brand pink, and the Selo's border
    follows the logo (the chosen colour, a gradient border, or the badge's dark purple).
  - **Aleatório** can be hidden. When it is, the Selo's second line becomes a "webring" link.
  - **Personalizado** model: a bare, unstyled snippet with every link, plus a guide listing what
    must stay (the `data-nnc-widget` marker and the link to Nós no Cabo) and the optional ring
    links. It has no preview.
  - The original rule "random is always present" is relaxed: only the marker and the webring link
    are mandatory, because they are what verification checks.

Tests: `buildWidgetSnippet.test.ts` checks every preset × theme × colour × logo × nav × random
combination (the marker and webring link are always present; random and prev/next only when
enabled and supported, or always in Personalizado), plus escaping and theme and accent
attributes. `WidgetEditor.test.tsx` covers the name, the parameters per preset, snippet updates,
the dark default, hiding Aleatório, the Personalizado guide, copy and 404. `VerificationStatus.test.tsx` covers the verified mark, and the
modal's copy and editor link.

## Terms of use (phase 4 follow-up) — done

- `src/pages/Terms/`: the terms text (`TermsContent`), the `/termos` page and `TermsModal`.
  The terms follow Brazilian law (Marco Civil, LGPD, ECA, Lei 7.716/1989) and describe the
  automatic curation (illegal content, NSFW, hate speech and prejudice). Contact:
  joaolfern@proton.me, plus "Notificar problema".
- The widget editor locks "Ver código" and "Copiar código" until the terms are accepted. A
  "Remover links de navegação" shortcut turns off Anterior, Próximo and Aleatório.
- Acceptance is stored per browser as `TERMS_VERSION`. Changing that version asks everyone again.
- `SiteFooter` (Termos de uso, Contato) is on every page, including the landing page.
- The text is a well-grounded draft, not legal advice: have a lawyer review it before launch.

## Verified badge, ranking and verification (phase 5) — done

- **Verified badge:** done in phase 4 (`VerificationStatus` on feed cards, list rows and the
  website page).
- **"Melhores" ranking, computed by the backend** ([ADR 0004](../architecture/decisions/0004-ranking.md)):
  - `score = 3·ln(1 + clicks_30d) + ln(1 + clicks_total) + (verified ? 2 : 0)`, ties to the
    most recently published;
  - computed every 3 hours by the metrics service, stored as `websites.rank_score`, served by
    `GET /v1/websites?sort=melhores` (the default).
- **Client:**
  - "Melhores" is the new default sort option and keeps the server's order (`sortWebsites`
    returns it as is).
  - The other options stay client-side until the paginated `/v1/websites` exists.
  - The MSW legacy list returns sites ranked with the same formula (`__mocks__/data/ranking.ts`),
    using the seeded click counts the website page shows.
- **Exception:** while in review, the submitter's draft stays at the top of their feed, under
  any sort. Once the check passes, the draft is dropped and the site takes its ranked place.
- **Verificar:** `VerifyPanel` on the website page, shown only while unverified:
  - links to the widget editor, and calls `POST /v1/websites/:id/verify`;
  - success shows a toast and refreshes the site and the list;
  - failures explain the reason (widget not found, site unreachable, rate limited).
  - The mock remembers successful verifications, so the badge updates.

## Cleanup (phase 6) — done

- Deleted `src/pages/WebsiteForm/` (wizard, steps, context, modal, floating button) and its
  wiring in `routes.tsx`.
- Deleted the dead `FloatingButtons` chain (`useAnimationToggler`, `useThemeSwitcher`, the global
  `FloatingButton`), `usePreregisterWebsite`, `useRegisterWebsite`, `IPreregisterWebsite`,
  `IRegisterWebsite`, and the legacy POST/PATCH `/website` mocks with their data.
- The target frontend diagrams (`20-form-modules`, `22-routes`) now describe what was built.

## Verification (every phase)

- Only the touched specs: `npx jest --config jest.config.cjs SubmitWebsite`, `pendingSubmissions`, and so on.
- `npm run lint` and `npm run build` before calling a phase done.
- A visual check with Playwright MCP of `/websites/novo`, the success screen, the draft and
  rejected cards, and the widget editor, at mobile and desktop widths, in the light and dark themes.

## Future steps

**Notify people who already left (Web Push).** Phase 3 only notifies while a tab is open. To
reach someone who closed the site:

1. Client: register a service worker (a small `public/sw.js`; it must coexist with the dev-only
   MSW worker), create a push subscription with the server's VAPID public key when the person opts
   in, and send it with the submission (`POST /v1/websites` body `pushSubscription?`, or
   `POST /v1/websites/:id/subscriptions`).
2. Backend: the catalog stores the subscription next to the website (deleted after it fires or
   after 7 days). When moderation calls `setStatus(published | rejected)`, the catalog sends the
   Web Push (VAPID-signed, from a Worker) and deletes the subscription.
3. The service worker shows the notification and opens `/website/:id` (published) or
   `/websites` (rejected) on click.

Cost: browser push services are free and it's one outbound request per submission, well inside
the Workers free tier. No email address or account is needed.

## Roadmap after the form rework

The frontend for the new flow is done and runs on mocks. Everything left needs the server.
Each phase ends with the SPA talking to the real service for that slice, behind the same `/v1`
contract the mocks implement.

**Launch blocker, independent of the phases:** the client sends `ADMIN_PASSWORD` with every
request (it ships in the JS bundle), and "Notificar problema" calls the admin-only
`DELETE /website/:id`. On the current backend, anyone who reports a site deletes it. Fix it
before any public release: turn the button into a report (phase 8) or a `mailto:` until then,
and remove the password from the client.

0. **Platform — decided.** Cloudflare Workers (ADR 0002 accepted). The repos stay separate:
   the zod `contract` lives in `nos-sr` as `packages/contract`, published as a versioned npm
   package that nos-client installs.
7. **Server foundation and catalog.** This is the biggest phase. *In progress (branch
   `workers-foundation` in `nos-sr`):*
   - done: npm workspaces with `@nosnocabo/contract` (zod, ready to publish), the gateway
     (CORS, submit rate limit, `/v1` forwarding) and the catalog (D1 schema, every catalog
     endpoint below with keyset pagination), 26 tests in the Workers runtime, CI for
     checks, staging deploy and contract publishing;
   - staging is live: `https://nnc-gateway-staging.joaolfern.workers.dev/v1` (the catalog has
     no public URL; only the gateway reaches it). `contract` 0.1.0 is on npm; 0.1.1 adds a
     CommonJS build so Jest and older resolvers can load it.
   - nos-client: the `/v1` hooks use `v1Api` (`VITE_V1_API_URL`); `VITE_V1_MOCKS=false` calls
     the real `/v1` while the legacy API stays mocked. The `/v1` types come from the contract.
     Submissions that come back already `published` (staging's `AUTO_PUBLISH`) don't become
     drafts.
   - done: the read path is on `/v1` with no flag (there is no production yet, so no data
     migration is needed):
     - the feed uses `GET /v1/websites` as an infinite query (cursor pages, server sort,
       `categoria` and `q`); the category list and counts come from `GET /v1/categories`
       (`{ total, items }`);
     - the website page uses `GET /v1/websites/:id`, and `GET /v1/websites/:id/neighbours`
       for Anterior/Próximo (ring order: verified first, then publication date, wrapping) and
       a random site, until the router service exists;
     - search ignores accents and case (`search_key`, migration 0002; replaced by FTS5 in 0004);
     - "Notificar problema" is a `mailto:` until community reports exist, and the admin
       password, the legacy `api` instance and the legacy mocks are gone.
   - staging is seeded with 12 real projects (`pnpm run seed:staging` in `services/catalog`).
   - next: publish `@nosnocabo/contract` 0.2.0, then phase 8 (moderation).
   - Workers project in `nos-sr`: gateway and catalog Workers, D1 schema and migrations,
     `contract` package, CI deploying a staging environment.
   - Catalog endpoints, in the order the client already uses them:
     - `GET /v1/websites/preview` (port the Python scraping to `HTMLRewriter`);
     - `POST /v1/websites` (Turnstile, URL normalization, 409 on duplicates, 202 `checking`);
     - `GET /v1/websites/:id` and `GET /v1/websites/status?ids=`;
     - `GET /v1/websites` with cursor pagination, `categoria`, `q` and `sort`;
     - `GET /v1/categories`.
   - Client: point `/v1` at staging (mocks stay for tests), replace `src/interfaces` with the
     contract types.
8. **Moderation.** *Deployed (see "Current status").* Queue consumer with
   Workers AI llama-guard in a private Worker, `CatalogRpc.applyModeration` on the catalog,
   short code on publish, rejection reasons, a manual review script. Community reports
   (`POST /v1/websites/:id/reports`) replace the `mailto:`.
9. **Verification and the router.** *Deployed (see "Current status").*
   - `POST /v1/websites/:id/verify` (fetch the site, find `data-nnc-widget` and the link),
     rate limited, and a daily recheck cron (two misses remove the badge).
   - Router Worker: `/ring/:id/{prev,next,random}` (302) and `/r/:code`. It keeps the ring
     order from `CatalogRpc.getRing()` in memory and refetches when `getRingVersion()`
     changes; `robots.txt` disallows `/ring/`, plus a per-IP rate limit (ADR 0005).
     `VITE_RING_BASE_URL` points at it.
10. **Metrics and ranking.** *Deployed, not committed (see "Current status", ADR 0006).*
    Router-recorded clicks with a cookieless daily dedupe, `daily_stats` rollups, a 3-hourly
    `rank_score` (ADR 0004), net likes from 👍/👎 votes. The website page shows real numbers.
11. **Cutover.**
    - Feed on server pagination (`useInfiniteQuery`), sort and filters as query params. Delete
      `sortWebsites`, the client filters and the legacy list.
    - One-off Postgres → D1 export (URLs restored from `url_mappings`), DNS, retire Flask.
12. **After launch:** Web Push for people who left (see "Future steps"), screenshot moderation
    if text-only checks prove weak, a time-limited boost for new sites in "Melhores".

## Not in scope

The backend itself, the server-side pagination migration of the feed, metrics, the landing page's
real data, and community reports.
