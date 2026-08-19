"use client";

import { useState, useTransition } from "react";
import { UserPlus } from "lucide-react";

import { inviteMembers } from "@/app/organizations/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import type { MemberRole } from "@/lib/types";

export function InviteMembersDialog({ orgId }: { orgId: number }) {
  const [open, setOpen] = useState(false);
  const [emails, setEmails] = useState("");
  const [role, setRole] = useState<MemberRole>("member");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    startTransition(async () => {
      const res = await inviteMembers(orgId, emails, role);
      if (!res.ok) {
        setError(res.error);
        return;
      }

      let msg = `Invited ${res.invitedCount} ${res.invitedCount === 1 ? "member" : "members"}.`;
      if (res.skippedCount > 0) {
        msg += ` (${res.skippedCount} skipped as already members)`;
      }
      setSuccessMsg(msg);
      setEmails("");
      setTimeout(() => {
        setOpen(false);
        setSuccessMsg(null);
      }, 1200);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        setError(null);
        setSuccessMsg(null);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="primary">
          <UserPlus className="size-3.5" />
          Invite members
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogTitle>Invite members</DialogTitle>
        <DialogDescription>
          Paste a list of email addresses separated by commas or newlines.
        </DialogDescription>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-soft" htmlFor="invite-emails">
              Email addresses
            </label>
            <textarea
              id="invite-emails"
              rows={4}
              required
              placeholder="alex@company.test, sam@company.test&#10;jordan@company.test"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              className="surface-well w-full rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-brass"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-soft" htmlFor="invite-role">
              Role
            </label>
            <Select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value as MemberRole)}
              className="w-full"
            >
              <option value="member">Member — Read only</option>
              <option value="admin">Admin — Manage members and keys</option>
              <option value="owner">Owner — Full access</option>
            </Select>
          </div>

          {error ? (
            <div role="alert" className="text-xs text-rust">
              {error}
            </div>
          ) : null}

          {successMsg ? <div className="text-xs text-verdigris">{successMsg}</div> : null}

          <div className="flex items-center justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="quiet" size="sm" disabled={pending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" variant="primary" size="sm" disabled={pending || !emails.trim()}>
              {pending ? "Inviting..." : "Send invitations"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
