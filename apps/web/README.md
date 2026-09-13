# apps/web — Standout Web

The React application for the Standout platform: a professional profile and career highlight platform. Part of the monorepo at the repo root.

## Stack

- React Router v8 in **Framework Mode** (SSR enabled)
- React 19, TypeScript
- Tailwind CSS v4 (via the `@tailwindcss/vite` plugin)
- Vite 8

## Commands

Run from `apps/web/` (or via `turbo` from the repo root). Dependencies are installed from the **repo root** (`npm install`) — this app is an npm workspace, not standalone.

| Command | What it does |
| --- | --- |
| `npm run dev` | React Router dev server with HMR — http://localhost:5173 |
| `npm run typecheck` | `react-router typegen && tsc` (typegen output `.react-router/types/` is required by `tsc`) |
| `npm run build` | `react-router build` — outputs to `build/` |
| `npm run start` | Serves the production build via `react-router-serve` |

## Project layout

- `app/root.tsx` — root layout (`ErrorBoundary`, HTML shell).
- `app/routes.ts` — config-driven route table (not file-system routing).
- `app/routes/` — route modules (loaders, actions, `+types`).
- `app/app.css` — global styles (Tailwind).

## Notes

- The `Dockerfile` in this directory predates the monorepo setup and will not build as-is (it expects a standalone package — don't rely on it).
- For routing APIs, see the bundled skill at `.agents/skills/react-router/` and the installed docs in `node_modules/react-router/docs/`.

## Documentation

See repo-root [`README.md`](../../README.md), [`ARCHITECTURE.md`](../../ARCHITECTURE.md), and [`CONTRIBUTING.md`](../../CONTRIBUTING.md).