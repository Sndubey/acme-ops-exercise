"use client";

import { useState, useTransition } from "react";

import { revokeApiKey } from "@/app/organizations/actions";
import { Button } from "@/components/ui/button";

function ApiKeyActions({
  orgId,
  keyId,
  label,
}: {
  orgId: number;
  keyId: number;
  label: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

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
        disabled={pending}
        aria-label={`Revoke ${label}`}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await revokeApiKey(orgId, keyId);
            if (!result.ok) setError(result.error);
          });
        }}
      >
        Revoke
      </Button>
    </div>
  );
}

export { ApiKeyActions };
