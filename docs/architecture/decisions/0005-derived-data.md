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
  on `websites_by_ring (status, ring_group, published_at, id)`, where `ring_group` is a
  generated column (`verified_at IS NULL`, migration 0006) so the lookup seeks by position. `counters.ring_version` changes whenever the ring changes, so a
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
- The catalog's random neighbour seeks a random rowid, so a site after a long run of
  rejected or deleted rows is picked more often. It is read-cheap, not uniform; the router
  (phase 9) picks uniformly from its cached ring, and is where widget clicks land.
- Triggers don't cover `UPDATE website_categories` (nothing does that) or reordering
  `categories.position`; run the rebuild after either.
