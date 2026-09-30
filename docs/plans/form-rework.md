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
    UrlField/                       input + normalized-url validation + duplicate message
    WebsitePreviewCard/             live card (favicon, color, name, description) + skeleton
    DetailsFields/                  name, description, color (InputColor)
    CategoryPicker/                 chips (moved CategoryChip) + description line, 1–3 picks
    TurnstileField/                 Cloudflare Turnstile widget, exposes token
    SubmitSuccess/                  "Em análise" + CTAs
  hooks/
    useWebsitePreview.ts            useQuery ['websitePreview', normalizedUrl]
    useSubmitWebsite.ts             useMutation → adds draft on 202
  utils/
    normalizeUrl.ts (+ test)
    toSubmission.ts

src/pages/WidgetEditor/
  WidgetEditor.tsx                  route /websites/:id/selo
  components/                       style options + preview + copy (from InitialStep/CodeStep)
  utils/buildWidgetSnippet.ts (+ test)

src/features/pendingSubmissions/
  usePendingSubmissions.ts (+ test) list/add/update/remove, 7-day expiry
  usePendingStatusPolling.ts        polls GET /v1/websites/:id while checking
  mergeDrafts.ts (+ test)
  PendingSubmissions.types.ts

src/hooks/useLocalStorageJson.ts (+ test)
```

### Open convention question: `src/features/`

Drafts are used by both `SubmitWebsite` and `Feed`. CLAUDE.md allows only `src/pages/<Feature>`
(self-contained) and generic global folders, so there is no home yet for **shared business
domains**. The plan proposes `src/features/<domain>/` for them. The same folder would later also
fix the existing `pages/Feed/constants/categories.ts`, which is used by four places. If adopted,
add one line to CLAUDE.md. The alternative is to keep drafts in `SubmitWebsite/` and let `Feed`
import from it, which is a cross-feature import like the ones flagged in
[`current/frontend/20-frontend-modules`](../architecture/current/frontend/20-frontend-modules.puml).

## Contract and mocks (phase 1)

- `src/interfaces/IWebsite.ts`: mirror the target `Website`, `WebsitePreview`,
  `WebsiteSubmission`, `WebsiteStatus` and the error envelope `IApiError`
  (`{ error: { code, message, existingId? } }`).
  - `id` becomes a string ULID. `categories: string[]` (slugs) replaces `keywords`; the feed
    reads categories through an adapter until the list endpoint is migrated.
  - Add `status` and `verifiedAt`.
- `src/api/api.ts`: a `v1` path prefix, and error normalization to `IApiError` instead of
  copying `data.error` into `message`.
- `src/config/env.ts`: add `TURNSTILE_SITE_KEY`. With mocks on, use Cloudflare's always-pass
  test key `1x00000000000000000000AA`.
- `src/__mocks__/handlers.ts` and `data/`:
  - `GET /v1/websites/preview`: fixture metadata; one fixture URL returns 409 `{existingId}`,
    one returns 422 unreachable.
  - `POST /v1/websites`: 202 `checking`. It records the submission in an in-memory map; `GET`
    returns `published` 5 s later. URLs containing `rejeitado` return `rejected` / `unsafe`.
  - `GET /v1/websites/:id` reads the map, falling back to `MOCK_WEBSITES`.
  - `POST /v1/websites/:id/verify`: `verified: true` for even ids, `widget_not_found` otherwise.
  - Every mock website gains `status: 'published'` and some get `verifiedAt`.

Done when the types compile, the handlers respond, and a unit test of the handler state machine
(checking → published / rejected) passes.

## The form page (phase 2)

**Route.** Add `/websites/novo` inside `NosNoCaboLayout`. "Adicionar meu site"
(`layouts/NosNoCaboLayout/components/TopbarActions`, `pages/LandingPage/LandingPage.tsx`)
becomes a `Link`. While doing this, fix the `<Button>` nested inside a `<Link>` on the landing
page by using `Button asChild`.

**Layout.** One column on mobile. On desktop the fields are on the left and the preview card
sticks on the right, so the submitter sees how the card will look in the feed (it reuses
`FeedCard` visuals).

**Flow**
1. `UrlField` has autofocus and accepts `exemplo.com` without a scheme; `normalizeUrl` adds
   `https://`. The value is debounced (`@/hooks/useDebounce`, 400 ms) and then fetches the
   preview (`useWebsitePreview`, `enabled` only for a syntactically valid URL,
   `staleTime: Infinity`).
   - While loading: a preview-card skeleton with the same dimensions (see the `loading-skeletons` skill).
   - 409: an inline message "Esse site já está no Nós no Cabo" with a link to `/website/:existingId`; submit is disabled.
   - 422: "Não conseguimos acessar esse endereço". The fields stay editable, so an unreachable
     site can still be submitted manually.
