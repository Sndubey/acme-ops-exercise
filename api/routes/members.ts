import { Router } from "express";

import { queryOne } from "../db";
import { HttpError, asString, parseEnum, parseId, parsePage } from "../lib/http";
import { recordEvent } from "../queries/events";
import {
  MEMBER_ROLES,
  MEMBER_STATUSES,
  PAGE_SIZE,
  listMembers,
  type MemberRow,
} from "../queries/orgs";

export const membersRouter = Router();

membersRouter.get("/:id/members", async (req, res) => {
  const orgId = parseId(req.params.id, "Organization id");
  const page = parsePage(req.query.page);

  const { rows, total } = await listMembers({
    orgId,
    search: asString(req.query.search),
    role: parseEnum(req.query.role, MEMBER_ROLES, "role"),
    status: parseEnum(req.query.status, MEMBER_STATUSES, "status"),
    page,
  });

  res.json({ members: rows, total, page, pageSize: PAGE_SIZE });
});

/** Activates or deactivates a member. */
membersRouter.patch("/:id/members/:userId", async (req, res) => {
  const orgId = parseId(req.params.id, "Organization id");
  const userId = parseId(req.params.userId, "Member id");

  const status = (req.body as { status?: unknown } | undefined)?.status;
  if (typeof status !== "string" || !(MEMBER_STATUSES as readonly string[]).includes(status)) {
    throw new HttpError(400, `status must be one of: ${MEMBER_STATUSES.join(", ")}.`);
  }

  const member = await queryOne<Omit<MemberRow, "total_count">>(
    `
      update users
      set status = $1
      where id = $2 and org_id = $3
      returning id, name, email, role, status, created_at, last_active_at
    `,
    [status, userId, orgId],
  );

  if (!member) throw new HttpError(404, "Member not found.");

  await recordEvent({
    orgId,
    action: status === "deactivated" ? "user.deactivated" : "user.activated",
    targetType: "user",
    targetId: String(member.id),
    metadata: { status },
  });

  res.json({ member });
});
