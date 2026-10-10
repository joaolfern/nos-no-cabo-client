# AGENTS.md

## Project

Nós no Cabo frontend: a webring of Brazilian tech projects. The backend is `../nos-sr` (Cloudflare Workers); API shapes come from the published `@nosnocabo/contract` package.

- **No auth.** The app has no login; with mocks on, every page works without a backend.
- **Ring routes:** `/ring/*` and `/r/*` on `nosnocabo.com.br` belong to the router Worker in nos-sr. The service worker's navigation denylist excludes them, and the SPA only sends them home if the router is bypassed.
- **Live endpoints:** `websites/status` and `websites/preview` must never be cached (`LIVE_ONLY_WEBSITE_PATHS` in `src/sw/sw.ts`).
- **Writes need Turnstile** (`src/api/turnstile.ts`); mocks use Cloudflare's test key.
- **Ring snapshot:** `pnpm deploy:web` first runs `snapshot:ring`, baking the top sites into `src/pages/LandingPage/data/ringSnapshot.json` so the landing page never waits on a request.
- **Themes:** light, dark and dimmed (`src/themes/`); dimmed unlocks after the visitor has used both light and dark.
- **Layouts:** `AppLayout` and `NosNoCaboLayout` (`variant='focused'` for form-like pages).
- **External state example:** `src/pages/Website/utils/voterStorage.ts` (`useSyncExternalStore` with a snapshot that is the data).
- **Docs:** architecture diagrams and ADRs in `docs/architecture/` (`pnpm docs:diagrams`), the docs site in `docs/site/` (`pnpm deploy:docs`). `docs/plans/form-rework.md` is a living status file: read it first when picking that work up.
- **Console noise** to ignore also includes Unicorn Studio errors.

<!-- kit:core -->
## Working rules

### Code clarity over comments

Prefer clean code over comments: intent goes into well-named variables, functions and components, small extracted helpers, and early returns. Code a beginner can read in a few lines beats a paragraph explaining it, and every comment costs tokens for agents too.

- Don't narrate what the code does, restate the obvious, or tell the story of a bug.
- Keep a comment only for a non-obvious *why* the code can't express (a browser or library quirk, a platform limit, a workaround), in one short line.
- Write code that reads like the surrounding code: match its naming, idiom and comment density.

### Testing discipline

- **Targeted tests only.** Never run the entire suite locally; run the tests for the files you changed. Leave full suites, E2E and visual regression to CI.
- **Fail fast.** If a test command hangs for more than 15 seconds, kill it and treat it as failed. Don't let runners idle.
- **No pre-builds** before testing; test runners compile on the fly.
- Prefer fast unit/DOM tests for logic and interactions. Tests live next to the code they test.
- **No orphaned processes.** Stop every dev server, browser or watcher you started; don't chain kill commands to clean up ports.

### Git safety

- Never run `git commit` or `git push` (or tag, rebase, or rewrite history) unless the user asks in this conversation. Save and format files and leave committing to the user.
- Commit messages, when asked for, follow Conventional Commits (`feat:`, `fix:`, `perf:`, `refactor:`, `docs:`, `test:`, `chore:`) with a short imperative subject.

### Docs

- `docs/architecture/decisions/` holds numbered ADRs for decisions with lasting consequences (use the `adr` skill or follow the existing format).
- `docs/plans/` holds plans for multi-session work. A plan in progress keeps a "Current status and next steps" section current, so a new session can pick it up.
- `docs/owner-todo.md` lists steps only the owner can do (accounts, DNS, secrets, publishing, commits). Add a task when work needs an owner step; tick it when the owner says it's done.
<!-- /kit:core -->

<!-- kit:js-tooling -->
## JS/TS tooling

- **Package manager:** `pnpm` only (there is a `pnpm-lock.yaml`); never `npm` or `yarn` to install. Dependencies with build scripts must be allowed in `pnpm-workspace.yaml` (`allowBuilds`).
- **Lint:** `pnpm lint` (oxlint, `.oxlintrc.json`, with `--fix` and `--deny-warnings`). It flags inline comments and warning-style comments (`todo`, `fix`, `add`…), and commented-out code, so they fail the lint.
- **Format:** Prettier (`.prettierrc`): no semicolons, single quotes (JSX too), trailing commas `es5`, 80 columns.
- **Hooks:** husky runs `lint-staged` (oxlint + Prettier) on commit and the test suite on push.
- **Naming:** `camelCase` for variables, functions and properties; `PascalCase` for components, classes and types.
<!-- /kit:js-tooling -->

<!-- kit:react-spa -->
## Stack: Vite + React 19 SPA

Vite + React 19 (React Compiler) + react-router 7 + TanStack Query + SCSS modules, with MSW mocks.

### Commands

