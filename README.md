# Acme Ops

The internal console our support and operations team lives in. It lists every
tenant on the platform, who belongs to them, what they have been doing, and lets
an operator make small corrections without asking an engineer.

| | | |
|---|---|---|
| `api/` | Express + TypeScript, talks to Postgres with `pg` | http://localhost:4000 |
| `web/` | Next.js App Router, server components, Tailwind + shadcn | http://localhost:3000 |

The browser never talks to the API directly. `web` calls it server-side and
forwards the operator's role, so exactly one place decides what identity a
request carries.

## Getting started

You need **Node 20.12+** and **Docker**.

```bash
cp .env.example .env
docker compose up -d      # Postgres on port 5433
npm install
npm run setup             # migrations, then seed (under a minute)
npm run dev               # api and web together
```

Open http://localhost:3000. If something fails it is almost always that Postgres
has not finished starting; run `docker compose up -d` then `npm run setup`
again.

The seed is deterministic: 200 organizations, ~5,900 members, ~300,000 activity
events. That size is on purpose, because the console behaves quite differently
against realistic volumes than against a handful of demo rows. **Northwind
Trading Co.** is the flagship tenant and by far the largest.

## Scripts

Run these from the repository root.

| Command | Does |
|---|---|
| `npm run dev` | API and web together, both watching |
| `npm run dev:api` / `npm run dev:web` | One at a time |
| `npm run setup` | Migrate, then seed |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:seed` | Re-seed (truncates first) |
| `npm run db:reset` | Drop everything, migrate, seed |
| `npm run test` | API test suite |
| `npm run typecheck` | Both workspaces |
| `npm run build` | Production build of the web app |

## How the code is laid out

```
api/                              web/
  app.ts    express, routing        app/            routes, layouts, actions
  index.ts  server entry            components/ui/  shadcn primitives
  db/       pool, migrations, seed  components/app/ product-specific
  lib/      auth, http, csv, env    lib/            API client, session,
  queries/  SQL more than one route                 types, formatting
  routes/   one file per resource
  legacy/   older code
  tests/
```

### Conventions worth matching

- **Queries are parameterised, always.** `query()` and `queryOne()` in
  `api/db/index.ts` are the way in. Anything more than one route needs goes in
  `api/queries/`.
- **Handlers throw, they do not build error responses.** Throw `HttpError` and
  the middleware in `api/lib/http.ts` turns it into JSON. Express 5 forwards
  rejected promises for you.
- **Filters are validated, not trusted.** `parseEnum` returns a 400 on an
  unknown value rather than quietly returning everything.
- **The API is the security boundary.** The web app decides what to *show*, the
  API decides what is *allowed*. See `requireRole` in `api/lib/auth.ts`.
- **Pages are server components** unless they need state or an event handler.
  Filters are plain GET forms, so they survive a reload and can be shared.
- **Styling goes through the material system** in `web/app/globals.css`:
  `surface-raised` for controls, `surface-well` for inputs and readouts, flush
  rows for tables. Add shadcn components with `npx shadcn@latest add ...` from
  `web/` and they pick up the theme.

### Signing in

There is no SSO locally. Three fixture accounts are seeded, one per role, all
sharing the password `ops`:

| Email | Role | Can |
|---|---|---|
| `dana.okafor@acme.test` | Owner | Everything, including billing |
| `priya.raman@acme.test` | Admin | Manage members and keys |
| `sam.ellery@acme.test` | Member | Read only |

Sign in as each to see how the console behaves per role. The session is a cookie
holding the operator's email; the web app resolves it and forwards the role to
the API as `x-acme-role`. Sign out from the menu in the top right.

Set `DEBUG_SQL=1` in `.env` to log every statement the API runs, with timings.

## Tests

`npm run test` runs the API suite. The unit tests need nothing; the integration
tests talk to Postgres, so start it and seed first. There is deliberately not
much coverage. Add tests where they earn their place.

## Your task

See [TICKETS.md](./TICKETS.md) for the work and record your thinking in
[DECISIONS.md](./DECISIONS.md).

**Keep it small.** We would much rather see good judgment on a couple of tickets
than everything half-finished. Stop when you have something you can stand behind
and explain, and write down what you would have done next.

**Use AI.** Claude, Cursor, Copilot, whatever you like. We do, all day, and the
scope assumes it. Tell us in `DECISIONS.md` how you directed the tools and where
you overruled them. This is genuinely not a trap.

**Hand back** a branch with a commit per ticket and a short PR-style description
for each, `DECISIONS.md` filled in, and anything that does not work said plainly.
We would rather read an honest "this is broken and here is why" than discover it
ourselves. We will book a session afterwards to go through what you built and
extend it together, so bring your reasoning rather than just the diff.
