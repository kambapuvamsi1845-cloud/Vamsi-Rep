# AgriCycle AI

An agricultural sustainability platform connecting farm production, water use, harvest timing, and fresh-produce sales.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/agricycle-ai run dev` — run the AgriCycle AI web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f lib/db/sql/schema.sql` — apply the idempotent development SQL schema
- Required env: `DATABASE_URL`, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL, accessed with the shared `pg` pool and parameterized SQL
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/agricycle-ai/` — React + Vite application
- `artifacts/api-server/src/routes/auth.ts` — registration, login, current-user, and logout endpoints
- `lib/api-spec/openapi.yaml` — API contract source of truth
- `lib/db/sql/schema.sql` — PostgreSQL schema source of truth

## Architecture decisions

- Authentication uses HttpOnly JWT cookies, not browser-readable bearer tokens.
- Authenticated sessions use the existing `SESSION_SECRET` workspace secret.
- Public registration is limited to farmers and consumers; admin accounts are provisioned separately.
- API database access uses the shared `pg` pool with parameterized SQL to keep the requested SQL schema authoritative.

## Product

AgriCycle AI is being built to align food demand, crop production, irrigation, harvest readiness, freshness, and local produce sales. The current foundation phase includes user registration, sign-in, and role-aware portals.

## User preferences

- Follow the attached AgriCycle AI brief's technology choices and implement the phases in order.

## Gotchas

- Regenerate API clients with codegen after every OpenAPI change.
- Keep the cookie path aligned with the `/api/auth` endpoints.
- Keep Express configured to trust one Replit proxy hop so IP-based rate limits see the originating client.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