- **Dev:** `pnpm dev`. With `VITE_ENABLE_MOCKS` not set to `false`, MSW serves mock data (`src/__mocks__`), so pages work without a backend.
- **Type-check + build:** `pnpm build` (`tsc -b && vite build`, TypeScript 7 native compiler) is the type-check step; it also type-checks the tests. There is no separate `typecheck` script.
- **Tests:** Vitest + React Testing Library + `user-event` (config in `vite.config.ts`, setup in `vitest.setup.ts`). Run one file: `pnpm exec vitest run <name>`.
- **Before calling a change done:** `pnpm lint` and `pnpm build`.

### Architecture: feature-based colocation

Code that changes together lives together.

- `src/components/`, `src/hooks/`, `src/utils/`, `src/constants/`, `src/contexts/` are **global**: only pieces that are generic and agnostic of business rules (`<Button/>`, `useDebounce`). Never put feature logic there.
- `src/pages/<Feature>/` is a **self-contained domain** owning its `components/`, `hooks/` and `utils/`. Removing a feature should mean deleting one folder. Example: `src/pages/Feed/`.
- `src/layouts/` holds page shells. `src/providers/` holds app-wide providers; `src/providers/RouterProvider/` holds the routes.
- Every page is `lazy()` in `lazyPages.tsx` and has its own skeleton as the route's `Suspense` fallback.
- Use the `@/` alias (maps to `src/`) for imports outside the current feature.
- Shared domain and API shapes live in `src/interfaces/` with the `I` prefix (`IItem`).

### Styling

- SCSS modules (`Component.module.scss`) with tokens in `src/styles/tokens/` (spacing, border, typography, breakpoints, shadow, animations, mixins): `@use '@/styles/tokens/spacing.scss' as *;` then `$spacing-md`, `$radius-md`, `@include has-motion { … }`.
- Theme colours are CSS variables set by `ThemeProvider` from `src/themes/light.ts` and `dark.ts`, typed in `src/interfaces/ITheme.ts`. To add one, add it to `ITheme.ts` and to **every** theme file; keep `index.html`'s pre-React theme script in sync with `themeModes.ts`.
- Use `clsx` with the module's `styles.*` for conditional classes (see `src/components/Button/Button.tsx`).
- Skeleton bones use the `bone-text` / `bone-block` mixins on the real component's classes (see `src/pages/Feed/components/FeedCard/FeedCardSkeleton.tsx`).
- Wrap every transition/animation in `@include has-motion`.

### Data

- TanStack Query for all server state; query hooks live in the feature's `hooks/` (`src/pages/Feed/hooks/useFeedWebsites.ts`).
- All requests go through the shared axios instance in `src/api/api.ts`; errors arrive as `IApiError` (`src/api/toApiError.ts`).
- Read env values through `src/config/env.ts`; never `import.meta.env` in feature code.
- Every new endpoint gets a matching MSW handler in `src/__mocks__/handlers.ts`, with data in `src/__mocks__/data/`, so the app keeps working with mocks.

### React Compiler

React Compiler (`babel-plugin-react-compiler`, via `reactCompilerPreset()` in `vite.config.ts`) is active, in Vitest too. Don't add `useMemo`/`useCallback` unless there's a verified need it can't handle.

- **Always destructure TanStack Query results**: `const { mutate: saveItem, isPending } = useSaveItem()`, never `const save = useSaveItem()` + `save.mutate()`. The result object is new every render (only `mutate`/`mutateAsync`/`refetch` are stable), so depending on it re-creates every function and child prop that uses it.
- **Declare helper functions before the code that uses them** (e.g. above a hook call whose inline callbacks call them). Functions used before their declaration are not memoized.
- **No `?.`, `??`, `&&` or ternaries inside a `try`/`catch`**: the compiler bails out of the whole component/hook. Move the expression into a small helper called from the `try`.
- **Don't read `ref.current` during render**, and don't return closures that read external mutable state (localStorage, module variables) without a reactive input: the compiler caches them. Expose such state through `useSyncExternalStore` with a snapshot that *is* the data.
- Wrap every `localStorage` access in `try`/`catch` (private mode and blocked storage throw).
<!-- /kit:react-spa -->

<!-- kit:ui -->
## UI

### Browser first

- Use the **Chrome DevTools MCP** to navigate, inspect the DOM, read computed styles and take screenshots in a live browser instead of guessing UI state. Prefer connecting to the already-running dev server; headless unless the user asks to watch.
- **Visual work needs screenshots.** For anything that "looks wrong", a redesign, CSS/flexbox/grid debugging or layout shift (CLS), capture the real rendered UI in every theme, at desktop and 375px width. JSDOM is blind to aesthetics.
- Ignore console noise unrelated to the change (network warnings, font preload races, third-party scripts, unrelated hydration warnings). Don't investigate it.

