---
name: release-notes
description: Prepare a release for the current branch of a JavaScript/TypeScript project. Diffs the branch against the base branch, picks the semver bump, updates package.json, writes developer notes (CHANGELOG.md) and end-user notes (a JSON file an app can display). Use when the user asks for a release, release notes, a changelog, a version bump or a new version, or is about to open a PR.
---

# release-notes

Turns a branch's diff against the base branch into:

1. a **semver bump** in `package.json`,
2. **developer notes** in `CHANGELOG.md` (technical),
3. **end-user notes** in a JSON file (plain language) that the app can display. See "Showing the notes in the app" at the end; this skill produces the data, it does not ship any UI.

Assumptions (tell the user if the project works differently): the unit of release is a branch merged into the base branch, the project has a `package.json` with a `version`, and it is a single package (for a monorepo, point `packageJsonPath` at one workspace package).

**Never run `git commit`, `git push` or `git tag`, and never edit history.** Write and format files, then leave committing to the user.

## Configuration (optional)

`release-notes.config.json` at the repo root. Every key is optional; the script prints the effective values under `config`.

| Key                   | Default                                              | Purpose                                                                                                  |
| --------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `baseBranch`          | auto (`origin/HEAD`, `main`, `master`, `develop`)    | branch releases are compared against                                                                     |
| `packageJsonPath`     | `package.json`                                       | manifest whose `version` is bumped                                                                       |
| `userNotesPath`       | `public/changelog.json`                              | end-user notes file                                                                                      |
| `developerNotesPath`  | `CHANGELOG.md`                                       | developer notes file                                                                                     |
| `sourceDirs`          | auto (`src`, `app`, `packages`, ...) else whole repo | directories whose text diff is included                                                                  |
| `ignore`              | `[]`                                                 | extra pathspec globs excluded from diff and file list                                                    |
| `formatCommand`       | detects prettier + package manager                   | formatter with a `{files}` placeholder                                                                   |
| `language`            | match existing notes, else the app's UI language     | language of the end-user notes                                                                           |
| `audience`            | "the app's users"                                    | who reads the end-user notes, e.g. "recruiters using the hiring portal"                                  |
| `firstReleaseVersion` | `0.1.0`                                              | used only when no version exists anywhere                                                                |

Do not store a one-off correction (like a wrong base version) here: it would keep applying after it stops being true.

## 1. Gather context

```bash
node <path to this skill>/scripts/release-context.mjs
```

Read-only; prints JSON; works from any directory in the repo. Options: `--base <ref>`, `--base-version <x.y.z>` (see step 2), `--max-diff-lines <n>`. Key fields:

| Field                                                | Meaning                                                                                                                                                                                                                  |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `baseVersion`, `baseVersionSource`                   | the version to bump from and where it came from. Trust order: `--base-version`, then `package.json` on the base branch (**the source of truth**), then `latest` in the base branch's end-user notes, else `null`          |
| `isFirstRelease`                                     | `baseVersion` is `null`: no version exists anywhere. Use `nextVersions.initial`                                                                                                                                          |
| `isPreStable`                                        | `baseVersion` is `0.y.z` (pre-1.0 rules in step 3)                                                                                                                                                                       |
| `currentVersion`, `alreadyBumped`, `existingRelease` | state of an earlier run on this branch. **Replace `existingRelease`, never add a second entry**                                                                                                                          |
| `versionRegression`                                  | `currentVersion` is _lower_ than `baseVersion` (see step 2)                                                                                                                                                              |
| `nextVersions`, `suggestedBump`, `suggestedVersion`  | computed versions and a heuristic hint from commit types. A hint, not a decision                                                                                                                                         |
| `hasPriorUserNotes`, `priorNotesSample`              | whether the base branch already published end-user notes, and a sample (use it to match language and tone)                                                                                                               |
| `commits`                                            | `git log <base>..HEAD --no-merges` with parsed conventional-commit `type` and `breaking` (non-conventional commits have `type: null`)                                                                                    |
| `changedFiles`                                       | changed files grouped by area, lockfiles and generated output excluded                                                                                                                                                   |
| `diff`, `diffTruncated`                              | unified text diff of the source dirs. If truncated, rely on `commits` + `changedFiles` and open specific files to confirm anything unclear                                                                               |
| `dirtyNonReleaseFiles`                               | uncommitted files that are not release files. Mention them; the diff may not include them                                                                                                                                |
| `config`, `configWarnings`                           | effective configuration and problems found in it                                                                                                                                                                         |

If the script cannot find a base branch it says so; ask the user which branch to use.

## 2. Check the baseline

`package.json` on the base branch is what the project says its current version is, so believe it. Then:

- **`versionRegression` is true**: this branch's version is lower than the base's. Ask the user whether that is a deliberate correction (for example the base carried a wrong version). If yes, keep `currentVersion` and only refresh the notes for it; do not bump again. If no, restore the version and continue.
- **The user says the base version is wrong and this is a fresh run**: re-run with `--base-version <correct version>`, once. Do not write it into the config or anywhere else; after the branch merges, the base's own `package.json` is correct and the override is no longer needed.
- **`isFirstRelease`**: nothing to bump from. Use `nextVersions.initial`.

## 3. Decide the semver bump

Skip when `isFirstRelease` or when a regression was confirmed as deliberate. Otherwise judge by what an **end user or integrator would notice**, relative to `baseVersion`:

