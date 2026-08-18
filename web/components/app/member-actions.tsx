"use client";

import { useState, useTransition } from "react";

import { setMemberStatus } from "@/app/organizations/actions";
import { Button } from "@/components/ui/button";
import type { MemberStatus } from "@/lib/types";

function MemberActions({
  orgId,
  memberId,
  memberName,
  status,
}: {
  orgId: number;
  memberId: number;
  memberName: string;
  status: MemberStatus;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const deactivating = status !== "deactivated";
  const next: MemberStatus = deactivating ? "deactivated" : "active";
  const label = deactivating ? "Deactivate" : "Reactivate";

  return (
    <div className="flex items-center justify-end gap-2">
      {error ? (
        <span role="alert" className="text-[0.6875rem] leading-tight text-rust">
          {error}
        </span>
      ) : null}

      <Button
        size="sm"
        variant="quiet"
        className={deactivating ? "hover:text-rust" : "hover:text-verdigris"}
        disabled={pending}
        aria-label={`${label} ${memberName}`}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await setMemberStatus(orgId, memberId, next);
            if (!result.ok) setError(result.error);
          });
        }}
      >
        {label}
      </Button>
    </div>
  );
}

export { MemberActions };
