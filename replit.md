# Dad OS

A personal app for fathers to track quality time with their kids — child profiles, age-based guidance, weekly activity suggestions, and a memory journal.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/dad-os run dev` — run the frontend (port assigned by workflow)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, Fraunces + Inter fonts

## Where things live

- OpenAPI spec: `lib/api-spec/openapi.yaml`
- DB schema: `lib/db/src/schema/` (children.ts, activities.ts, memories.ts)
- API routes: `artifacts/api-server/src/routes/` (children, activities, memories, dashboard)
- Age guidance logic: `artifacts/api-server/src/lib/guidance.ts`
- Frontend: `artifacts/dad-os/src/`
- Theme: `artifacts/dad-os/src/index.css`

## Architecture decisions

- Age-based guidance is computed server-side from birthdate, not stored in DB — makes it always up-to-date
- Activities are per-child and can have an optional `weekOf` date for weekly planning
- Memories have optional mood, body text, and imageUrl for rich journaling
- Dashboard aggregates counts and recent memories in a single endpoint to minimize client requests
- Dates serialized to ISO strings at the API boundary for Zod compatibility

## Product

Dad OS lets dads manage profiles for each of their children, view age-appropriate developmental guidance and activity suggestions, plan weekly activities per child, and keep a memory journal of special moments. The dashboard gives a quick overview of all children with stats and recent memories.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any DB schema change, run `pnpm run typecheck:libs` to rebuild lib declarations before typechecking the API server
- Google Fonts `@import url(...)` must be the FIRST line of index.css — before `@import "tailwindcss"` — or PostCSS will fail silently

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
