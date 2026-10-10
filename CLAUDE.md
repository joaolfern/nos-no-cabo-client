# CLAUDE.md

Project notes and shared rules are in AGENTS.md (imported below). This file adds what is specific to Claude Code.

<!-- kit:import -->
Shared rules for every agent live in AGENTS.md:

@AGENTS.md
<!-- /kit:import -->

<!-- kit:core.claude -->
## Claude Code

- Skills from agent-kit load on demand; prefer them over improvising: `adr` and `release-notes` (core), plus the stack skills listed in the sections below.
- When a session uncovers a rule worth keeping for every project (a convention, a gotcha, a taste call the user corrected), offer to record it with `/kit:learn` instead of only fixing it here.
<!-- /kit:core.claude -->

<!-- kit:react-spa.claude -->
## React skills

- `react-profiling` to investigate slow interactions, re-renders or React Compiler bailouts. It drives React DevTools through the Chrome DevTools MCP (`REACT_DEVTOOLS_MCP=true pnpm exec vite --port 5175 --strictPort` loads the dev-only hook; the skill shows how to add the Vite plugin if the project lacks it).
<!-- /kit:react-spa.claude -->

<!-- kit:ui.claude -->
## UI skills

- `ui-craft` before building or restyling any screen or component (surfaces, nesting, anti-AI patterns, type, interaction, layout stability). For a brand-new aesthetic direction, `frontend-design` first, then `ui-craft` to execute it.
- `loading-skeletons` whenever a placeholder stands in for loading content.
- `ui-review` before calling UI work done, or when the user says something looks off.
<!-- /kit:ui.claude -->
