"use server";

import { revalidatePath } from "next/cache";

import { ApiError, apiFetch } from "@/lib/api";
import type { ActivityEvent, MemberStatus } from "@/lib/types";

export type ActionResult = { ok: true } | { ok: false; error: string };

export type InviteResult =
  | { ok: true; invitedCount: number; skippedCount: number }
  | { ok: false; error: string };

function failure(err: unknown): { ok: false; error: string } {
  return {
    ok: false,
    error: err instanceof ApiError ? err.message : "Something went wrong.",
  };
}

export async function setMemberStatus(
  orgId: number,
  userId: number,
  status: MemberStatus,
): Promise<ActionResult> {
  try {
    await apiFetch(`/api/organizations/${orgId}/members/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    revalidatePath(`/organizations/${orgId}`);
    return { ok: true };
  } catch (err) {
    return failure(err);
  }
}

export async function revokeApiKey(orgId: number, keyId: number): Promise<ActionResult> {
  try {
    await apiFetch(`/api/organizations/${orgId}/api-keys/${keyId}`, { method: "DELETE" });
    revalidatePath(`/organizations/${orgId}`);
    return { ok: true };
  } catch (err) {
    return failure(err);
  }
}

export async function fetchRecentEvents(orgId: number): Promise<ActivityEvent[]> {
  try {
    const res = await apiFetch<{ events: ActivityEvent[] }>(`/api/organizations/${orgId}/events`);
    return res.events;
  } catch {
    return [];
  }
}

export async function inviteMembers(
  orgId: number,
  emails: string,
  role: string,
): Promise<InviteResult> {
  try {
    const res = await apiFetch<{
      invited: unknown[];
      skipped: string[];
      totalInvited: number;
      totalSkipped: number;
    }>(`/api/organizations/${orgId}/members/invite`, {
      method: "POST",
      body: JSON.stringify({ emails, role }),
    });

    revalidatePath(`/organizations/${orgId}`);
    return {
      ok: true,
      invitedCount: res.totalInvited,
      skippedCount: res.totalSkipped,
    };
  } catch (err) {
    return failure(err);
  }
}
