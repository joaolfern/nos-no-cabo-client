# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Nós no Cabo frontend (Vite + React 19 + react-router 7 + TanStack Query + SCSS modules).

# Optimized Testing & Browser Rules
You are encouraged to test your changes, but you must do so efficiently to save time and avoid "rabbit holes." Strictly adhere to these boundaries:

1. **Chrome DevTools MCP First:** You have access to the Chrome DevTools MCP. Use it to navigate, inspect the DOM, and visually verify changes in a live browser session instead of guessing UI state.
2. **Connect & Headless Defaults:** When using the Chrome DevTools MCP, prefer connecting to an already-running local dev server browser rather than spawning a new instance. Unless asked to show the UI, default to headless mode to avoid disruptive pop-ups.
3. **No Auth, Mocked API:** The app has no authentication. With `VITE_ENABLE_MOCKS` not set to `false`, MSW serves mock data (`src/__mocks__`), so pages work in the browser without a backend.
4. **Ignore Harmless Console Noise:** When using the browser MCP, strictly ignore network warnings, font preload race conditions, third-party script errors (e.g. Unicorn Studio), or hydration warnings unrelated to your specific code changes. Do not investigate them.
5. **No Orphaned Processes:** Do not string together massive bash commands to clean up browser ports (e.g., `pgrep | kill`). Ensure your MCP or test runner tears down its own environment cleanly.
6. **EXCEPTION FOR VISUALS, REDESIGNS & CLS:** JSDOM is blind to aesthetics. If the task involves fixing an "ugly" component, doing a redesign, debugging CSS/flexbox/grid, fixing Cumulative Layout Shift (CLS), or if I simply ask you to figure out what looks wrong ("idk"), you **must** use the Chrome DevTools MCP to capture screenshots and inspect the real rendered UI. Use the browser to see what a human sees.
7. **Targeted Tests ONLY:** NEVER run the entire test suite. Only execute tests for the specific file you just modified (e.g., `npx jest --config jest.config.cjs FeedTopbar`).
8. **Prefer JSDOM/Node environments:** For pure logic, state, and standard DOM interactions, use Jest with React Testing Library. These run in milliseconds.
9. **Restrict Headless Browsers:** If you MUST run an automated end-to-end test, only run the specific spec related to the change. Never run a global E2E or visual regression command locally — leave full suites to CI.
10. **No Pre-builds:** Do NOT run `npm run build` before testing. Rely on the test runner to compile files on the fly (ts-jest).
11. **Fail-Fast:** If a test command hangs for more than 15 seconds, kill the process immediately and assume it failed. Do not let test runners idle.

## Commands

- **Package manager:** `npm` (there is a `package-lock.json`). Never use `pnpm` or `yarn`.
- **Dev:** `npm run dev` (Vite).
- **Build:** `npm run build` (`tsc -b && vite build`) is the type-check step; there's no separate `typecheck` script.
- **Lint:** `npm run lint` (ESLint with `--fix` and `--max-warnings 0`).
- **Format:** `npm run format` (Prettier over `src/`: no semicolons, single quotes, 80 columns).
- **Tests:** Jest (`jest.config.cjs`). `npm test` runs the whole suite, so per the testing rules above run `npx jest --config jest.config.cjs <name>` for the file you changed.

### Pre-delivery checklist

Before considering a change done, run `npm run lint` and `npm run build`.

## Architecture: feature-based colocation

The codebase follows a **feature-based / colocation** model: code that changes together lives together.

- `src/components/`, `src/hooks/`, `src/utils/`, `src/constants/`, `src/contexts/` are **global scope** — restricted to pieces that are strictly generic and agnostic of business rules (e.g. `<Button/>`, `useDebounce`). Never put feature-specific logic here.
- `src/pages/<Feature>/` is a **self-contained domain**: a feature owns its own `components/`, `hooks/` and `utils/` inside its own folder. When maintaining or removing a feature, you should only need to touch that one folder. Example: `src/pages/Feed/`.
- `src/layouts/` holds page shells (e.g. `AppLayout`, `NosNoCaboLayout`) and their own sub-components.
- Use the `@/` alias (maps to `src/`) for imports outside the current feature.

## Naming conventions

- Variables, methods, and properties: `camelCase`.
- Components, classes, and types: `PascalCase`.
- Shared domain and API shapes live in `src/interfaces/` with the `I` prefix (e.g. `IWebsite`). Follow that convention for new shared interfaces.

## Styling & design tokens

Styling is **SCSS modules** (`Component.module.scss`), with two token layers:

- **SCSS tokens** in `src/styles/tokens/` (spacing, border, typography, breakpoints, animations, mixins). Import them with `@use '@/styles/tokens/spacing.scss' as *;` and use `$spacing-xs`, `$radius-full`, `@include has-motion`, etc.
- **Theme colors** as CSS variables (e.g. `var(--color-text-base)`, `var(--color-background-300)`), defined per theme in `src/themes/light.ts` and `src/themes/dark.ts` and typed in `src/interfaces/ITheme.ts`. To add a variable, add it to `ITheme.ts` and to **both** theme files.

Components must consume tokens, never hardcode arbitrary hex/pixel values. Prefer the semantic color variables (`--color-text-*`, `--color-background-*`, `--color-border-*`) over raw scale ones (`--color-neutral-*`) so a theme can remap them without touching component code.

## Component patterns

- Always check `src/components/` before building a new UI input/control from scratch.
- Use `clsx` for conditional classes together with the module's `styles.*` (see `src/components/Button/Button.tsx`).
- Data fetching uses TanStack Query; keep query hooks in the feature's `hooks/` (see `src/pages/Feed/hooks/`).
- Tests live next to the code (`Feed.test.tsx`) and use React Testing Library with `user-event`.

## Code clarity over comments

Prefer applying clean code concepts instead of comments: express intent through well-named variables, functions and components, small extracted helpers, and early returns. Code a beginner can read in a few lines beats a paragraph explaining it, and every comment costs tokens for AI agents too. ESLint already flags inline comments and `todo`/`fix`-style warning comments.

- Don't narrate what the code does, restate the obvious, or tell the story of a bug.
- Keep a comment only for a non-obvious *why* the code can't express (a browser/library quirk, a workaround). Keep it to one short line.

## API & data layer

- Use the shared axios instance from `src/api/api.ts` for all requests.
- Read env values through `src/config/env.ts`; don't use `import.meta.env` directly in feature code.
- When adding an endpoint, add a matching MSW handler in `src/__mocks__/handlers.ts` (with data in `src/__mocks__/data/`) so the app keeps working with `VITE_ENABLE_MOCKS`.

## Git safety

Do **not** run `git commit` or `git push` automatically — save/format files and leave commit execution to the user. Husky runs `lint-staged` (ESLint + Prettier) on commit.

# UI & Form Styling Constraints
- **No Form-Level Vertical Spacing:** NEVER add `gap`/`row-gap` or vertical margins to the `<Form>` component or to input wrapper containers.
- **No AI-template stat cards:** Don't stack an uppercase letter-spaced label over a big number over a muted subtitle — the "eyebrow + number + description" pattern AI agents default to. Its label and subtitle usually restate each other. Give each metric or item one number (or visual) and one short description, and stop there.
- **Few type styles per component:** Keep a component to one or two font sizes/weights. Don't introduce an extra size, weight, letter-spacing or text-transform just to label something; if a piece of text needs a label to be understood, rewrite the text instead.
