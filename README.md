# AgriCycle AI

AgriCycle AI is an agricultural sustainability platform intended to connect
farmer production planning, water use, harvest timing, and fresh-produce sales.
The current foundation phase provides PostgreSQL storage, role-based account
registration and login, and a React application with authenticated role portals.

## Workspace structure

```text
artifacts/
  agricycle-ai/       React + Vite application
  api-server/         Express API and authentication routes
lib/
  api-spec/           OpenAPI source contract
  api-client-react/   Generated React Query client
  api-zod/            Generated request and response schemas
  db/                 PostgreSQL connection pool
  db/sql/schema.sql   Idempotent PostgreSQL schema
```

## Run and operate

- `pnpm --filter @workspace/agricycle-ai run dev` — run the web application
- `pnpm --filter @workspace/api-server run dev` — run the Express API
- `pnpm --filter @workspace/agricycle-ai run typecheck` — check the frontend
- `pnpm --filter @workspace/api-server run typecheck` — check the API
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API clients and
  Zod schemas from `lib/api-spec/openapi.yaml`

The project uses its provisioned PostgreSQL database through `DATABASE_URL`.
The complete, idempotent development schema is in `lib/db/sql/schema.sql`. To
apply it with `psql`, run:

```sh
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f lib/db/sql/schema.sql
```

Set `SESSION_SECRET` in the workspace's secret manager. It is used only on the
server to sign seven-day JWT session cookies.

## Authentication foundation

- Registration supports `FARMER` and `CONSUMER` roles; admin accounts are not
  publicly self-registered.
- Passwords are hashed with bcrypt (10 rounds) and are never returned by the
  API.
- Sessions use a signed JWT stored in an HttpOnly, SameSite=Lax cookie.
- Login and registration are rate limited. The API validates request and
  response data against generated Zod schemas.
- `/api/auth/me` and `/api/auth/logout` require a valid session. The browser
  frontend only receives the public user identity and role.
