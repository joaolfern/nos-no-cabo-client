# 0003. Optimistic draft submissions

- Status: accepted
- Date: 2026-09-30

## Context

After submitting, the SFW check runs in the background, from seconds to minutes. The submitter
should see the site right away, at the top of the list, and keep seeing it after a refresh.
Other visitors must not see unchecked content.

## Decision

- `POST /v1/websites` returns **202** with the new website (`status: checking`) and its id.
- The client stores a **draft** in `localStorage` under `nnc-pending-submissions`:
  `{ id, url, name, description, color, faviconUrl, categories, status, rejectionReason?, submittedAt, notify }`.
- The feed puts the drafts before the server list. Draft cards use a distinct style: dashed
  border, a loading indicator, and no link to the details page.
- While drafts are `checking`, the client checks them all with one request,
  `GET /v1/websites/status?ids=…`: every 15 s for the first 2 minutes while the tab is visible,
  then only when the page loads or the tab regains focus (at most once a minute). People are
  expected to leave; nothing polls forever. It reconciles as follows:
  - `published`: drop the draft and invalidate the websites query, so the card now comes from
    the server list;
  - `rejected`: keep the draft as a rejected card showing the reason, with a "Dispensar" button;
  - still `checking` after 7 days: expire the draft.
- The success screen offers an opt-in notification. While a tab is open, the client shows a
  local notification when a check sees the final status. Reaching people who already left
  needs Web Push, a planned future step (`docs/plans/form-rework.md`, "Future steps").
- Other visitors only ever see published sites, because the server lists nothing else.

## Consequences

- The draft exists only in the submitting browser. Another device or a private window will not
  show it. This is acceptable because the success screen explains the review.
- Storage can be unavailable (private mode, blocked site data). The draft then lives in memory
  for the session, the same fallback `useLocalStorageState` already uses.
- This replaces the current optimistic update in `useRegisterWebsite`. That update pushed a fake
  website into the `['websites']` cache, which disappeared on the next refetch.

Diagram: [`target/frontend/21-seq-submit-optimistic`](../target/frontend/21-seq-submit-optimistic.puml).
