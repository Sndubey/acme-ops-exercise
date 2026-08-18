import { Router } from "express";

import { query, queryOne } from "../db";
import type { OrgStatus, Plan } from "../queries/orgs";

export const dashboardRouter = Router();

type OrgSummary = {
  id: number;
  name: string;
  slug: string;
  plan: Plan;
  status: OrgStatus;
};

/** Fleet overview: every tenant, with headline numbers for each. */
dashboardRouter.get("/", async (_req, res) => {
  const organizations = await query<OrgSummary>(
    `select id, name, slug, plan, status from organizations order by name`,
  );

  const rows = [];

  for (const org of organizations) {
    const members = await queryOne<{ count: number }>(
      `select count(*)::int as count from users where org_id = $1 and status = 'active'`,
      [org.id],
    );

    const recent = await queryOne<{ count: number }>(
      `
        select count(*)::int as count
        from audit_events
        where org_id = $1 and created_at >= now() - interval '30 days'
      `,
      [org.id],
    );

    const last = await queryOne<{ at: Date | null }>(
      `select max(created_at) as at from audit_events where org_id = $1`,
      [org.id],
    );

    rows.push({
      id: org.id,
      name: org.name,
      slug: org.slug,
      plan: org.plan,
      status: org.status,
      activeMembers: members?.count ?? 0,
      events30d: recent?.count ?? 0,
      lastEventAt: last?.at ?? null,
    });
  }

  const activity = await query<{ day: string; count: number }>(
    `
      select
        to_char(d.day, 'YYYY-MM-DD') as day,
        coalesce(e.count, 0)::int as count
      from generate_series(
        date_trunc('day', now()) - 29 * interval '1 day',
        date_trunc('day', now()),
        interval '1 day'
      ) d(day)
      left join (
        select date_trunc('day', created_at) as day, count(*)::int as count
        from audit_events
        where created_at >= date_trunc('day', now()) - 29 * interval '1 day'
        group by 1
      ) e on e.day = d.day
      order by d.day
    `,
  );

  res.json({
    organizations: rows,
    activity,
    totals: {
      organizations: rows.length,
      activeOrganizations: rows.filter((row) => row.status === "active").length,
      activeMembers: rows.reduce((sum, row) => sum + row.activeMembers, 0),
      events30d: rows.reduce((sum, row) => sum + row.events30d, 0),
    },
  });
});
