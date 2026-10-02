# Catalog derived data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop recomputing catalog aggregates on every read. Category counts, the published total, each site's category list and the search index are stored and kept in sync by SQLite triggers. The ring neighbours become index lookups. Widget ring links get `rel="nofollow"`.

**Architecture:**
- Values derived from `websites` and `website_categories` live in the catalog's own D1. They are maintained by triggers, so every writer stays consistent without extra code: the catalog, the private review script's raw SQL, the seed and manual `wrangler d1 execute` fixes.
- `sql/rebuild-derived.sql` recomputes all of them from the source tables. Tests use it to prove the triggers are right; the review script uses it to repair drift.
- The ring has no stored positions. Previous and next are keyset lookups on the existing `websites_by_ring` index, and a `ring_version` counter lets the future router (phase 9) cache the whole ring order and refetch only when it changes.

**Tech Stack:** Cloudflare Workers, D1 (SQLite with FTS5 and triggers), Hono, Vitest with `@cloudflare/vitest-pool-workers`; the client is React plus Vitest.

**Spec:** this plan. The decisions behind it, settled with the owner on 2026-10-02:
- Mixed sync: triggers inside one database, no stored ring positions, a rebuild query.
- Every derived value is in scope: category and total counts, the category column, the ring index and FTS5 search.
- The router redirects instead of the widget fetching anything.
- `nofollow` on ring links.
- ADR 0005 (Task 6) records the rule for later phases.

## Global Constraints

- Repos:
  - nos-sr is `/home/joaolfern/dev/joao/nos-sr`, branch `moderation`. Catalog code is in `services/catalog/`.
  - nos-client is `/home/joaolfern/dev/joao/nos-client`, branch `rework-appearance-internal`.
  - The private moderation Worker is `nos-sr/services/moderation/`, its own git repo, outside the npm workspaces.
- **No commits by the agent.** The owner commits (nos-client `CLAUDE.md`, "Git safety"). Each task ends with a checkpoint that runs its checks and stops.
- nos-sr checks: `npm run typecheck` and `npm test` from the repo root. For one service: `npx vitest run <file>` inside `services/catalog` (a hang over 15 s counts as a failure).
- nos-client checks: `pnpm exec vitest run <name>` for the changed file only, then `pnpm lint` and `pnpm build`. Never run the whole suite.
- Formatting: Prettier, no semicolons, single quotes. Run `npx prettier --write` on changed nos-sr files and `pnpm format` in nos-client, then revert unrelated files that `pnpm format` touches.
- Comments: only a short non-obvious *why*, one line. The one exception is the SQL migration header.
- **No contract change.** `@nosnocabo/contract` stays at 0.3.0. Response shapes (`Page<Website>`, `CategoryList`, `WebsiteNeighbours`) don't change.
- D1 facts this plan relies on:
  - Foreign keys are enforced, and `ON DELETE CASCADE` runs.
  - FTS5 is supported.
  - `wrangler d1 export` refuses databases with virtual tables. Workaround: drop `websites_fts`, export, recreate it, then run the rebuild.
  - Rows written by triggers count toward the 100k rows/day free limit.
- Never send bursts of requests to staging; that needs the owner's explicit permission.

## Review Focus

1. **Search text that looks like FTS5 syntax** (`"`, `*`, `AND`, `NEAR(`, `-`, `:`) must return 200 with matches or an empty page, never a 500. Pinned in Task 3, Step 1 ("treats FTS syntax in the query as plain text").
2. **A published site deleted outright** (cascade to `website_categories`) must decrease each category count exactly once. Pinned in Task 1, Step 1 ("deleting a published site").
3. **Resubmitting a rejected URL** (one batch: delete the rejected row, insert the new one with its categories) must leave counts, the categories column and the search index consistent. Pinned in Task 1, Step 1 ("resubmitting a rejected url").
4. **A ring with one or two published sites:** alone means no neighbours. Two means previous and next are both the other site, and random is the other site, never itself. Pinned in Task 4, Step 1.
5. **Accents, case and partial words:** `diário`, `DIARIO` and `diár` all find "Querido Diário". A query with no letters or digits (`%`) returns an empty page. Pinned in Task 3, Step 1.

---

## File map

**nos-sr `services/catalog/`**
- Create `migrations/0004_derived_data.sql`: new columns, the `counters` table, the `websites_fts` table, triggers and a one-time backfill.
- Create `migrations/0005_drop_search_key.sql`: drops the unused `search_key` column.
- Create `sql/rebuild-derived.sql`: recomputes every derived value from the source tables.
- Create `src/lib/searchQuery.ts`: turns user input into a safe FTS5 `MATCH` string.
- Create `src/db/ring.ts`: ring SQL, `getNeighbours`, `getRing`, `getRingVersion`. `getNeighbours` moves here from `websites.ts`.
- Modify:
  - `src/db/websites.ts`: column list, insert, list total, categories, search.
  - `src/routes/websites.ts`: import `getNeighbours` from `ring.ts`.
  - `src/rpc.ts`: `getRing` and `getRingVersion`.
  - `scripts/buildSeed.mjs`: drop `search_key`.
  - `vitest.config.ts` and `test/env.d.ts`: rebuild SQL as a test binding.
- Delete `src/lib/searchKey.ts`.
- Tests:
  - Create `test/derived.ts` (drift and rebuild helpers), `test/derived.test.ts` and `test/ring.test.ts`.
  - Modify `test/websites.test.ts` (search tests) and `test/moderation.test.ts` (RPC ring methods).

**nos-sr `services/moderation/`** (private repo)
- Modify `scripts/review.mjs` (`rebuild` command) and `README.md`.

**nos-client**
- Modify:
  - `src/pages/WidgetEditor/utils/buildWidgetSnippet.ts` and its test: `rel="nofollow"` on ring links.
  - `src/pages/WidgetEditor/components/CustomWidgetGuide/CustomWidgetGuide.tsx`: tell custom widget authors to use it.
  - `docs/architecture/target/backend/11-data-model.puml`.
  - `docs/plans/form-rework.md`: "Current status".
- Create `docs/architecture/decisions/0005-derived-data.md`.

---

### Task 1: Derived columns and triggers (migration 0004)

**Files:**
- Create: `nos-sr/services/catalog/migrations/0004_derived_data.sql`
- Create: `nos-sr/services/catalog/test/derived.ts`
- Create: `nos-sr/services/catalog/test/derived.test.ts`

