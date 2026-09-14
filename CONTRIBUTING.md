# Contributing

Getting started, conventions, and verification for the Standout monorepo.

## Prerequisites

- **Node `>=24`** — `.nvmrc` pins `v24.16.0`; use `nvm use` (or `fnm use`) to match.
- **npm `11.13.0`** — npm workspaces monorepo; never `pnpm`/`yarn`.
- **PostgreSQL running locally** — the API needs a real Postgres. macOS: `brew services start postgresql`. Linux: `sudo systemctl start postgresql`.

## Getting started

Run everything from a terminal; commands are executed by you, the developer.

### 1. Install dependencies

From the repo root:

```sh
npm install
```

### 2. Create the database — do this first

The API requires a dedicated database and user. The setup script creates both and prints a ready-to-use `DATABASE_URL`:

```sh
./apps/api/scripts/setup-db.sh
```

By default it creates `standout_db` with user `standout_user` on `localhost:5432`. If it isn't already in `apps/api/.env`, add the printed value:

```env
DATABASE_URL="postgres://standout_user:<encoded-password>@localhost:5432/standout_db"
```

### 3. Set up the schema and seed data

From `apps/api/`:

```sh
npm run drizzle:push   # apply the Drizzle schema to the database
npm run seed           # run the global seed
```

Migrations are managed with `npm run drizzle:generate|migrate|studio` (see `apps/api/package.json`).

### 4. Run the apps

```sh
npm run dev    # repo root — starts apps/api and apps/web (turbo)
```

Useful singles:

```sh
npm run dev:api      # apps/api — API only (tsx + nodemon), port 3000
npm run dev          # apps/web — React Router dev server, port 5173
```

The API serves its OpenAPI spec at `http://localhost:3000/api-docs`.

## Verifying your work

| Check                                | Where              | Command                    |
| ------------------------------------ | ------------------ | -------------------------- |
| API build (type-checks too)          | `apps/api`         | `npm run build`            |
| Web typecheck (typegen + `tsc`)      | `apps/web`         | `npm run typecheck`        |
| Unit tests                           | `apps/api`         | `npm run test:unit`        |
| Integration tests (need `.env.test`) | `apps/api`         | `npm run test:integration` |
| Lint                                 | `packages/ui` only | `npm run lint` (root)      |
| Formatting                           | roots              | `npm run format` (root)    |

> The root `npm run lint` and `npm run check-types` only cover `packages/ui` — they won't validate the apps. API type safety is caught by `npm run build`; web by `npm run typecheck`.

## Conventions

- **Imports** — API code uses the `@/*` → `src/*` alias and follows the import-sort groups in `apps/api/.prettierrc` (react/crypto/express → third-party → `@/` → `../` → `./`). Web uses `~/*` → `app/*`.
- **Route modules** — web routes are declared in `app/routes.ts`, not by file naming; SSR is on.
- **Env secrets** — `apps/api/.env` is committed; never print, share, or commit its values. Local overrides go in gitignored env files (e.g. `.env.local`).
- **Features** — follow the `users` feature pattern documented in [`ARCHITECTURE.md`](./ARCHITECTURE.md). `scripts/generate-feature.sh` exists but is legacy-skewed; mirror existing feature files instead.
- **Releases** — there is no CI or pre-commit setup; run the relevant verification commands yourself before opening a pull request.

## For AI-assisted sessions

`AGENTS.md` files (root, `apps/api`, `apps/web`) instruct coding agents to **only write code and never run scripts or commands**. Agents will state the commands you need to run to verify their work — run them yourself rather than expecting the agent to execute them.
