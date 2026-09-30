---
name: loading-skeletons
description: Use when adding or editing a loading skeleton (a `<Skeleton>` placeholder standing in for real content while data loads) so it matches the real content's dimensions and causes zero layout shift. Covers measuring the real rendered heights in a browser. Not for unrelated CLS/layout work.
---

# Loading skeletons

When **adding or editing a loading skeleton** (a `<Skeleton>` placeholder standing in for real content while data loads), match its dimensions to the real rendered content it gets swapped for, so the swap causes zero layout shift (CLS). This does not apply to unrelated CLS/layout work — only to skeleton placeholders. Follow these steps:

1. **Identify every element the skeleton stands in for** — for each `isLoading ? <Skeleton/> : realContent` branch, note the real element's tag/classes, and whether its presence is itself conditional on data (e.g. a company line that only renders when a company exists).
2. **Never compute the target height from Tailwind's default line-heights alone** — this project defines no line-height tokens (`src/styles/tokens/typography.css` only has font-family tokens), and arbitrary values like `text-[17px]` have no line-height attached, so the real box height depends on ambient font metrics. Measure it in a running browser instead of guessing.
3. **Measure the real content live**, using the Playwright MCP browser tools:
   - Temporarily uncomment `VITE_ENABLE_MOCK=true` in `.env.local` (restore it to commented-out afterward — never leave this change in).
   - Run `pnpm dev` in the background.
   - If the page is behind auth, log in at `/acesso` with the demo credentials (`admin@fta.org.br` / `123456`), which bypasses real Okta.
   - Navigate to the real page and use `browser_evaluate` to read `getBoundingClientRect().height` (and width, if relevant) on the real elements once loaded — across a few different rows/records, not just one, since content length affects wrapping.
   - Stop the dev server and remove any `.playwright-mcp/` screenshot artifacts when done.
4. **Match structure, not just individual heights** — check the real markup's spacing (`gap-*` vs per-child margins like `mt-1`) and copy it exactly onto the skeleton's container; a spacing mismatch causes shift even when every individual placeholder height is correct.
5. **For content whose count can vary** (e.g. skill pills), reserve placeholders for the worst case the real render can produce, driven from the same shared constant the real component uses (see `TOP_SKILLS_LIMIT` in `src/pages/Alumni/lib/candidateSummary.ts`) — never a second, disconnected magic number.
6. **Accept and note residual gaps** for cases that can't be known before the data arrives: optional fields that are entirely omitted (not just empty) in the real render, and text that wraps to an extra line only for some records. A data-agnostic skeleton can't fully eliminate shift for every possible record — document the accepted gap rather than over-engineering the skeleton to chase it.
7. Re-measure after the fix to confirm the skeleton and loaded heights match, then run `pnpm lint` and `pnpm build` per the pre-delivery checklist.
