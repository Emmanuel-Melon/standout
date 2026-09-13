# Standout

A professional profile and career highlight platform. Contributors build a REST API and an SSR web app in a single Turborepo + npm workspaces monorepo.

## Projects

| Path | Description |
| --- | --- |
| `apps/api` | Express 5 + TypeScript REST API. Drizzle ORM (PostgreSQL), PgBoss job queue, Stripe, Zod v4 + zod-to-openapi. Swagger UI at `/api-docs`. |
| `apps/web` | React Router v8 (Framework Mode, SSR) + React 19, Tailwind CSS v4, Vite. |
| `packages/ui` | `@repo/ui` React components (not yet imported by any app). |
| `packages/eslint-config` | Shared ESLint flat configs. |
| `packages/typescript-config` | Shared TypeScript configs (ES2022 base). |

## Documentation

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — how the apps are structured, how the API is wired, and how to write a feature (the `users` feature is the reference).
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — prerequisites and getting started. First step: create a local PostgreSQL database with `apps/api/scripts/setup-db.sh`.

## Requirements

- Node `>=24` (`.nvmrc` pins `v24.16.0`), npm `11.13.0`.
- A running local PostgreSQL server for `apps/api`.

## Common commands

Run from the repo root unless noted. Each app also has its own scripts — see `apps/api/package.json` and `apps/web/package.json`.

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts `apps/api` and `apps/web` dev servers (turbo). |
| `npm run build` | Builds all apps (turbo). |
| `npm run format` | Runs Prettier over `**/*.{ts,tsx,md}`. |
| `npm run lint` | Turbo lint — only covers `packages/ui`. `apps/api` and `apps/web` have no lint script. |
| `npm run check-types` | Turbo typecheck — only covers `packages/ui` too. Use `npm run typecheck` in `apps/web`; `apps/api` type-checks via `npm run build` (`tsc -b`). |

> Lint/typecheck are **not** repo-wide. Don't run the root commands to validate the apps.

## Contributors

* [Emmanuel Gatwech (Eman)](https://github.com/Emmanuel-Melon)
* [Ikwunze Kelvin (Kl3va)](https://github.com/Kl3va)