**Interfaces:**
- Consumes: the existing `websites`, `website_categories` and `categories` tables, and the test helpers `submit`, `get` and `SUBMISSION` in `test/api.ts`.
- Produces:
  - Columns `categories.published_count INTEGER` and `websites.category_slugs TEXT` (a JSON array in category display order).
  - Table `counters(name, value)` with rows `published_websites` and `ring_version`.
  - FTS5 table `websites_fts(website_id UNINDEXED, name, description)`.
  - Test helpers `derivedDrift(db): Promise<string[]>` and `ringVersion(db): Promise<number>`.

- [ ] **Step 1: Write the drift helper and the failing tests**

`test/derived.ts`:

```ts
const EXPECTED_SLUGS = (websiteId: string) => `COALESCE((
  SELECT json_group_array(slug) FROM (
    SELECT c.slug FROM website_categories wc
    JOIN categories c ON c.slug = wc.category_slug
    WHERE wc.website_id = ${websiteId} ORDER BY c.position)), '[]')`

const DRIFT_QUERIES = {
  categoryCount: `
    SELECT c.slug AS key FROM categories c
    WHERE c.published_count != (
      SELECT COUNT(*) FROM website_categories wc
      JOIN websites w ON w.id = wc.website_id
      WHERE wc.category_slug = c.slug AND w.status = 'published')`,
  publishedTotal: `
    SELECT 'published_websites' AS key FROM counters
    WHERE name = 'published_websites'
      AND value != (SELECT COUNT(*) FROM websites WHERE status = 'published')`,
  categorySlugs: `
    SELECT w.id AS key FROM websites w
    WHERE w.category_slugs != ${EXPECTED_SLUGS('w.id')}`,
  searchMissing: `
    SELECT w.id AS key FROM websites w
    WHERE NOT EXISTS (SELECT 1 FROM websites_fts f
      WHERE f.website_id = w.id AND f.name = w.name AND f.description = w.description)`,
  searchOrphan: `
    SELECT f.website_id AS key FROM websites_fts f
    WHERE NOT EXISTS (SELECT 1 FROM websites w WHERE w.id = f.website_id)`,
}

// Every stored value compared with the same value computed from the source tables.
export async function derivedDrift(db: D1Database) {
  const results = await db.batch<{ key: string }>(
    Object.values(DRIFT_QUERIES).map((sql) => db.prepare(sql))
  )
  return Object.keys(DRIFT_QUERIES).flatMap((name, index) =>
    (results[index]?.results ?? []).map(({ key }) => `${name}:${key}`)
  )
}

export async function ringVersion(db: D1Database) {
  const row = await db
    .prepare("SELECT value FROM counters WHERE name = 'ring_version'")
    .first<{ value: number }>()
  return row?.value ?? 0
}
```

`test/derived.test.ts`:

```ts
import type { Website } from '@nosnocabo/contract'
import { env } from 'cloudflare:test'
import { exports } from 'cloudflare:workers'
import { describe, expect, it } from 'vitest'
import { SUBMISSION, submit } from './api'
import { derivedDrift, ringVersion } from './derived'

const SAFE = {
  verdict: 'safe' as const,
  categoriesFlagged: [],
  model: 'test-model',
}

async function create(url: string, categories = ['educacao', 'saude']) {
  const response = await submit({ ...SUBMISSION, url, categories })
  return ((await response.json()) as Website).id
}

async function publish(id: string) {
  await exports.CatalogRpc.applyModeration(id, { ...SAFE, decision: 'publish' })
}

async function counts() {
  const { results } = await env.DB.prepare(
    "SELECT slug, published_count FROM categories WHERE slug IN ('educacao', 'saude') ORDER BY position"
  ).all<{ slug: string; published_count: number }>()
  return Object.fromEntries(results.map((r) => [r.slug, r.published_count]))
}

describe('derived data triggers', () => {
  it('stores categories in display order and indexes new sites for search', async () => {
    const id = await create('ordem.dev', ['saude', 'educacao'])

    const row = await env.DB.prepare(
      'SELECT category_slugs FROM websites WHERE id = ?'
    )
      .bind(id)
      .first<{ category_slugs: string }>()
    expect(JSON.parse(row?.category_slugs ?? '')).toEqual(['educacao', 'saude'])
    expect(await derivedDrift(env.DB)).toEqual([])
  })

  it('counts a site only while it is published', async () => {
    const id = await create('conta.dev')
    expect(await counts()).toEqual({ educacao: 0, saude: 0 })

    await publish(id)
    expect(await counts()).toEqual({ educacao: 1, saude: 1 })

    await env.DB.prepare(
      "UPDATE websites SET status = 'checking', review_flag = 'reported' WHERE id = ?"
    )
      .bind(id)
      .run()
    expect(await counts()).toEqual({ educacao: 0, saude: 0 })
    expect(await derivedDrift(env.DB)).toEqual([])
  })

  it('does not count rejected or held sites', async () => {
    const rejected = await create('rejeitado.dev')
    const held = await create('retido.dev')
    await exports.CatalogRpc.applyModeration(rejected, {
      ...SAFE,
      decision: 'reject',
      reason: 'unsafe',
      verdict: 'unsafe',
    })
    await exports.CatalogRpc.applyModeration(held, {
      ...SAFE,
      decision: 'hold',
      flag: 'unreachable',
      verdict: 'error',
    })

    expect(await counts()).toEqual({ educacao: 0, saude: 0 })
    expect(await derivedDrift(env.DB)).toEqual([])
  })

  it('stays consistent when the review script publishes with raw SQL', async () => {
    const id = await create('manual.dev')
    await env.DB.prepare(
      "UPDATE websites SET status = 'published', published_at = 1, short_code = 'abc123', review_flag = NULL WHERE id = ?"
    )
      .bind(id)
      .run()

    expect(await counts()).toEqual({ educacao: 1, saude: 1 })
    expect(await derivedDrift(env.DB)).toEqual([])
  })

  it('stays consistent when resubmitting a rejected url', async () => {
    const first = await create('de-novo.dev', ['educacao'])
    await exports.CatalogRpc.applyModeration(first, {
      ...SAFE,
      decision: 'reject',
      reason: 'unsafe',
      verdict: 'unsafe',
    })

    const second = await create('de-novo.dev', ['saude'])
    await publish(second)

    expect(await counts()).toEqual({ educacao: 0, saude: 1 })
    expect(await derivedDrift(env.DB)).toEqual([])
  })

  it('decrements once when deleting a published site', async () => {
    const id = await create('apagado.dev')
    await publish(id)

    await env.DB.prepare('DELETE FROM websites WHERE id = ?').bind(id).run()

    expect(await counts()).toEqual({ educacao: 0, saude: 0 })
    expect(await derivedDrift(env.DB)).toEqual([])
  })

  it('handles a seed-style insert: published row first, categories after', async () => {
    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO websites (id, url, url_normalized, name, status, submitted_at, published_at, submitter_ip_hash)
         VALUES ('01SEED000000000000000000AA', 'https://semente.dev/', 'semente.dev', 'Semente', 'published', 1, 1, 'seed')`
      ),
      env.DB.prepare(
        "INSERT INTO website_categories (website_id, category_slug) VALUES ('01SEED000000000000000000AA', 'saude')"
      ),
    ])

    expect(await counts()).toEqual({ educacao: 0, saude: 1 })
    expect(await derivedDrift(env.DB)).toEqual([])
  })

  it('keeps the search index in step with renamed sites', async () => {
    const id = await create('renomeado.dev')
    await env.DB.prepare("UPDATE websites SET name = 'Outro nome' WHERE id = ?")
      .bind(id)
      .run()

    expect(await derivedDrift(env.DB)).toEqual([])
  })

  it('bumps the ring version only when the ring changes', async () => {
    const id = await create('anel.dev')
    const start = await ringVersion(env.DB)

    await publish(id)
    const published = await ringVersion(env.DB)
    expect(published).toBeGreaterThan(start)

    await env.DB.prepare('UPDATE websites SET likes = 5 WHERE id = ?')
      .bind(id)
      .run()
    expect(await ringVersion(env.DB)).toBe(published)

    await env.DB.prepare('UPDATE websites SET verified_at = 9 WHERE id = ?')
      .bind(id)
      .run()
    expect(await ringVersion(env.DB)).toBeGreaterThan(published)
  })
})
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `cd services/catalog && npx vitest run test/derived.test.ts`
Expected: FAIL with `no such column: category_slugs` / `no such table: counters`.

