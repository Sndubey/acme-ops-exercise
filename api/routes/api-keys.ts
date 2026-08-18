import { Router } from "express";

import { queryOne } from "../db";
import { requireRole } from "../lib/auth";
import { HttpError, parseId } from "../lib/http";
import { recordEvent } from "../queries/events";
import { listApiKeys } from "../queries/orgs";

export const apiKeysRouter = Router();

apiKeysRouter.get("/:id/api-keys", async (req, res) => {
  const orgId = parseId(req.params.id, "Organization id");
  res.json({ apiKeys: await listApiKeys(orgId) });
});

apiKeysRouter.delete(
  "/:id/api-keys/:keyId",
  requireRole("owner", "admin"),
  async (req, res) => {
    const orgId = parseId(req.params.id, "Organization id");
    const keyId = parseId(req.params.keyId, "Key id");

    const key = await queryOne<{ id: number; label: string }>(
      `
        update api_keys
        set revoked_at = now()
        where id = $1 and org_id = $2 and revoked_at is null
        returning id, label
      `,
      [keyId, orgId],
    );

    if (!key) throw new HttpError(404, "Key not found, or already revoked.");

    await recordEvent({
      orgId,
      action: "api_key.revoked",
      targetType: "api_key",
      targetId: String(key.id),
      metadata: { label: key.label },
    });

    res.json({ revoked: key });
  },
);
