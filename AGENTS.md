# AGENTS.md

## Working rules

- **Never run scripts or commands.** This agent only writes and edits code. The user manually executes all shell commands, npm scripts, tests, lint/typecheck, DB migrations, seeding, and `scripts/*.sh` files. Never invoke tools to run them; instead, state in your response which command the user should run to verify your work.

## Repo layout

Turborepo + npm workspaces monorepo (npm — not pnpm/yarn). Node `>=24` (`.nvmrc` pins v24.16.0), npm 11.13.0.

- `apps/api` — Express 5 + TypeScript, Drizzle ORM (PostgreSQL), PgBoss job queue, Stripe, Zod v4 + zod-to-openapi. See `apps/api/AGENTS.md`.
- `apps/web` — React Router v8 (Framework Mode, SSR) + React 19, Tailwind CSS v4, Vite. See `apps/web/AGENTS.md`.
- `packages/ui` — `@repo/ui` React components (not yet imported by any app).
- `packages/eslint-config`, `packages/typescript-config` — shared configs (TypeScript 7 / ES2022 base).

## Commands (run by the USER, not the agent)

- Root: `npm run dev`, `npm run build`, `npm run lint`, `npm run format`, `npm run check-types` — all turbo-orchestrated.
- **`npm run lint` and `npm run check-types` are NOT repo-wide.** Turbo only runs packages that declare those scripts — today that is just `packages/ui`. `apps/web` verifies via `typecheck`; `apps/api` has neither (`build` runs `tsc -b`). Don't claim these commands validate the apps.

## Gotchas

- `README.md` (root), `ARCHITECTURE.md`, and `CONTRIBUTING.md` are maintained project docs describing the current state — trust code and configs if they ever conflict, and update them when they become stale.
- `turbo.json` build outputs reference Next.js (`.next/**`) — stale from the starter; neither app uses Next.js.
- `apps/api/.env` is committed to git. Never read or modify it (contains secrets); never commit secrets.
- Legacy "Ivyi" naming survives in a few spots (the `@ivyi/lib` alias in `apps/api/vitest.config.ts`, the `^@ivyi/` group in `apps/api/.prettierrc`, `apps/api/scripts/setup-test-db.sh`). Leftovers from an earlier product — don't extend them.
- No root `tsconfig.json`, no root ESLint/Prettier config, no CI, no pre-commit hooks, no `opencode.json`.