- **major**: a user-visible feature removed or renamed, a breaking change to something persisted or bookmarked by users (stored data, URLs, public API), a forced re-login or data migration, or an explicit `BREAKING CHANGE` / `type!:` commit.
- **minor**: a new user-visible capability, screen or option.
- **patch**: bug fixes, performance, refactors, dependency bumps, tooling, and anything else users cannot see.

**Pre-1.0 (`isPreStable`)**: the public surface may still change, so a breaking change or a new capability both bump **minor**, and fixes/internal work bump **patch**. `major` (= `1.0.0`) means "declare the project stable": never infer it; offer it only if the user says this is the 1.0.0 release, and ask before using it.

Confirm `suggestedBump` against the actual diff (a `feat:` commit that only adds an internal helper is a patch). State the choice with a one-line reason. Ask the user **only** when the bump is a major one (from `>=1.0.0`, or a proposed `1.0.0`) or when commits and diff clearly disagree. Otherwise proceed.

## 4. Developer notes

`developerNotesPath`, [Keep a Changelog](https://keepachangelog.com) style, newest first. Create it with a short header if missing.

```markdown
## [0.2.0] - 2026-10-05

### Breaking

- ...

### Added

- Password strength meter with a sectioned bar (`src/components/PasswordMeter`).

### Changed

- ...

### Fixed

- Hydration mismatch caused by reading `location.hash` during server rendering.

### Removed / Security

- ...
```

Rules: technical and precise. Mention the ticket key if the branch name has one, notable modules, endpoints, config or env changes, dependency upgrades. Omit empty sections. Group related commits into one line; do not paste commit subjects. Only describe what the diff shows. Use `today` from the context for the date. If `existingRelease` is set, or the file already has this version's heading, **replace** that section in place.

## 5. End-user notes

`userNotesPath`. Schema and wording examples: `references/changelog-schema.md`; read it before writing.

- **Language**: `config.language`; else the language of `priorNotesSample`; else the language of the app's UI (look at a few user-facing strings). If it is still unclear, ask.
- **Audience**: `config.audience`, else "the app's users". Write for them, describing the **benefit**, not the implementation. No ticket ids, file names, library names, or developer jargon (refactor, hook, endpoint, API).
- One short sentence per item, <= 120 characters, at most ~6 items; merge small related ones.
- `type`: `new` (new capability), `improved` (something got better), `fixed` (something broken now works).
- Include only what users can see **and** is traceable to the diff. Never invent or embellish.
- If `hasPriorUserNotes` is false, users have nothing to compare against: write an overview of what the app offers ("welcome"), not "what changed".
- If nothing is user-visible, still add the release with `"changes": []`: version tracking stays intact and consumers skip it.
- Keep `releases` newest first and set `"latest"` to this version. Create the file with `"schemaVersion": 1` if missing. Preserve older releases untouched.

## 6. Update the version

Set `"version"` in `packageJsonPath` to the chosen `nextVersions` entry (or keep `currentVersion` after a confirmed regression). Edit only that field. Do not create tags.

## 7. Verify and report

1. Format the touched files with `config.formatCommand` (replace `{files}` with the manifest and both notes files). Skip if it is `null`.
2. Check that the notes file parses, `latest` equals `releases[0].version` equals the manifest version, versions are strictly descending, and dates are `YYYY-MM-DD`.
3. Re-run the context script: `existingRelease` must now be the entry you wrote (idempotency), and `dirtyNonReleaseFiles` unchanged by you.
4. Report to the user: old -> new version, the bump reason, both sets of notes, and that nothing was committed.

## Showing the notes in the app (optional)

This skill never ships UI: it is specific to each app's components, styling, auth and language. If the app should display the notes, implement a small consumer, roughly:

1. **Serve** the notes file as a static asset (for example under `public/`).
2. **Fetch** it without caching. Treat every failure (404, an SPA fallback returning HTML, malformed JSON, wrong shape) as "no notes" and show nothing; never surface an error to users.
3. **Track what each user has seen**: store the last dismissed version per user (key it by user id so shared browsers behave), and write the latest version when they dismiss. Compare versions numerically as semver, never as strings.
4. **Decide what is unseen**: a first-time user sees only the newest release; a returning user sees every release newer than the stored version. Skip releases with `changes: []`. Show nothing until the user is known, otherwise the dismissal cannot be remembered.
5. **Render** unseen releases in a dialog or banner mounted in the authenticated layout, so it appears once per release. Add a "version" entry in a settings/profile screen that reopens the full history on demand.
6. **Test** the seen-logic (first visit, returning user, empty release, bad response, storage failing) with the app's test runner.

## Edge cases

- **Two branches from the same base version** compute the same next version. Whoever merges second merges the base in and re-runs this skill.
- **Huge first diff** (a repo's initial release): summarise by feature area from `commits`, not by file.
- **A placeholder version in `package.json`** (for example `1.0.0` from a template) is trusted like any other, so if it is wrong, tell the user and use the one-off `--base-version` correction rather than guessing.
- **Uncommitted unrelated changes**: proceed, but say the notes reflect committed work plus tracked changes only.
- **Pre-release suffixes** (`1.2.3-beta.1`) are dropped when computing the next version.
- **Monorepos** are supported one package at a time via `packageJsonPath` (and `sourceDirs`).
