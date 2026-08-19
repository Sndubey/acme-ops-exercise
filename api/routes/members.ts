import { Router } from "express";

import { query, queryOne } from "../db";
import { requireRole } from "../lib/auth";
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

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length === 0) return email;
  return parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
}

function extractEmails(raw: unknown): string[] {
  let list: string[] = [];
  if (typeof raw === "string") {
    list = raw.split(/[\r\n,;\s]+/);
  } else if (Array.isArray(raw)) {
    list = raw.flatMap((item) => (typeof item === "string" ? item.split(/[\r\n,;\s]+/) : []));
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const unique = new Set<string>();
  for (const item of list) {
    const trimmed = item.trim().toLowerCase();
    if (trimmed && emailRegex.test(trimmed)) {
      unique.add(trimmed);
    }
  }
  return Array.from(unique);
}

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

/** Batch invites one or more members by email. */
membersRouter.post(
  "/:id/members/invite",
  requireRole("owner", "admin"),
  async (req, res) => {
    const orgId = parseId(req.params.id, "Organization id");
    const role =
      (req.body?.role ? parseEnum(req.body.role, MEMBER_ROLES, "role") : "member") ?? "member";
    const emails = extractEmails(req.body?.emails);

    if (emails.length === 0) {
      throw new HttpError(400, "Please provide at least one valid email address.");
    }

    const existing = await query<{ email: string }>(
      `select lower(email) as email from users where org_id = $1 and lower(email) = any($2)`,
      [orgId, emails],
    );
    const existingSet = new Set(existing.map((r) => r.email.toLowerCase()));

    const toInvite = emails.filter((e) => !existingSet.has(e));
    const skipped = emails.filter((e) => existingSet.has(e));

    const invited: Array<Omit<MemberRow, "total_count">> = [];

    for (const email of toInvite) {
      const name = nameFromEmail(email);
      const user = await queryOne<Omit<MemberRow, "total_count">>(
        `
          insert into users (org_id, email, name, role, status, created_at)
          values ($1, $2, $3, $4, 'invited', now())
          returning id, name, email, role, status, created_at, last_active_at
        `,
        [orgId, email, name, role],
      );

      if (user) {
        invited.push(user);
        await recordEvent({
          orgId,
          action: "user.invited",
          targetType: "user",
          targetId: String(user.id),
          metadata: { email: user.email, role: user.role },
        });
      }
    }

    res.status(201).json({
      invited,
      skipped,
      totalInvited: invited.length,
      totalSkipped: skipped.length,
    });
  },
);

/** Activates or deactivates a member. */
membersRouter.patch(
  "/:id/members/:userId",
  requireRole("owner", "admin"),
  async (req, res) => {
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
  },
);