- [ ] **Step 3: Write migration 0004**

`migrations/0004_derived_data.sql`:

```sql
-- Stored copies of values derived from websites and website_categories (ADR 0005).
-- Triggers keep them in sync for every writer; sql/rebuild-derived.sql recomputes them.

ALTER TABLE categories ADD COLUMN published_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE websites ADD COLUMN category_slugs TEXT NOT NULL DEFAULT '[]';

CREATE TABLE counters (
  name TEXT PRIMARY KEY,
  value INTEGER NOT NULL
);

INSERT INTO counters (name, value) VALUES ('published_websites', 0), ('ring_version', 0);

CREATE VIRTUAL TABLE websites_fts USING fts5(
  website_id UNINDEXED,
  name,
  description,
  tokenize = 'unicode61 remove_diacritics 2'
);

CREATE TRIGGER websites_fts_insert AFTER INSERT ON websites BEGIN
  INSERT INTO websites_fts (website_id, name, description)
  VALUES (NEW.id, NEW.name, NEW.description);
END;

CREATE TRIGGER websites_fts_update AFTER UPDATE OF name, description ON websites BEGIN
  UPDATE websites_fts SET name = NEW.name, description = NEW.description
  WHERE website_id = NEW.id;
END;

CREATE TRIGGER websites_fts_delete AFTER DELETE ON websites BEGIN
  DELETE FROM websites_fts WHERE website_id = OLD.id;
END;

CREATE TRIGGER websites_published_insert AFTER INSERT ON websites
WHEN NEW.status = 'published' BEGIN
  UPDATE counters SET value = value + 1 WHERE name IN ('published_websites', 'ring_version');
END;

CREATE TRIGGER websites_published_change AFTER UPDATE OF status ON websites
WHEN (OLD.status = 'published') != (NEW.status = 'published') BEGIN
  UPDATE counters
    SET value = value + CASE WHEN NEW.status = 'published' THEN 1 ELSE -1 END
    WHERE name = 'published_websites';
  UPDATE categories
    SET published_count = published_count + CASE WHEN NEW.status = 'published' THEN 1 ELSE -1 END
    WHERE slug IN (SELECT category_slug FROM website_categories WHERE website_id = NEW.id);
  UPDATE counters SET value = value + 1 WHERE name = 'ring_version';
END;

-- Deletes the categories while the site still exists, so their trigger counts them once.
CREATE TRIGGER websites_before_delete BEFORE DELETE ON websites BEGIN
  DELETE FROM website_categories WHERE website_id = OLD.id;
  UPDATE counters SET value = value - 1
    WHERE name = 'published_websites' AND OLD.status = 'published';
  UPDATE counters SET value = value + 1
    WHERE name = 'ring_version' AND OLD.status = 'published';
END;

CREATE TRIGGER websites_ring_order_change AFTER UPDATE OF verified_at, published_at ON websites
WHEN OLD.status = 'published' AND NEW.status = 'published'
  AND ((OLD.verified_at IS NULL) != (NEW.verified_at IS NULL)
    OR OLD.published_at IS NOT NEW.published_at) BEGIN
  UPDATE counters SET value = value + 1 WHERE name = 'ring_version';
END;

CREATE TRIGGER website_categories_insert AFTER INSERT ON website_categories BEGIN
  UPDATE categories SET published_count = published_count + 1
    WHERE slug = NEW.category_slug
      AND EXISTS (SELECT 1 FROM websites WHERE id = NEW.website_id AND status = 'published');
  UPDATE websites SET category_slugs = COALESCE((
      SELECT json_group_array(slug) FROM (
        SELECT c.slug FROM website_categories wc
        JOIN categories c ON c.slug = wc.category_slug
        WHERE wc.website_id = NEW.website_id ORDER BY c.position)), '[]')
    WHERE id = NEW.website_id;
END;

CREATE TRIGGER website_categories_delete AFTER DELETE ON website_categories BEGIN
  UPDATE categories SET published_count = published_count - 1
    WHERE slug = OLD.category_slug
      AND EXISTS (SELECT 1 FROM websites WHERE id = OLD.website_id AND status = 'published');
  UPDATE websites SET category_slugs = COALESCE((
      SELECT json_group_array(slug) FROM (
        SELECT c.slug FROM website_categories wc
        JOIN categories c ON c.slug = wc.category_slug
        WHERE wc.website_id = OLD.website_id ORDER BY c.position)), '[]')
    WHERE id = OLD.website_id;
END;

-- One-time backfill; the same statements as sql/rebuild-derived.sql.
UPDATE websites SET category_slugs = COALESCE((
  SELECT json_group_array(slug) FROM (
    SELECT c.slug FROM website_categories wc
    JOIN categories c ON c.slug = wc.category_slug
    WHERE wc.website_id = websites.id ORDER BY c.position)), '[]');

UPDATE categories SET published_count = (
  SELECT COUNT(*) FROM website_categories wc
  JOIN websites w ON w.id = wc.website_id
  WHERE wc.category_slug = categories.slug AND w.status = 'published');

UPDATE counters SET value = (SELECT COUNT(*) FROM websites WHERE status = 'published')
  WHERE name = 'published_websites';

DELETE FROM websites_fts;

INSERT INTO websites_fts (website_id, name, description)
  SELECT id, name, description FROM websites;

UPDATE counters SET value = value + 1 WHERE name = 'ring_version';
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `cd services/catalog && npx vitest run test/derived.test.ts`
Expected: PASS (9 tests).

If the migration fails to apply with a syntax error near `END`, the migration reader split a trigger body. Check that each `CREATE TRIGGER … END;` block is intact in `readD1Migrations` output:

```bash
node -e "import('@cloudflare/vitest-pool-workers').then(async (m) => { const ms = await m.readD1Migrations('migrations'); console.log(ms.at(-1).queries.filter((q) => q.includes('TRIGGER')).length) })"
```

Expected: `9`. If it is lower, report the split and stop: don't rewrite the triggers into another form without the owner.

- [ ] **Step 5: Run the existing catalog suite and the local migration**

Run:
1. `cd services/catalog && npx vitest run` → Expected: PASS (all existing tests plus the 9 new ones).
2. `npx wrangler d1 migrations apply DB --local` → Expected: `0004_derived_data.sql ✅`.

This is the same migration path that staging uses.

- [ ] **Step 6: Checkpoint**

Run `npx prettier --write test/derived.ts test/derived.test.ts`. Stop here; the owner commits.

---

### Task 2: Rebuild query and the review script's `rebuild` command

**Files:**
- Create: `nos-sr/services/catalog/sql/rebuild-derived.sql`
- Modify: `nos-sr/services/catalog/vitest.config.ts`, `test/env.d.ts`, `test/derived.ts`, `test/derived.test.ts`
- Modify (private repo): `nos-sr/services/moderation/scripts/review.mjs`, `README.md`

**Interfaces:**
- Consumes: the tables from Task 1, and `derivedDrift` and `ringVersion` from `test/derived.ts`.
- Produces:
  - `sql/rebuild-derived.sql`: plain statements, one per line group, each ending in `;`, with no semicolons inside a statement.
  - Test binding `TEST_REBUILD_SQL: string` and helper `rebuildDerived(db): Promise<void>`.
  - Review command `rebuild`.

- [ ] **Step 1: Write the failing test**

Append to `test/derived.test.ts`:

```ts
describe('rebuild-derived.sql', () => {
  it('repairs every kind of drift', async () => {
    const id = await create('reparo.dev')
    await publish(id)
    const before = await ringVersion(env.DB)

    await env.DB.batch([
      env.DB.prepare('UPDATE categories SET published_count = 42'),
      env.DB.prepare("UPDATE counters SET value = 7 WHERE name = 'published_websites'"),
      env.DB.prepare("UPDATE websites SET category_slugs = '[]'"),
      env.DB.prepare('DELETE FROM websites_fts'),
    ])
    expect((await derivedDrift(env.DB)).length).toBeGreaterThan(0)

    await rebuildDerived(env.DB)

    expect(await derivedDrift(env.DB)).toEqual([])
    expect(await ringVersion(env.DB)).toBeGreaterThan(before)
  })
})
```

Add `rebuildDerived` to the import from `./derived`.

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx vitest run test/derived.test.ts -t "repairs"`
Expected: FAIL, `rebuildDerived` is not exported.