### Tokens and themes

- Components consume tokens; never hardcode hex or pixel values. Use the semantic colour roles (page `--color-background-100`, surface `--color-surface`, raised `--color-raised`, border `--color-border-400`, text `--color-text-base|muted|subtle`) over raw scales, so a theme can remap them.
- Light mode is flat (page, cards and inputs share one colour; borders separate). Dark mode separates by luminance (page < surface < raised) with low-contrast borders. Every theme is its own set of values; adding a colour means adding it to every theme.
- Shadows only on floating layers (dropdowns, popovers, toasts, dialogs). Floating layers are opaque.

### Composition

- Check the generic components before building a new control.
- **No nested cards.** Inside a surface, group with space, a divider or a step to `raised`; at most page → surface → raised.
- **No AI-template stat cards:** don't stack an uppercase letter-spaced label over a big number over a muted subtitle. One number (or visual) and one short description.
- **Few type styles per component:** one or two font sizes/weights. Don't add a size, weight, letter-spacing or uppercase just to label something; rewrite the text instead.
- **Forms:** never add `gap`/`row-gap` or vertical margins to the form or input wrapper containers; spacing comes from the field component.
- Neutral over alarming: red is for destructive or failed, not for low-key actions. One primary action per view.

### Stability

- Nothing moves after it appears: reserve space for counts (two digits), variable text (fixed lines), images (aspect ratio), messages under fields, and the header logo.
- Hide numbers until they load; never flash `0`.
- Skeletons mirror the loaded UI: what the client already knows (labels, headings, buttons) renders for real; only data-dependent parts become bones, built from the real component's styles. The swap must cause zero shift.
<!-- /kit:ui -->

<!-- kit:pwa -->
## PWA and service worker

- `vite-plugin-pwa` (injectManifest) builds `src/sw/sw.ts` to `/sw.js`: precache, an API GET cache (NetworkFirst with a 4s timeout), a font cache, the `SKIP_WAITING` update handshake and Web Push handlers. It has its own `tsconfig.sw.json` (WebWorker lib).
- Cache only GETs that may be briefly stale: add them to `CACHED_API_PATH`. Never cache live endpoints (status polls, previews) or non-GET requests.
- Paths another Worker answers on this domain go in the `NavigationRoute` denylist, or the SPA shell hides them.
- The service worker registers only when `VITE_ENABLE_MOCKS=false` (MSW owns the scope otherwise), so test it with `pnpm build && pnpm start`.
- Icons come from `pnpm pwa:icons` (`pwa-assets.config.ts`, source `public/logos/logo.svg`); re-run it after changing the logo.
- A new version waits until the user presses "Update" in the prompt (`ServiceWorkerUpdatePrompt`).
<!-- /kit:pwa -->

<!-- kit:cloudflare-spa -->
## Hosting: Cloudflare static assets

- The SPA is a static-assets Worker (`wrangler.jsonc`) on the custom domain `nosnocabo.com.br`, with `not_found_handling: single-page-application` so deep links load `index.html`.
- `pnpm deploy:web` builds with `.env.production` and runs `wrangler deploy`; `.github/workflows/deploy-web.yml` does the same on pushes to `main`. Everything in `.env.production` ends up in the public bundle: never put a secret there.
- Another Worker can own paths on the same domain with zone routes (`nosnocabo.com.br/r/*`); those run before the SPA's custom domain. Add such paths to the service worker's navigation denylist if the app is a PWA.
- Free-plan limits are real constraints (requests per day, subrequests, cron count): keep reads cacheable (`staleTime`, edge cache headers) and write the limit next to the constant that respects it.
<!-- /kit:cloudflare-spa -->

<!-- kit:react-spa.agents -->
## React profiling (for agents without the react-profiling skill)

Start a separate dev server with `REACT_DEVTOOLS_MCP=true pnpm exec vite --port 5175 --strictPort`; Chrome DevTools MCP then exposes React DevTools tools (`react_start_profiling`, `react_get_trace_overview`…) through `list_3p_developer_tools` / `execute_3p_developer_tool`. Trust per-commit `renderDuration` and the commit count; don't rank by `selfDuration` or `componentsChanged` (they include skipped fibers with stale durations).
<!-- /kit:react-spa.agents -->

<!-- kit:ui.agents -->
## UI review (for agents without the ui-craft skills)

Before calling UI work done: screenshot every theme at ≈1280px and 375px, loading and loaded. Check that cards are visibly separated in each theme (border in light, luminance in dark), there are no nested cards, ≤2 type styles per component, focus is visible, hover changes border colour rather than position, and the loading → loaded swap moves nothing (compare `getBoundingClientRect()` or a performance trace's CLS).
<!-- /kit:ui.agents -->
