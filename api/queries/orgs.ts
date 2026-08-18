import { query, queryOne } from "../db";

export const PLANS = ["free", "growth", "scale", "enterprise"] as const;
export const ORG_STATUSES = ["trial", "active", "churned"] as const;
export const MEMBER_ROLES = ["owner", "admin", "member"] as const;
export const MEMBER_STATUSES = ["active", "invited", "deactivated"] as const;

export type Plan = (typeof PLANS)[number];
export type OrgStatus = (typeof ORG_STATUSES)[number];
export type MemberRole = (typeof MEMBER_ROLES)[number];
export type MemberStatus = (typeof MEMBER_STATUSES)[number];

export type OrganizationRow = {
  id: number;
  name: string;
  slug: string;
  plan: Plan;
  status: OrgStatus;
  created_at: Date;
  member_count: number;
  total_count: number;
};

export type MemberRow = {
  id: number;
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
  created_at: Date;
  last_active_at: Date | null;
  total_count: number;
};

export type EventRow = {
  id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  created_at: Date;
  actor_name: string | null;
};

export type Paged<T> = { rows: T[]; total: number };

export const PAGE_SIZE = 25;

type ListOrgsParams = {
  search?: string;
  plan?: string;
  status?: string;
  page?: number;
};

/**
 * One query, one round trip: the per-org member count comes from a lateral
 * join and the total row count from a window function.
 */
export async function listOrganizations({
  search,
  plan,
  status,
  page = 1,
}: ListOrgsParams): Promise<Paged<OrganizationRow>> {
  const rows = await query<OrganizationRow>(
    `
      select
        o.id,
        o.name,
        o.slug,
        o.plan,
        o.status,
        o.created_at,
        m.member_count,
        count(*) over ()::int as total_count
      from organizations o
      left join lateral (
        select count(*)::int as member_count
        from users u
        where u.org_id = o.id and u.status = 'active'
      ) m on true
      where ($1::text is null or o.name ilike '%' || $1 || '%')
        and ($2::text is null or o.plan = $2)
        and ($3::text is null or o.status = $3)
      order by o.name
      limit $4 offset $5
    `,
    [
      search ?? null,
      plan ?? null,
      status ?? null,
      PAGE_SIZE,
      (Math.max(1, page) - 1) * PAGE_SIZE,
    ],
  );

  return { rows, total: rows[0]?.total_count ?? 0 };
}

export type Organization = {
  id: number;
  name: string;
  slug: string;
  plan: Plan;
  status: OrgStatus;
  created_at: Date;
};

export async function getOrganization(id: number) {
  return queryOne<Organization>(
    `select id, name, slug, plan, status, created_at from organizations where id = $1`,
    [id],
  );
}

type ListMembersParams = {
  orgId: number;
  search?: string;
  role?: string;
  status?: string;
  page?: number;
};

export async function listMembers({
  orgId,
  search,
  role,
  status,
  page = 1,
}: ListMembersParams): Promise<Paged<MemberRow>> {
  const rows = await query<MemberRow>(
    `
      select
        u.id,
        u.name,
        u.email,
        u.role,
        u.status,
        u.created_at,
        u.last_active_at,
        count(*) over ()::int as total_count
      from users u
      where u.org_id = $1
        and ($2::text is null or (u.name ilike '%' || $2 || '%' or u.email ilike '%' || $2 || '%'))
        and ($3::text is null or u.role = $3)
        and ($4::text is null or u.status = $4)
      order by u.name, u.id
      limit $5 offset $6
    `,
    [
      orgId,
      search ?? null,
      role ?? null,
      status ?? null,
      PAGE_SIZE,
      (Math.max(1, page) - 1) * PAGE_SIZE,
    ],
  );

  return { rows, total: rows[0]?.total_count ?? 0 };
}

export async function getOrgStats(orgId: number) {
  return queryOne<{
    active_members: number;
    invited_members: number;
    projects: number;
    total_events: number;
    events_30d: number;
    last_event_at: Date | null;
  }>(
    `
      select
        (select count(*)::int from users where org_id = $1 and status = 'active')    as active_members,
        (select count(*)::int from users where org_id = $1 and status = 'invited')   as invited_members,
        (select count(*)::int from projects where org_id = $1 and status = 'active') as projects,
        (select count(*)::int from audit_events where org_id = $1)                   as total_events,
        (select count(*)::int from audit_events
          where org_id = $1 and created_at >= now() - interval '30 days')            as events_30d,
        (select max(created_at) from audit_events where org_id = $1)                 as last_event_at
    `,
    [orgId],
  );
}

export async function listRecentEvents(orgId: number, limit = 12): Promise<EventRow[]> {
  return query<EventRow>(
    `
      select
        e.id::text,
        e.action,
        e.target_type,
        e.target_id,
        e.created_at,
        u.name as actor_name
      from audit_events e
      left join users u on u.id = e.actor_user_id
      where e.org_id = $1
      order by e.created_at desc, e.id desc
      limit $2
    `,
    [orgId, limit],
  );
}

/** Daily event counts for the last `days` days, for the activity sparkline. */
export async function getActivitySeries(orgId: number, days = 30) {
  return query<{ day: string; count: number }>(
    `
      select
        to_char(d.day, 'YYYY-MM-DD') as day,
        coalesce(e.count, 0)::int as count
      from generate_series(
        date_trunc('day', now()) - ($2::int - 1) * interval '1 day',
        date_trunc('day', now()),
        interval '1 day'
      ) d(day)
      left join (
        select date_trunc('day', created_at) as day, count(*)::int as count
        from audit_events
        where org_id = $1
        group by 1
      ) e on e.day = d.day
      order by d.day
    `,
    [orgId, days],
  );
}

export async function listApiKeys(orgId: number) {
  return query<{
    id: number;
    label: string;
    token_prefix: string;
    created_at: Date;
    revoked_at: Date | null;
  }>(
    `
      select id, label, token_prefix, created_at, revoked_at
      from api_keys
      where org_id = $1
      order by created_at desc, id desc
    `,
    [orgId],
  );
}
