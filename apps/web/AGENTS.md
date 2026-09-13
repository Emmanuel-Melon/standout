# AGENTS.md

## Working rules

- **Never run scripts or commands.** This agent only writes and edits code. The user manually runs `typecheck`, `build`, `dev`, `start`, etc. State which command the user should run to verify your work.

## Stack

React Router v8 in **Framework Mode** (SSR enabled), React 19, Tailwind CSS v4 (via `@tailwindcss/vite`), Vite 8. TypeScript via `react-router typegen` + `tsc`.

## Architecture

- Routes are **config-driven via `app/routes.ts`** (array of route objects) — NOT React Router's file-system routing convention. Currently only `index → routes/home.tsx` (stock starter page).
- Route modules may export `loader`, `action`, `ErrorBoundary`, `meta`, etc., and import generated types from `./+types/...`. See the route skill for the patterns to use.
- Import alias `~/*` → `./app/*`; root layout is `app/root.tsx`.
- When working on routing/loaders/actions, load the bundled skill at `apps/web/.agents/skills/react-router/SKILL.md` and its `references/framework-mode.md`, then read the installed docs under `node_modules/react-router/docs/`.

## Commands (run by the USER)

- `npm run dev` — React Router dev server (default port 5173).
- `npm run typecheck` — runs `react-router typegen && tsc`. Typegen writes `.react-router/types/` (gitignored) and must run before `tsc` passes.
- `npm run build` — `react-router build` (output to `build/`).
- `npm run start` — serves `build/server/index.js` via `react-router-serve`.

## Gotchas

- **`typecheck` is the verification command for this app.** The root turbo `check-types` (via `npm run check-types`) does NOT cover `apps/web` — it only runs in `packages/ui`.
- No lint script exists in this app.
- `Dockerfile` is stale/broken for the monorepo: it expects `package.json` + `package-lock.json` inside `apps/web/`, but the lockfile lives at the repo root, and the build context misses workspace packages. Don't rely on or extend it.
- `.react-router/` typegen output is gitignored — regenerate it via `typecheck` after adding/changing routes.
- `README.md` in `apps/web/` describes this app; `typecheck` (not `turbo check-types`) is the way to verify changes here.