- [ ] **Step 3: Write the rebuild SQL and wire it into the tests**

`sql/rebuild-derived.sql`:

```sql
-- Recomputes every derived value from websites and website_categories (ADR 0005).
UPDATE websites SET category_slugs = COALESCE((
  SELECT json_group_array(slug) FROM (
    SELECT c.slug FROM website_categories wc
    JOIN categories c ON c.slug = wc.category_slug
    WHERE wc.website_id = websites.id ORDER BY c.position)), '[]');

UPDATE categories SET published_count = (
  SELECT COUNT(*) FROM website_categories wc
  JOIN websites w ON w.id = wc.website_id
  WHERE wc.category_slug = categories.slug AND w.status = 'published');

UPDATE counters SET value = (SELECT COUNT(*) FROM websites WHERE status = 'published')
  WHERE name = 'published_websites';

DELETE FROM websites_fts;

INSERT INTO websites_fts (website_id, name, description)
  SELECT id, name, description FROM websites;

UPDATE counters SET value = value + 1 WHERE name = 'ring_version';
```

`vitest.config.ts`: read the file and pass it as a binding next to `TEST_MIGRATIONS`:

```ts
import { readFile } from 'node:fs/promises'
// …inside defineConfig(async () => { … }):
const rebuildSql = await readFile(
  new URL('./sql/rebuild-derived.sql', import.meta.url),
  'utf8'
)
// …miniflare.bindings:
TEST_REBUILD_SQL: rebuildSql,
```

`test/env.d.ts`: add `TEST_REBUILD_SQL: string` to `Cloudflare.Env`.

`test/derived.ts`: add the helper:

