import { query } from "../db";
import { type Plan } from "./orgs";

export type PlanBreakdownRow = {
  plan: Plan;
  orgs: number;
  members: number;
};

export type SignupRow = {
  month: string;
  orgs: number;
};

export async function getPlanBreakdown(plan?: Plan): Promise<PlanBreakdownRow[]> {
  return query<PlanBreakdownRow>(
    `
      select
        o.plan,
        count(distinct o.id)::int as orgs,
        count(u.id)::int as members
      from organizations o
      left join users u on u.org_id = o.id and u.status = 'active'
      where ($1::text is null or o.plan = $1)
      group by o.plan
      order by count(distinct o.id) desc
    `,
    [plan ?? null],
  );
}

export async function getSignupsByMonth(months = 12): Promise<SignupRow[]> {
  return query<SignupRow>(
    `
      select
        to_char(date_trunc('month', created_at), 'YYYY-MM') as month,
        count(*)::int as orgs
      from organizations
      where created_at >= now() - ($1::int || ' months')::interval
      group by 1
      order by 1
    `,
    [months],
  );
}
