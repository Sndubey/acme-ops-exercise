import { Router } from "express";

import { query } from "../db";
import { csvLine } from "../lib/csv";
import { HttpError, asString, parseId } from "../lib/http";
import { getOrganization } from "../queries/orgs";

export const exportsRouter = Router();

/** Rows pulled per round trip. The whole log will not fit in memory. */
const BATCH_SIZE = 1000;

type ExportRow = {
  id: string;
  created_at: Date;
  created_at_cursor: string;
  action: string;
  target_type: string;
  target_id: string | null;
  actor_name: string | null;
};

/**
 * Streams an organization's activity log as CSV.
 *
 * Optional `from` and `to` query parameters narrow the range; both are
 * YYYY-MM-DD as sent by the date pickers in the console.
 */
exportsRouter.get("/:id/export/activity.csv", async (req, res) => {
  const orgId = parseId(req.params.id, "Organization id");
  const from = asString(req.query.from) ?? null;
  const to = asString(req.query.to) ?? null;

  const organization = await getOrganization(orgId);
  if (!organization) throw new HttpError(404, "Organization not found.");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${organization.slug}-activity.csv"`,
  );

  res.write(csvLine(["id", "created_at", "action", "target_type", "target_id", "actor"]));

  let cursorCreatedAt: string | null = null;
  let cursorId: string | null = null;

  for (;;) {
    const rows: ExportRow[] = await query<ExportRow>(
      `
        select
          e.id::text,
          e.created_at,
          to_char(e.created_at, 'YYYY-MM-DD"T"HH24:MI:SS.USOF') as created_at_cursor,
          e.action,
          e.target_type,
          e.target_id,
          u.name as actor_name
        from audit_events e
        left join users u on u.id = e.actor_user_id
        where e.org_id = $1
          and ($2::date is null or e.created_at >= $2::date)
          and ($3::date is null or e.created_at < ($3::date + interval '1 day'))
          and (
            $4::timestamptz is null
            or (e.created_at, e.id) < ($4::timestamptz, $5::bigint)
          )
        order by e.created_at desc, e.id desc
        limit $6
      `,
      [orgId, from, to, cursorCreatedAt, cursorId, BATCH_SIZE],
    );

    if (rows.length === 0) break;

    for (const row of rows) {
      res.write(
        csvLine([
          row.id,
          row.created_at,
          row.action,
          row.target_type,
          row.target_id,
          row.actor_name,
        ]),
      );
    }

    if (rows.length < BATCH_SIZE) break;

    const last = rows[rows.length - 1];
    cursorCreatedAt = last.created_at_cursor;
    cursorId = last.id;
  }

  res.end();
});
