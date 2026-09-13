# Architecture

How the Standout platform is structured, how the apps are wired, and how a feature is written. The `users` feature under `apps/api/src/feature/users/` is the canonical reference — follow it when adding new features.

## Monorepo layout

Turborepo over npm workspaces (`apps/*`, `packages/*`), driven by `turbo.json` and the root `package.json`.

```
apps/
  api/      Express 5 REST API (business logic lives here)
  web/      React Router v8 app (framework mode, SSR)
packages/
  ui/                 @repo/ui React components (not yet used)
  eslint-config/      shared ESLint flat configs
  typescript-config/  shared tsconfig bases (ES2022)
```

`apps/api` and `apps/web` do **not** share code today (`@repo/*` packages are unused by them), and each has its own aliases and configs:

| | `apps/api` | `apps/web` |
| --- | --- | --- |
| Alias | `@/*` → `src/*` | `~/*` → `app/*` |
| Formatter | own `.prettierrc` (import sort) | none |
| Typecheck | none (`build` = `tsc -b`) | `npm run typecheck` (typegen + `tsc`) |
| Lint | none | none |

## apps/api — the Express application

### Runtime and build

- Dev runs via `tsx` (`npm run dev:api`); concurrently `npm run dev` also starts a Stripe webhook listener.
- Build is `tsc -b && tsc-alias` — the `tsc` composite project emits to `dist/`, then `tsc-alias` rewrites `@/*` imports. `npm run start` runs `node dist/src/server.js`.

### Bootstrap (`src/server.ts`)

Initializes PgBoss (queues + workers) **before** `app.listen`, then registers graceful shutdown on `SIGTERM`/`SIGINT`. The Drizzle `runMigrations()` call is currently commented out — schema is rolled out with `npm run drizzle:push` instead.

### Configuration (`src/config/`)

All config is Zod-parsed at startup from `process.env` in `src/config/index.ts` (`serverConfig`, `dbConfig`, `authConfig`, `cookieConfig`, `infraConfig`, `alertsConfig`). The API needs a local `.env` and a PostgreSQL `DATABASE_URL`; `scripts/setup-db.sh` creates the DB and prints a working connection string.

### Middleware pipeline (`src/middleware/index.ts`)

`initializeMiddlewares(app)` assembles the app in order: CORS → JSON body (50mb) → urlencoded → cookie-parser → static → `/health` + `/` → Swagger `/api-docs` + raw spec `/api-docs.json` → request metadata/logger → rate limiter (disabled) → `app.use("/api", apiRouter)` → global error handler (`/api` routers are mounted in the **routes** layer, not here).

### Routing and feature manifests (`src/routes/`)

- Features declare an `ApiManifest` (`{ path, router, isPrivate?, middlewares? }`) — see `users.routes.ts` exporting `usersApi = { path: "/v1/users", router }`.
- `src/routes/api.access.ts` provides `useApiRouters(router, manifests)` to mount manifests onto a `Router`, plus helpers for auth (`useAuthentication`), role rules (`useAuthorization`), and rate limits (`useRateLimit`). Private manifests get `authenticateToken` automatically.
- `src/routes/api.routes.ts` currently exports an empty `apiRouter`; wiring manifests through `useApiRouters` into it (and expanding the OpenAPI registry — below) is part of the current work-in-progress.

### Database layer (`src/lib/drizzle/`)

- A single `pg.Pool` + Drizzle instance (`src/lib/drizzle/index.ts`) exposes `db`. **Every feature's tables must be merged into its `schema:` object** (today: `...#...combinedProfileSchema, ...combinedUsersSchema`).
- Query results are returned as `DbResult<T>` through helpers like `executeSingle` (`drizzle.types.ts`, `results/`). Controllers unwrap them with `unwrap(result, new HttpError(...))` from `drizzle.utils.ts`.
- Drizzle config globs schemas from `src/feature/**/*.schema.ts` and `src/workflows/**/*.schema.ts` (+ `*.enums.ts`); migrations output to `apps/api/drizzle/`. Global seed (`npm run seed`) runs migrations then executes `*.seed.ts` files found under `feature`/`workflows`.

