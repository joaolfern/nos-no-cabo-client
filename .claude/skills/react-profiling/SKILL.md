---
name: react-profiling
description: Use when investigating React render performance in portal-cl — slow typing/interactions, components re-rendering too often, React Compiler bailouts, or comparing render cost between this branch and origin/main. Covers the react-devtools-cdt-mcp tools, a reliable "what re-rendered and which props changed" probe, and checking React Compiler output.
---

# React profiling

## Setup (opt-in)

- `react-devtools-cdt-mcp` is a **browser library**, not an MCP server. `vite.config.ts` has a serve-only plugin (`reactDevtoolsMcp`) that prepends `import 'react-devtools-cdt-mcp/register'` to `src/entry.client.tsx`. It must run before `react-dom` evaluates, so a `DEV`-guarded dynamic import does not work. It never reaches `pnpm build` output.
- The plugin only runs with `REACT_DEVTOOLS_MCP=true`. Its embedded backend conflicts with the standalone `react-devtools` app the user loads from `localhost:8097` (`src/root.tsx`), which then shows "Unsupported Bridge operation". Never enable it on the user's server. Start your own on a free port: `REACT_DEVTOOLS_MCP=true pnpm exec react-router dev --port 5175 --strictPort`, and check it with `curl -s localhost:5175/src/entry.client.tsx | grep cdt-mcp`.
- MCP: `chrome-devtools` must be `npx -y chrome-devtools-mcp@latest --headless=true --categoryExperimentalThirdParty=true`. MCP tools load at session start, so after changing the config the user has to `/mcp` → reconnect.

## Calling the tools

- **chrome-devtools MCP:** `list_3p_developer_tools`, then `execute_3p_developer_tool({toolName, params})`. For a whole measurement in one call, use `evaluate_script` with `window.__dtmcp.executeTool(name, params)`: start profiling, drive the interaction in the page, stop, and return only the summed `renderDuration`. To type into a controlled field from the page, set the value with `Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set` and dispatch a bubbling `input` event per character.
- **Playwright MCP fallback** (works without chrome-devtools): the page answers a synthetic discovery event. Inside `browser_run_code_unsafe`:
  ```js
  const call = (name, args = {}) => page.evaluate(async ([n, a]) => {
    let group = null
    const ev = new Event('devtoolstooldiscovery')
    ev.respondWith = (g) => { group = g }
    window.dispatchEvent(ev)
    return await group.tools.find((t) => t.name === n).execute(a)
  }, [name, args])
  ```
  Playwright's `filename` option only reads files under the repo, and those files trip `pnpm lint`. Delete any harness file you put there when you're done.

Tools: `react_start_profiling` / `react_stop_profiling` / `react_get_trace_overview` / `react_get_commit_report`, plus tree inspection (`react_find_components`, `react_get_component_by_uid` with `includeHooks`, `react_get_owner_stack`, `react_get_parent_stack`, `react_get_component_source`).

## Trust these numbers, not those

- **Trust:** `renderDuration` per commit from `react_get_trace_overview`, and the commit count. Sum them per interaction and compare runs.
- **Don't trust:** `componentsChanged` and the component list in `react_get_commit_report`. They include fibers React skipped, carrying **stale** durations from their last real render. A report can list `NavLink`/layout components on a keystroke that never re-rendered them. Don't rank bottlenecks by summed `selfDuration`.
- **To learn what actually re-rendered and why**, inject [`scripts/why-did-render.js`](scripts/why-did-render.js) with `page.evaluate`. It wraps `__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot` and counts only fibers that really rendered (the `PerformedWork` flag, props or state changed, subtree not reused), keyed by the **prop names whose identity changed**. Output like `SearchSidebar [onOpen,onDelete,onNew]: 5` over 5 keystrokes points straight at unstable callbacks.

## Finding the cause of an unstable prop

1. Compile the file and read the memo cache guards. [`scripts/compiler-check.cjs`](scripts/compiler-check.cjs) prints `CompileSuccess`/`CompileError` per function, or the compiled code with `--code`. Then `grep -nE '^\s+if \(\$'` the output: every `$[n] !== x` is a dependency.
2. Typical culprits (the rules live in `CLAUDE.md` → React Compiler):
   - a dependency on a whole `useMutation`/`useQuery` result (new object every render)
   - a function declared after its first use, which is never memoized (no `$[...]` guard)
   - a compiler bailout (no `_c(` at all in that function)

## Comparing against main

- Use a fresh `origin/main`, not local `main`: `git fetch origin main && git worktree add --detach ../portal-cl-main origin/main`, then `pnpm install`, copy `.env.local`, add the package (`pnpm add -D react-devtools-cdt-mcp`) and the same Vite plugin **uncommitted**, and run it on another port. Remove the worktree afterwards.
- Profile both in dev, warm each route once first (Vite compiles routes on first visit), and repeat each interaction at least 3 times. Single runs vary by 2× or more.
- The backend rate-limits (`429`). Once requests fail, data doesn't render and the numbers look falsely cheap. Check the console log and stop repeating when that happens.
- The React profiler can't see the initial mount (the tools register during it). Profile interactions and client-side navigations instead.
