Here is the updated version with all specific numbers removed, keeping it natural and descriptive:

```markdown
# Decisions

## ACME-455 · The overview page is too slow

## What I assumed
- Dana was on leave so no acceptance criteria were given, but the dashboard was noticeably slow. Aimed to make it feel instantaneous.
- Kept the exact same JSON response shape so the frontend didn't need any edits.
- Assumed this needs live database data rather than cached numbers.

## What I changed
- Profiled the dashboard route and found an N+1 loop running multiple sequential queries per organization.
- Replaced the loop in `api/routes/dashboard.ts` with a single grouped query using sub-selects for users and audit_events to avoid cross-product row multiplication.
- Added migration `003_audit_events_indexes.sql`:
  - `(org_id, created_at desc)` for org-level event stats and latest activity lookups.
  - `(created_at)` for the fleet-wide activity sparkline query (checked with EXPLAIN ANALYZE, it allows an Index-Only Scan).
- Added `api/tests/dashboard.test.ts` to test the endpoint.

## What I deliberately did not do
- Did not add Redis or caching. With proper indexes and a consolidated query, Postgres handles this quickly enough that caching would only add stale data risks and invalidation complexity.
- Did not paginate the org list on the backend since the UI uses the full list to compute fleet totals.

## Trade-offs
- Adding indexes on `audit_events` adds a small write cost on event ingestion, but it eliminates expensive full-table scans on every dashboard load.

## What I would do next
- If `audit_events` grows much larger over time, consider a daily rollup table or materialized view for the historical sparkline stats.

## Where I used AI
- Used Claude to help inspect the N+1 queries in `dashboard.ts` and verify the subquery join strategy against Cartesian row multiplication.

## Anything broken or unfinished
- Nothing broken. All tests pass and the dashboard loads without delay.
```

## ACME-460 · Live activity feed, and tidy up reports

## What I assumed
- For live activity, 5s polling is frequent enough for operators tracking an incident without putting high load on the database.
- For reports, the finance filters should reject invalid inputs with standard 400 errors rather than silently falling back.
- Assumed `months` for signups should be bounded to a realistic range (1 to 60).

## What I changed
- Added `GET /api/organizations/:id/events` so live polling only retrieves the recent events array rather than re-running heavy org stats and sparklines.
- Created `web/components/app/recent-activity.tsx` to handle 5s polling, pausing when the tab is hidden and clearing the interval on unmount.
- Replaced the legacy `api/legacy/reports.ts` module with `api/queries/reports.ts`, using parameterized SQL to remove SQL injection vulnerabilities and adding `::int` casts for clean typing.
- Added input validation in `api/routes/reports.ts` (`parseEnum` for plans, numeric bounds for months).
- Deleted the `api/legacy/` folder.
- Added tests in `api/tests/reports.test.ts` and `api/tests/organizations.test.ts`.

## What I deliberately did not do
- Did not use WebSockets or SSE for the live feed. Polling with visibility awareness is simpler, stateless, and resilient across server restarts.
- Kept the UI design and layout identical to the original panel to avoid layout shifts.

## Trade-offs
- Dedicated polling endpoint vs. reusing `GET /organizations/:id`: A dedicated endpoint required one more route, but saves unnecessary database queries on every poll tick.

## What I would do next
- Add a subtle visual indicator (like a small live dot or flash) when new events arrive in the feed.

## Where I used AI
- Used Claude to review the polling design and verify parameterized query patterns for the reports refactor.

## Anything broken or unfinished
- Nothing broken. Live polling and refactored reports endpoints work as expected and all tests pass.



