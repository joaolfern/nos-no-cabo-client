# Plan: submission form rework

The form is rebuilt from scratch for the community-driven flow described in
[ADR 0001](../architecture/decisions/0001-community-registration-and-verification.md) and
[ADR 0003](../architecture/decisions/0003-optimistic-draft-submissions.md). The backend (`/v1`,
[ADR 0002](../architecture/decisions/0002-cloudflare-platform.md)) does not exist yet, so the
frontend is built against MSW mocks that follow the target contract
([`13-api-contract`](../architecture/target/backend/13-api-contract.puml)).

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

## Widget editor page (phase 4)

- Move the editor out of `InitialStep.tsx` (396 lines) into `pages/WidgetEditor/`. Merge the three
  near-duplicate banner components into one component driven by the style options.
- `buildWidgetSnippet(websiteId, options)` emits
  `<aside class="nnc-banner" data-nnc-widget="<id>">`. Every link is built from `NOS_NO_CABO_URL`:
  logo, brand, `/ring/<id>/prev`, `/ring/<id>/next`, `/ring/<id>/random`. This removes the
  hardcoded `www.nosnocabo.com` and the `href="#"` links.
- Copy the code with the existing `Copyable`, or with the `CodeStep` behaviour.
- The page shows the site name. For an unknown id it shows the 404 state.
- Entry points: the success screen, and a link on `/website/:id`.

Done when the snapshot test for `buildWidgetSnippet` passes and the page renders the preview for
a mock id.

## Verified badge and ordering (phase 5)

- A `VerifiedIcon` (colourful, with an accessible label "Site verificado") next to the name in
  `FeedCard`, `FeedTable` and `WebsiteInfoCard`.
- `sortWebsites` gains verified-first as the primary key for every sort option. This stays
  client-side until the paginated `/v1/websites` exists.
- `VerifyButton` on `/website/:id`, shown only when the site is unverified, calls
  `POST /v1/websites/:id/verify`. On failure it shows the reason and a link to the widget editor.

Done when the tests for the sort order and the verify button states pass.

## Cleanup (phase 6)

Delete everything listed in "What is removed", run `npm run lint` and `npm run build`, and update
the target diagrams if the implementation deviated from them.

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

## Not in scope

The backend itself, the server-side pagination migration of the feed, metrics, the landing page's
real data, and community reports.