2. `DetailsFields` are prefilled from the preview only while the user has not edited them (a
   `touched` flag per field), so retyping the URL does not wipe edits. Name is 3–80 characters,
   description at most 280 with a counter, colour through `InputColor`.
3. `CategoryPicker`: `CategoryChip` moved from `WebsiteForm/components/KeywordsStep/`, with its
   test adapted from `KeywordsStep.test.tsx`. It allows 1–3 picks and shows the description line
   of the last pick, as today.
4. `TurnstileField`, then a single "Enviar" button.

**Form handling.** `@/components/Form` builds its values with
`Object.fromEntries(new FormData())`, which keeps only one value for repeated checkbox names. So
categories stay in controlled state and the submit handler composes the payload with
`toSubmission`. Keep to the CLAUDE.md form rules: no gap or margins on `<Form>` or on input wrappers.

**Success.** The page swaps to `SubmitSuccess`: "Recebemos {name}! Ele aparece no feed para você
enquanto verificamos o conteúdo." with the CTAs "Ver no feed" (`/websites`) and "Adicionar o selo
ao seu site" (`/websites/:id/selo`). There is no toast.

Done when a user can complete a submission with keyboard only, the 409 and 422 paths behave, and
`SubmitWebsite.test.tsx` covers happy path, duplicate, unreachable and validation.

## Drafts in the feed (phase 3)

- `useLocalStorageJson<T>(key, initial, isValid)`: a JSON sibling of
  `src/hooks/useLocalStorageState.ts`, with the same guarded storage access.
- `usePendingSubmissions` stores drafts as described in ADR 0003 and drops expired ones on read.
- `useSubmitWebsite.onSuccess` adds the draft from the 202 body.
- `usePendingStatusPolling`: one `useQueries` over the `checking` drafts, with
  `refetchInterval: 5000` and `refetchIntervalInBackground: false`. It is mounted once in the
  feed page. On `published` it removes the draft and invalidates `['websites']`; on `rejected`
  it updates the draft.
- `Feed.tsx`: `mergeDrafts(serverList, drafts)` puts the drafts first. They are not affected by
  the category filter (they show while the submitter is filtering, so they are never "lost").
- `FeedCard` / `FeedTable` get `variant?: 'draft' | 'rejected'`:
  - draft: dashed border using a border token (add `--color-border-draft` to `ITheme.ts` and
    both themes if no existing token fits), a small `Loading` with "Em análise", not clickable;
  - rejected: muted card with the reason ("Conteúdo não permitido" / "Site inacessível") and "Dispensar".

Done when a submission shows first in the feed, survives a reload, turns into a normal card after
about 5 s with mocks, and a `rejeitado` URL ends as a dismissable rejected card. Unit tests cover
`mergeDrafts`, expiry, and polling reconciliation (with fake timers). Check the draft card
visually in the browser, per `visual-verification-playwright`.

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

## Not in scope

The backend itself, the server-side pagination migration of the feed, metrics, the landing page's
real data, and community reports.