```ts
import { env } from 'cloudflare:test'

export async function rebuildDerived(db: D1Database) {
  const statements = env.TEST_REBUILD_SQL.split(/;\s*$/m)
    .map((sql) => sql.replace(/^--.*$/gm, '').trim())
    .filter(Boolean)
  await db.batch(statements.map((sql) => db.prepare(sql)))
}
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `npx vitest run test/derived.test.ts`
Expected: PASS (10 tests).

- [ ] **Step 5: Add `rebuild` to the review script (private repo)**

In `services/moderation/scripts/review.mjs`:
- Add a helper next to `execute`:

```js
function executeFile(path) {
  execFileSync(
    'npx',
    ['wrangler', 'd1', 'execute', 'DB', ...targetFlags, '--file', path],
    { cwd: CATALOG_DIR, stdio: 'inherit' }
  )
}
```

- Add the case before `default`:

```js
  case 'rebuild':
    executeFile('sql/rebuild-derived.sql')
    console.log('Derived data rebuilt.')
    break
```

- Change the usage line to `'Usage: list | approve <id> | reject <id> <unsafe|unreachable|error> | rebuild'`.

In `services/moderation/README.md`, under "Manual review", add:

```
    npm run review:staging -- rebuild   # recompute counts, categories and search (catalog/sql/rebuild-derived.sql)
```

Verify locally: `cd services/moderation && npm run review:local -- rebuild`. Expected output: `Derived data rebuilt.` Then `npm run review:local -- list` still prints a table.

- [ ] **Step 6: Checkpoint**

Run `npx prettier --write` on the changed TS and `.mjs` files, then `npm run typecheck` from the nos-sr root. Stop; the owner commits nos-sr and the private repo.

---

### Task 3: Read path on the stored values, and FTS5 search

**Files:**
- Create: `nos-sr/services/catalog/src/lib/searchQuery.ts`, `migrations/0005_drop_search_key.sql`
- Modify: `nos-sr/services/catalog/src/db/websites.ts`, `scripts/buildSeed.mjs`, `test/websites.test.ts`
- Delete: `nos-sr/services/catalog/src/lib/searchKey.ts`

**Interfaces:**
- Consumes: `websites.category_slugs`, `categories.published_count`, `counters` and `websites_fts` (Task 1).
- Produces:
  - `toMatchQuery(input: string): string | null`.
  - `WEBSITE_COLUMNS`, `WebsiteRow` and `toWebsite` become exported from `src/db/websites.ts` (Task 4 imports them).

- [ ] **Step 1: Write the failing search tests**

In `test/websites.test.ts`, inside `describe('GET /v1/websites')`, add:

```ts
  it('matches word prefixes, ignoring accents and case', async () => {
    const id = await create('Querido Diário', 'diario.dev', ['cidades'])
    await publish(id)

    for (const q of ['diário', 'DIARIO', 'diár', 'querido dia']) {
      expect(await names(`?q=${encodeURIComponent(q)}`)).toEqual([
        'Querido Diário',
      ])
    }
    expect(await names('?q=uerido')).toEqual([])
  })

  it('treats FTS syntax in the query as plain text', async () => {
    await seed()
    for (const q of ['"', '*', 'gam AND', 'NEAR(gam', '-gam', 'name:gam', '%']) {
      const response = await get(`/websites?q=${encodeURIComponent(q)}`)
      expect(response.status).toBe(200)
    }
    expect(await names(`?q=${encodeURIComponent('"gam"')}`)).toEqual(['Gama'])
  })

  it('reports totals from stored counts, with or without filters', async () => {
    await seed()
    const total = async (query: string) =>
      ((await (await get(`/websites${query}`)).json()) as Page<Website>).total

    expect(await total('')).toBe(3)
    expect(await total('?categoria=educacao')).toBe(2)
    expect(await total('?categoria=educacao&q=gam')).toBe(1)
    expect(await total('?q=%25')).toBe(0)
  })
```

Delete the old `'ignores accents and case when searching'` test: the first new test replaces it.

- [ ] **Step 2: Run them and confirm they fail**

Run: `npx vitest run test/websites.test.ts -t "prefixes|FTS syntax|totals"`
Expected: FAIL. `diár` and `querido dia` don't match with `LIKE` on a single substring.

- [ ] **Step 3: Implement the query builder**

`src/lib/searchQuery.ts`:

```ts
const MAX_TERMS = 8

// User text never reaches FTS5 as syntax: each word becomes a quoted prefix term.
export function toMatchQuery(input: string): string | null {
  const terms = input.normalize('NFC').match(/[\p{L}\p{N}]+/gu) ?? []
  if (terms.length === 0) return null

  return terms
    .slice(0, MAX_TERMS)
    .map((term) => `"${term}"*`)
    .join(' ')
}
```

- [ ] **Step 4: Switch `src/db/websites.ts` to the stored values**

1. Replace the column list and export it, together with the row type and the mapper:

```ts
export const WEBSITE_COLUMNS = `
  w.id, w.url, w.short_code, w.name, w.description, w.color, w.favicon_url, w.repo,
  w.status, w.rejection_reason, w.verified_at, w.submitted_at, w.published_at,
  w.rank_score, w.likes, lower(w.name) AS name_key, w.category_slugs AS categories`
```

   Change `type WebsiteRow` to `export type WebsiteRow` and `function toWebsite` to `export function toWebsite`.

2. In `insertWebsite`, drop `search_key` from the column list and the `toSearchKey(...)` bind value (13 placeholders become 12). Remove the `toSearchKey` import.

3. In `listWebsites`, replace the `q` filter and the total query:

```ts
  if (query.q) {
    const match = toMatchQuery(query.q)
    if (!match) return { items: [], nextCursor: null, total: 0 }

    filters.push(
      'w.id IN (SELECT website_id FROM websites_fts WHERE websites_fts MATCH ?)'
    )
    params.push(match)
  }
