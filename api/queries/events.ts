import { query } from "../db";

type RecordEventInput = {
  orgId: number;
  actorUserId?: number | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
};

/** Appends to the activity log. Every mutation in the console writes one. */
export async function recordEvent(input: RecordEventInput) {
  await query(
    `
      insert into audit_events
        (org_id, actor_user_id, action, target_type, target_id, metadata, created_at)
      values ($1, $2, $3, $4, $5, $6::jsonb, now())
    `,
    [
      input.orgId,
      input.actorUserId ?? null,
      input.action,
      input.targetType,
      input.targetId ?? null,
      JSON.stringify(input.metadata ?? {}),
    ],
  );
}
