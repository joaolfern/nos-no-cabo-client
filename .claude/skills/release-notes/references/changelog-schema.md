# End-user notes schema

The JSON file at `userNotesPath` (default `public/changelog.json`). Keys are camelCase and the format is framework-neutral: any front end, or none, can consume it.

```json
{
  "schemaVersion": 1,
  "latest": "0.2.0",
  "releases": [
    {
      "version": "0.2.0",
      "date": "2026-10-05",
      "title": "Safer passwords",
      "changes": [
        { "type": "new", "text": "A strength indicator when you create or change your password." },
        { "type": "improved", "text": "Searching for candidates is faster." },
        { "type": "fixed", "text": "Fixed an error when signing in after refreshing the page." }
      ]
    }
  ]
}
```

The example is in English; write `title` and `changes[].text` in the configured language.

| Field | Rules |
|---|---|
| `schemaVersion` | always `1` |
| `latest` | equals `releases[0].version` and the manifest's `version` |
| `releases` | newest first, versions strictly descending, no duplicates |
| `releases[].version` | plain `MAJOR.MINOR.PATCH`, no `v` prefix |
| `releases[].date` | `YYYY-MM-DD`, in the local time zone of whoever prepares the release |
| `releases[].title` | 2-6 words summarising the headline change. Required even when `changes` is empty |
| `releases[].changes` | may be `[]` (internal-only release; consumers should not display it) |
| `changes[].type` | `new` \| `improved` \| `fixed` |
| `changes[].text` | one sentence, <= 120 chars, ends with a period |

## Wording

Write what the person can now do, or no longer suffers from.

| Avoid | Prefer |
|---|---|
| Refactored the PasswordMeter component | *(omit: not user-visible)* |
| Added usePasswordStrength hook (PROJ-123) | A strength indicator when you create or change your password. |
| Fix hydration mismatch on the login page | Fixed an error when signing in after refreshing the page. |
| Performance improvements | The candidate list loads faster. |
| Various fixes and improvements | *(be specific, or omit)* |

Do not mention: ticket ids, file/component/library names, endpoints, or developer terms ("refactor", "hook", "API", "deploy").

## When users have no earlier notes

If the base branch published no notes yet (`hasPriorUserNotes: false`), users have nothing to compare against. Write the first entry as an overview of what the app offers, with a welcoming title, instead of a list of what changed.