```

   Then, instead of the `COUNT(*)` statement in the batch, use:

```ts
function totalStatement(
  db: D1Database,
  query: ParsedWebsiteListQuery,
  where: string,
  params: (string | number | null)[]
) {
  if (query.q) {
    return db
      .prepare(`SELECT COUNT(*) AS total FROM websites w WHERE ${where}`)
      .bind(...params)
  }
  if (query.categoria) {
    return db
      .prepare('SELECT published_count AS total FROM categories WHERE slug = ?')
      .bind(query.categoria)
  }
  return db.prepare(
    "SELECT value AS total FROM counters WHERE name = 'published_websites'"
  )
}
```

   Pass `totalStatement(db, query, where, params)` as the batch's second statement. Delete `escapeLike` if nothing else uses it.

4. Replace the body of `listCategories`:

```ts
export async function listCategories(db: D1Database): Promise<CategoryList> {
  const [categories, total] = await db.batch<Category | { total: number }>([
    db.prepare(
      'SELECT slug, published_count AS count FROM categories ORDER BY position'
    ),
    db.prepare(
      "SELECT value AS total FROM counters WHERE name = 'published_websites'"
    ),
  ])

  return {
    total: (total?.results[0] as { total: number } | undefined)?.total ?? 0,
    items: (categories?.results ?? []) as Category[],
  }
}
```

Add `import { toMatchQuery } from '../lib/searchQuery'`. Delete `src/lib/searchKey.ts`.

- [ ] **Step 5: Drop the old column and update the seed**

`migrations/0005_drop_search_key.sql`:

```sql
-- Search moved to websites_fts (0004).
ALTER TABLE websites DROP COLUMN search_key;
```

In `scripts/buildSeed.mjs`:
- Delete the `toSearchKey` function and its last entry in `columns`.
- Remove `, search_key` from the `INSERT` column list.

The triggers fill the search index and the counts when the seed runs.

- [ ] **Step 6: Run the catalog suite and confirm it passes**

Run: `cd services/catalog && npx vitest run`
Expected: PASS. That includes the existing `'filters by category and search text'` (`?q=gam` → `['Gama']`, `?q=%25` → `[]`) and `'counts published sites per category, in display order'`.

Then run `npm run seed:local && npx wrangler d1 execute DB --local --command "SELECT value FROM counters"`.
Expected: the published total equals the seed size (12), not 0.

- [ ] **Step 7: Checkpoint**

Run `npx prettier --write src test scripts` and `npm run typecheck` from the nos-sr root. Stop; the owner commits.

---

### Task 4: Ring neighbours from the index, and the ring RPC for the router

**Files:**
- Create: `nos-sr/services/catalog/src/db/ring.ts`, `test/ring.test.ts`
- Modify:
  - `nos-sr/services/catalog/src/db/websites.ts`: remove `getNeighbours`.
  - `src/routes/websites.ts`: import it from `ring.ts`.
  - `src/rpc.ts`.
  - `test/moderation.test.ts`.

**Interfaces:**
- Consumes: `WEBSITE_COLUMNS`, `WebsiteRow` and `toWebsite` (Task 3); `counters` (Task 1); the existing index `websites_by_ring ON websites (status, verified_at IS NULL, published_at, id)` (migration 0002).
- Produces:
  - `RING_SQL` (exported for the query-plan tests).
  - `getNeighbours(db, id): Promise<WebsiteNeighbours | null>`, with unchanged behaviour.
  - `getRing(db): Promise<{ version: number; ids: string[] }>`.
  - `getRingVersion(db): Promise<number>`.
  - `CatalogRpc.getRing()` and `CatalogRpc.getRingVersion()`.

- [ ] **Step 1: Write the failing tests**

`test/ring.test.ts`:

```ts
import type { Website, WebsiteNeighbours } from '@nosnocabo/contract'
import { env } from 'cloudflare:test'
import { exports } from 'cloudflare:workers'
import { describe, expect, it } from 'vitest'
import { RING_SQL } from '../src/db/ring'
import { SUBMISSION, get, submit } from './api'

async function published(name: string, fields: { published_at: number; verified_at?: number }) {
  const response = await submit({ ...SUBMISSION, name, url: `${name}.dev` })
  const { id } = (await response.json()) as Website
  await env.DB.prepare(
    "UPDATE websites SET status = 'published', published_at = ?, verified_at = ? WHERE id = ?"
  )
    .bind(fields.published_at, fields.verified_at ?? null, id)
    .run()
  return id
}

const neighbours = async (id: string) =>
  (await (await get(`/websites/${id}/neighbours`)).json()) as WebsiteNeighbours

async function plan(sql: string) {
  const { results } = await env.DB.prepare(`EXPLAIN QUERY PLAN ${sql}`)
    .bind(...Array.from(sql.matchAll(/\?/g), () => 0))
    .all<{ detail: string }>()
  return results.map(({ detail }) => detail)
}

describe('ring', () => {
  it('pairs two sites with each other, never with themselves', async () => {
    const a = await published('alfa', { published_at: 1 })
    const b = await published('beta', { published_at: 2 })

    for (let i = 0; i < 5; i++) {
      const ring = await neighbours(a)
      expect([ring.previous?.id, ring.next?.id, ring.random?.id]).toEqual([b, b, b])
    }
  })

  it('serves the ring order and its version to the router', async () => {
    const a = await published('alfa', { published_at: 1 })
    const b = await published('beta', { published_at: 2, verified_at: 3 })

    const ring = await exports.CatalogRpc.getRing()
    expect(ring.ids).toEqual([b, a])
    expect(await exports.CatalogRpc.getRingVersion()).toBe(ring.version)
  })

  it('finds neighbours through the ring index, without scanning the table', async () => {
    for (const sql of [RING_SQL.next, RING_SQL.previous, RING_SQL.random]) {
      const details = await plan(sql)
      expect(details.join('\n')).not.toMatch(/^SCAN w\b/m)
    }
  })
})
```

Keep the existing neighbours tests in `test/websites.test.ts` unchanged; they must still pass.

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx vitest run test/ring.test.ts`
Expected: FAIL, `../src/db/ring` doesn't exist.

- [ ] **Step 3: Implement `src/db/ring.ts`**

