# Acme Ops

The internal console our support and operations team lives in. It lists every
tenant on the platform, who belongs to them, what they have been doing, and lets
an operator make small corrections without asking an engineer.

Two services in one repository:

| | | |
|---|---|---|
| `api/` | Express + TypeScript, talks to Postgres with `pg` | http://localhost:4000 |
| `web/` | Next.js App Router, server components, Tailwind + shadcn | http://localhost:3000 |

The browser never talks to the API directly. `web` calls it server-side and
forwards the operator's role, so there is exactly one place that decides what
identity a request carries.

## Getting started

You need **Node 20.12+** and **Docker**.

```bash
cp .env.example .env
docker compose up -d      # Postgres on port 5433
npm install
npm run setup             # migrations, then seed (takes under a minute)
npm run dev               # api and web together
```

Then open http://localhost:3000. If something fails, it is almost always that
Postgres has not finished starting; `docker compose up -d` then `npm run setup`
again will sort it.

The seed is deterministic: 200 organizations, ~5,900 members and ~300,000
activity events. It is that size on purpose, because the console behaves quite
differently against realistic volumes than against a handful of demo rows.

**Northwind Trading Co.** is the flagship tenant and by far the largest.

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
api/
  app.ts            express app, route mounting
  index.ts          server entry
  db/               pool, query helper, migrations, seed
  lib/              auth, http helpers, csv, env
  queries/          SQL that more than one route needs
  routes/           one file per resource
  legacy/           older code, see below
  tests/
web/
  app/              routes, layouts, server actions
  components/ui/    shadcn primitives, restyled
  components/app/   things specific to this product
  lib/              API client, session, types, formatting
```

### Conventions worth matching

- **Queries are parameterised, always.** `query()` and `queryOne()` in
  `api/db/index.ts` are the way in. Anything more than one route needs goes in
  `api/queries/`.
- **Handlers throw, they do not build error responses.** Throw `HttpError` and
  the error middleware in `api/lib/http.ts` turns it into JSON. Express 5
  forwards rejected promises for you.
- **Filters are validated, not trusted.** `parseEnum` 400s on an unknown value
  rather than quietly returning everything.
- **The API is the security boundary.** The web app decides what to *show*;
  the API decides what is *allowed*. See `requireRole` in `api/lib/auth.ts`.
- **Pages are server components** unless they need state or an event handler.
  Filters are plain GET forms so they survive a reload and can be shared.
- **Styling goes through the material system** in `web/app/globals.css`:
  `surface-raised` for controls, `surface-well` for inputs and readouts, flush
  rows for tables. Add more shadcn components with `npx shadcn@latest add ...`
  from `web/` and they will pick up the theme.

### Signing in

There is no SSO locally. Three fixture accounts are seeded, one per role, and
all three share the password `ops`:

| Email | Role | Can |
|---|---|---|
| `dana.okafor@acme.test` | Owner | Everything, including billing |
| `priya.raman@acme.test` | Admin | Manage members and keys |
| `sam.ellery@acme.test` | Member | Read only |

Sign in as different accounts to see how the console behaves for each role. The
session is a cookie holding the operator's email; the web app resolves it and
forwards the role to the API as `x-acme-role`. Sign out from the menu in the top
right.

### Debugging

`DEBUG_SQL=1` in `.env` logs every statement the API runs with its timing.

## Tests

`npm run test` runs the API suite. The unit tests need nothing; the integration
tests talk to Postgres, so start it and seed first.

There is deliberately not much coverage. Add tests where they earn their place.

## Your task

See [TICKETS.md](./TICKETS.md) for the work, and record your thinking in
[DECISIONS.md](./DECISIONS.md).

### Ground rules

**Time box: 3–4 hours.** We mean it. We would much rather see three hours of
good judgment than twelve hours of grinding, and we will not reward the latter.
If you run out of time, stop and write down what you would do next — that is a
real answer, not a failure.

**Use AI.** We do, all day. Claude, Cursor, Copilot, whatever you like. The
scope above assumes you are using it. We are interested in how you direct the
tools and where you overrule them, so tell us about it in `DECISIONS.md` — this
is genuinely not a trap.

**What to hand back**

1. A branch with a commit per ticket, and a short PR-style description for each.
2. `DECISIONS.md`, filled in.
3. Anything that does not work, said plainly. We would rather read an honest
   "this is broken and here's why" than discover it ourselves.

We will spend 45 minutes with you afterwards going through what you built and
extending it together, so bring your reasoning rather than just the diff.