### OpenAPI documentation (`src/lib/openapi/`)

Schemas are written once in Zod and turned into an OpenAPI spec by `zod-to-openapi`. Each feature keeps its own `OpenAPIRegistry` (`*.docs.ts`) registering resource schemas + path definitions. **New registries must be added to the `registries` array in `src/lib/openapi/index.ts`** to appear in `/api-docs`.

### Job queue (PgBoss)

`src/server.ts` initializes PgBoss with a dead-letter queue before serving traffic. Feature job contracts can be declared in `feature/<name>/<name>.config.ts` (e.g. `UserJobs.UserCreated`). Ops scripts live under `npm run pgboss:*`.

## apps/web — the React application

React Router v8 in **Framework Mode** (SSR on), Vite 8 and Tailwind CSS v4 via the `@tailwindcss/vite` plugin.

- Routes are **config-driven** in `app/routes.ts` (an array of route objects) — not the file-system convention. Today it only registers `index → routes/home.tsx`.
- Route modules can export `loader`/`action`/`ErrorBoundary`/`meta` and import generated types from `./+types/...`.
- `npm run typecheck` runs `react-router typegen` (writes `.react-router/types/`, gitignored) then `tsc`; the typegen output is required for `tsc` to pass.
- See `apps/web/.agents/skills/react-router/` for the React Router skill (framework-mode reference) and `node_modules/react-router/docs/` for the installed version's docs.

## Writing a feature (reference: `users`)

A feature lives in `apps/api/src/feature/<feature>/` and is built from these pieces:

| File | Responsibility |
| --- | --- |
| `<feature>.schema.ts` | Drizzle `pgTable`/`pgEnum` definitions. Export a combined object (e.g. `combinedUsersSchema`) to merge into `drizzle/index.ts`. |
| `<feature>.types.ts` | `createInsertSchema`/`createSelectSchema` (drizzle-zod) with `.openapi()` decorators, `z.infer` types, and `openapi()`-decorated request/response models. |
| `<feature>.config.ts` | Serializer config (`JsonApiResourceConfig`) used by responses, plus job names/contracts. |
| `<feature>.routes.ts` | Express `Router` with per-route validation via `validateHttpRequest(schema, HttpLocation.X)`; exports the `ApiManifest`. |
| `controllers/` | Thin async-handler controllers: parse params, call operations, `unwrap()` not-found, reply with `sendSuccessResponse()`/`sendErrorResponse()` (gives JSON:API-shaped responses). |
| `operations/` | Pure Drizzle queries returning `DbResult<T>` (e.g. `findUser` over `db.query.usersSchema.findFirst`). Keep DB access here, not in controllers. |
| `<feature>.docs.ts` | `OpenAPIRegistry`: `defineApiResource` + `registerJsonApiSchemas` for the resource, `registerRoutes` for each path. |

Request flow: route (`validateHttpRequest` puts parsed data on `req.validated`) → controller → operation → `DbResult` → `unwrap` → `sendSuccessResponse`.

To ship a new feature, wire these three seams by hand:

1. **Routes** — mount the manifest: `useApiRouters(apiRouter, [usersApi, myApi])` in the routes layer (`api.access.ts`/`api.routes.ts`).
2. **Schema** — add `...combinedMySchema` to the Drizzle `schema` object in `src/lib/drizzle/index.ts`.
3. **Docs** — add the feature `registry` to the `registries` array in `src/lib/openapi/index.ts`.

## Conventions

- `@/` imports everywhere in the API; import order is enforced by `@ianvs/prettier-plugin-sort-imports` in `apps/api/.prettierrc` (react/crypto/express → third-party → `@/` → `../` → `./`).
- Controllers stay thin; DB queries live in `operations/`; schemas are owned in one place (Drizzle) and reused for validation + OpenAPI.
- Tests: unit tests `*.test.ts`, controller/integration tests `*.controller.test.ts` (see `vitest.config.ts` / `vitest.integration.config.ts`).
- Legacy "Ivyi" naming in a few spots (`@ivyi/lib` vitest alias, `setup-test-db.sh`) is a leftover from an earlier product — don't extend it.