```ts
import type { WebsiteNeighbours } from '@nosnocabo/contract'
import { WEBSITE_COLUMNS, type WebsiteRow, toWebsite } from './websites'

const PUBLISHED = "w.status = 'published'"
const RING_KEY = '(w.verified_at IS NULL, w.published_at, w.id)'
const RING_ASC = 'w.verified_at IS NULL, w.published_at, w.id'
const RING_DESC =
  'w.verified_at IS NULL DESC, w.published_at DESC, w.id DESC'
const FROM = `SELECT ${WEBSITE_COLUMNS} FROM websites w`

// Ring order (ADR 0004): verified first, then publication date. Matches websites_by_ring.
export const RING_SQL = {
  position: `SELECT w.verified_at IS NULL AS unverified, w.published_at, w.id
    FROM websites w WHERE w.id = ? AND ${PUBLISHED}`,
  total: "SELECT value AS total FROM counters WHERE name = 'published_websites'",
  next: `${FROM} WHERE ${PUBLISHED} AND ${RING_KEY} > (?, ?, ?) ORDER BY ${RING_ASC} LIMIT 1`,
  first: `${FROM} WHERE ${PUBLISHED} ORDER BY ${RING_ASC} LIMIT 1`,
  previous: `${FROM} WHERE ${PUBLISHED} AND ${RING_KEY} < (?, ?, ?) ORDER BY ${RING_DESC} LIMIT 1`,
  last: `${FROM} WHERE ${PUBLISHED} ORDER BY ${RING_DESC} LIMIT 1`,
  maxRowid: 'SELECT COALESCE(max(rowid), 0) AS max FROM websites',
  random: `${FROM} WHERE ${PUBLISHED} AND w.id != ? AND w.rowid >= ? ORDER BY w.rowid LIMIT 1`,
  randomWrap: `${FROM} WHERE ${PUBLISHED} AND w.id != ? ORDER BY w.rowid LIMIT 1`,
  ids: `SELECT w.id FROM websites w WHERE ${PUBLISHED} ORDER BY ${RING_ASC}`,
  version: "SELECT value AS version FROM counters WHERE name = 'ring_version'",
}

type RingPosition = { unverified: number; published_at: number; id: string }

async function firstOf(
  db: D1Database,
  sql: string,
  params: unknown[],
  fallbackSql: string,
  fallbackParams: unknown[] = []
) {
  const row =
    (await db.prepare(sql).bind(...params).first<WebsiteRow>()) ??
    (await db.prepare(fallbackSql).bind(...fallbackParams).first<WebsiteRow>())
  return row && toWebsite(row)
}

export async function getNeighbours(
  db: D1Database,
  id: string
): Promise<WebsiteNeighbours | null> {
  const [position, total, maxRowid] = await db.batch<
    RingPosition | { total: number } | { max: number }
  >([
    db.prepare(RING_SQL.position).bind(id),
    db.prepare(RING_SQL.total),
    db.prepare(RING_SQL.maxRowid),
  ])

  const current = position?.results[0] as RingPosition | undefined
  if (!current) return null

  const published = (total?.results[0] as { total: number } | undefined)?.total ?? 0
  if (published < 2) return { previous: null, next: null, random: null }

  const key = [current.unverified, current.published_at, current.id]
  const max = (maxRowid?.results[0] as { max: number } | undefined)?.max ?? 0
  const start = Math.floor(Math.random() * (max + 1))

  const [next, previous, random] = await Promise.all([
    firstOf(db, RING_SQL.next, key, RING_SQL.first),
    firstOf(db, RING_SQL.previous, key, RING_SQL.last),
    firstOf(db, RING_SQL.random, [id, start], RING_SQL.randomWrap, [id]),
  ])

  return { previous, next, random }
}

export async function getRing(db: D1Database) {
  const [version, ids] = await db.batch<{ version: number } | { id: string }>([
    db.prepare(RING_SQL.version),
    db.prepare(RING_SQL.ids),
  ])

  return {
    version: (version?.results[0] as { version: number } | undefined)?.version ?? 0,
    ids: ((ids?.results ?? []) as { id: string }[]).map(({ id }) => id),
  }
}

export async function getRingVersion(db: D1Database) {
  const row = await db.prepare(RING_SQL.version).first<{ version: number }>()
  return row?.version ?? 0
}
```

Delete the old `getNeighbours` from `src/db/websites.ts`, along with any import only it used. In `src/routes/websites.ts`, import `getNeighbours` from `'../db/ring'`.

In `src/rpc.ts`, add to `CatalogRpc`:

```ts
  getRing() {
    return getRing(this.env.DB)
  }

  getRingVersion() {
    return getRingVersion(this.env.DB)
  }
```

with `import { getRing, getRingVersion } from './db/ring'`.

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `npx vitest run test/ring.test.ts test/websites.test.ts`
Expected: PASS. Both existing neighbours tests (`'follows the ring order, verified first, and wraps around'` and `'has no neighbours alone, and 404…'`) and the 3 new ring tests.

If only the query-plan test fails (`SCAN w`), SQLite isn't using the expression index for the row-value comparison. Make the ring key a real column instead:

1. Add a migration `0006_ring_group.sql`:

```sql
ALTER TABLE websites ADD COLUMN ring_group INTEGER GENERATED ALWAYS AS (verified_at IS NULL) VIRTUAL;
DROP INDEX websites_by_ring;
CREATE INDEX websites_by_ring ON websites (status, ring_group, published_at, id);
```

2. In `ring.ts`, replace `w.verified_at IS NULL` with `w.ring_group` in `RING_KEY`, `RING_ASC`, `RING_DESC` and `position`.
3. Re-run Step 4.

- [ ] **Step 5: Checkpoint**

Run `npx prettier --write src test`, then from the nos-sr root `npm run typecheck && npm test`. Expected: PASS, apart from the known gateway rate-limit flake (open item 9 in `form-rework.md`). Re-run once if it appears. Stop; the owner commits.

---

### Task 5: `rel="nofollow"` on widget ring links (nos-client)

**Files:**
- Modify: `nos-client/src/pages/WidgetEditor/utils/buildWidgetSnippet.ts:139-178`
- Modify: `nos-client/src/pages/WidgetEditor/utils/buildWidgetSnippet.test.ts`
- Modify: `nos-client/src/pages/WidgetEditor/components/CustomWidgetGuide/CustomWidgetGuide.tsx`

**Interfaces:**
- Consumes: `widgetLinks` and `buildWidgetSnippet` (unchanged signatures).
- Produces: every `<a>` whose `href` contains `/ring/` carries `rel="nofollow"`. The home link stays followable.

- [ ] **Step 1: Write the failing test**

In `buildWidgetSnippet.test.ts`, inside `describe('buildWidgetSnippet')`:

```ts
  it.each(everyCombination)(
    'keeps crawlers off the ring links, not the home link (%o)',
    (options) => {
      const html = build(options)
      const ringLinks = html.match(/<a [^>]*href="[^"]*\/ring\/[^"]*"[^>]*>/g) ?? []
      const homeLinks =
        html.match(/<a [^>]*href="https:\/\/nosnocabo\.pages\.dev\/"[^>]*>/g) ?? []

      for (const link of ringLinks) expect(link).toContain('rel="nofollow"')
      for (const link of homeLinks) expect(link).not.toContain('nofollow')
    }
  )
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm exec vitest run buildWidgetSnippet`
Expected: FAIL. Ring links have no `rel`.

