/**
 * reports.js, ported to TypeScript during the 2024 migration and otherwise left
 * alone. Written in a hurry when finance needed plan numbers for a board deck.
 *
 * Predates lib/db.ts. New code should use the query helper there instead of
 * touching the pool directly.
 */

import { getPool } from "../db";

export async function getPlanBreakdown(planFilter: any) {
  var sql =
    "select o.plan as plan, count(distinct o.id) as orgs, count(u.id) as members " +
    "from organizations o left join users u on u.org_id = o.id and u.status = 'active'";

  if (planFilter && planFilter != "all") {
    sql = sql + " where o.plan = '" + planFilter + "'";
  }

  sql = sql + " group by o.plan order by count(distinct o.id) desc";

  var res = await getPool().query(sql);
  return res.rows;
}

export async function getSignupsByMonth(months: any) {
  if (!months) {
    months = 12;
  }

  var sql =
    "select to_char(date_trunc('month', created_at), 'YYYY-MM') as month, " +
    "count(*) as orgs from organizations " +
    "where created_at >= now() - interval '" + months + " months' " +
    "group by 1 order by 1";

  var res = await getPool().query(sql);
  return res.rows;
}
