# AGENTS.md

## Working rules

- **Never run scripts or commands.** This agent only writes and edits code. The user manually runs everything: dev/build/test, `drizzle:*`, seeding, `scripts/*.sh`, etc. State which command the user should run to verify your work.

## Stack

Express 5 + TypeScript. Drizzle ORM (PostgreSQL), PgBoss job queue, Stripe, Zod v4 + zod-to-openapi (Swagger UI at `/api-docs`, raw spec at `/api-docs.json`), Pino logging, S3. Dev runs via `tsx`; build = `tsc -b` + `tsc-alias`.

## Architecture

- Feature-based: each feature in `src/feature/<name>/` keeps `<name>.schema.ts` (Drizzle table), `<name>.types.ts` (drizzle-zod + `openapi()` decorators), `<name>.routes.ts` (Express `Router`), `controllers/` (async-handler wrapped), and `operations/` (DB queries).
- Feature routers are **hand-wired** into `src/routes/api.routes.ts` (started as an empty `Router()`). New features don't self-register — register them there (and add controllers under `src/feature/<name>/controllers/`).
- Bootstrap (`src/server.ts`): `initPgBoss()` runs before `app.listen`; graceful shutdown on SIGTERM/SIGINT. The drizzle migration call is currently commented out.
- Shared wiring lives in `src/middleware/index.ts` (CORS, body, cookies, `/health`, Swagger, logger, rate limiter [disabled], `app.use("/api", apiRouter)`, error handler).

## Conventions

- Import alias `@/*` → `./src/*` — resolved by `tsc-alias` (build) and `vite-tsconfig-paths` (tests). Use `@/` imports everywhere.
- Import sort order is enforced by `@ianvs/prettier-plugin-sort-imports` (`.prettierrc`): react/crypto/express → third-party → `@/` → `../` → `./`. The `^@ivyi/` group in that config is legacy — don't add imports to it.
- Env config is Zod-validated in `src/config/index.ts` and needs a local `.env` (already committed — don't touch). Requires a local Postgres; `scripts/setup-db.sh` creates `standout_db`/`standout_user`.

## Commands (run by the USER)

- `npm run dev` — concurrently runs the API (`dev:api`) and Stripe webhook listener. Note: `dev:ingress` references `./scripts/stripe-listen.sh`, which no longer exists — `scripts/stripe-dev.sh` is the replacement. Use `npm run dev:api` for the API alone.
- Build/run: `npm run build`, `npm run start` (`node dist/src/server.js`).
- Tests: `npm run test:unit`; `npm run test:integration` (controller tests, needs `.env.test`).
- DB: `npm run drizzle:generate|push|migrate|studio|drop|reset`, `npm run seed`, `npm run db:reset`. Migrations output to `apps/api/drizzle/` (created on first generate).
- Ops: `npm run pgboss:...` (`dashboard`, `clean`, `inspect`, etc.), `npm run places:search`, `npm run plans:backfill`.

## Gotchas

- Tests currently can't run: `src/tests/tests.unit.setup.ts` / `tests.integration.setup.ts` and `.env.test` don't exist, and there are no `*.test.ts` files yet. The `@ivyi/lib` alias in `vitest.config.ts` points to a nonexistent `packages/lib` — legacy, don't rely on it.
- Drizzle config (`drizzle.config.ts`) globs `src/feature/**/*.schema.ts` + `src/workflows/**/*.schema.ts` + `**/*.enums.ts`; seed globs `{src/feature,src/workflows}/**/*.seed.ts`.
- `scripts/generate-feature.sh` can scaffold a feature but carries Ivyi-era comments and incomplete wiring — when asked to add a feature, mirror the existing `feature/` files' pattern instead.
- Type-only shared configs (`@repo/typescript-config`, `@repo/eslint-config`) are not used by this app; it has its own `tsconfig.json` and `.prettierrc`.