- [ ] **Step 3: Add the attribute**

In `buildWidgetSnippet.ts`, add `rel="nofollow"` right after `href="${links.prev}"`, `href="${links.next}"` and `href="${links.random}"` in every template, and nowhere else.

For example, line 139 becomes:

```ts
    nav && `<a href="${links.prev}" rel="nofollow">← Anterior</a>`,
```

and line 164 becomes:

```ts
    ? `<a class="nnc-rand" href="${links.random}" rel="nofollow">${SHUFFLE_SVG}Aleatório</a>`
```

That's ten anchors in total: lines 139–141, 152–154, 164, 167, 170 and 177. Confirm afterwards with:

```bash
grep -c 'links\.\(prev\|next\|random\)}" rel="nofollow"' src/pages/WidgetEditor/utils/buildWidgetSnippet.ts
```

Expected: `10`.

In `CustomWidgetGuide.tsx`, after the `<dl className={styles.links}>…</dl>`, add one paragraph with the existing text style:

```tsx
      <p className={styles.text}>
        Use <code>rel="nofollow"</code> nesses links, para que buscadores não
        sigam o anel.
      </p>
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `pnpm exec vitest run buildWidgetSnippet WidgetEditor`
Expected: PASS.

- [ ] **Step 5: Checkpoint**

Run `pnpm format` (then revert unrelated files it touched), `pnpm lint` and `pnpm build`. Stop; the owner commits.

---

### Task 6: ADR 0005, the data model diagram and the status

**Files:**
- Create: `nos-client/docs/architecture/decisions/0005-derived-data.md`
- Modify: `nos-client/docs/architecture/target/backend/11-data-model.puml`
- Modify: `nos-client/docs/plans/form-rework.md` ("Current status")

**Interfaces:**
- Consumes: everything above.
- Produces: the rule that phases 9 (router) and 10 (metrics) follow.

- [ ] **Step 1: Write the ADR**

`docs/architecture/decisions/0005-derived-data.md`:

```markdown
# 0005. Derived data: stored, owned, rebuildable

- Status: accepted
- Date: 2026-10-02

## Context

Reads recomputed aggregates on every request: category counts joined every site, each list
page counted every match, each card rebuilt its category list, search scanned every row and
the ring ranked the whole catalog twice. Every one of those reads costs D1 rows on a plan
with daily caps, and the widget's ring links are clicked from other people's sites.

## Decision

- **Every derived value has one owner and a rebuild.** The owner keeps it in sync; the
  rebuild recomputes it from the source tables and is safe to run at any time.
- **Inside one database, triggers keep derived values in sync.** The catalog's
  `published_count`, `counters.published_websites`, `websites.category_slugs` and
  `websites_fts` are kept by triggers (migration 0004), so the catalog, the review script,
  the seed and manual fixes all stay consistent. `sql/rebuild-derived.sql` is the rebuild,
  available as `review rebuild`.
- **Ordering that an index can answer is not stored.** Ring neighbours are keyset lookups
  on `websites_by_ring`. `counters.ring_version` changes whenever the ring changes, so a
  reader (the router, phase 9) can cache the whole order and refetch only on a new version.
- **Across services, the owner pushes absolute values, only when they change.** Metrics
  (phase 10) pushes `rank_score` and `likes` to the catalog as values, never increments,
  so a missed or repeated push corrects itself on the next run.

## Consequences

- Trigger writes count toward D1's rows-written limit: a status change of a site with three
  categories writes about five extra rows.
- Trigger logic is in migrations, not TypeScript; changing it needs a migration, and
  `test/derived.test.ts` compares every stored value with its recomputed value after each
  kind of write.
- `wrangler d1 export` refuses databases with virtual tables. To export: drop `websites_fts`,
  export, recreate it (migration 0004's `CREATE VIRTUAL TABLE`) and run the rebuild. D1 Time
  Travel restores are unaffected.
- Search matches word prefixes (`diár` finds "Diário"), not substrings inside a word.
```

- [ ] **Step 2: Update the data model diagram**

In `11-data-model.puml`:
- In `websites`, add `category_slugs : text (json, derived)` under `status`, and remove nothing else.
- In `categories`, add `published_count : integer (derived)`.
- Add, inside `package "catalog D1"`:

```
  entity "counters" as counters <<new>> {
    * name : text <<PK>>  published_websites | ring_version
    --
    * value : integer
  }

  entity "websites_fts" as fts <<new>> {
    website_id (unindexed)
    name
    description
    FTS5, unicode61 remove_diacritics 2
  }
```

- Add the relation `websites ||--|| fts : kept by triggers`.
- Remove the `router KV` `ring:order` entity, and replace it with a note on `counters`: `ring order is read from the websites_by_ring index; the router caches it by ring_version`.

- [ ] **Step 3: Update "Current status" in `form-rework.md`**

Under the nos-sr bullet, add:

```markdown
  - **Derived data (ADR 0005):** migrations 0004 and 0005 store category counts, the published
    total, each site's categories and an FTS5 search index, kept by triggers;
    `sql/rebuild-derived.sql` (or `review rebuild`) recomputes them. Ring neighbours are index
    lookups; `CatalogRpc.getRing()` and `getRingVersion()` are ready for the phase 9 router.
```

Under nos-client, add: `- Widget ring links carry rel="nofollow" (snippets copied before this change don't; the phase 9 router's robots.txt covers those).`

In "Open items", add to the staging deploy step: `Catalog deploy applies 0004 and 0005.`

Add a new item: `**Exports:** wrangler d1 export refuses the FTS5 table; see ADR 0005 for the drop, export, recreate, rebuild steps.`

- [ ] **Step 4: Checkpoint**

Re-read the three files for consistency with the code: table and column names, the migration numbers, `rebuild-derived.sql`. Stop; the owner commits.

---

## Done when

- `npm run typecheck && npm test` passes in nos-sr, and `npm run test:moderation` passes.
- `pnpm lint`, `pnpm build` and `pnpm exec vitest run buildWidgetSnippet` pass in nos-client.
- `npx wrangler d1 migrations apply DB --local`, then `npm run seed:local`, then `review:local -- rebuild` all succeed, and `derivedDrift` reports nothing.
- No request path computes `COUNT(*)` over all published sites, rebuilds a card's categories with a subquery, searches with `LIKE '%…%'` or ranks the ring with a window function. Only a search total still counts, and only its matches.
