import type { NextFunction, Request, Response } from "express";

import { HttpError } from "./http";

/**
 * The console is internal and the web app is a trusted first-party client, so
 * it forwards the signed-in operator's role on every request. Swapping this for
 * the real SSO integration is tracked separately.
 */

export const ROLES = ["owner", "admin", "member"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_HEADER = "x-acme-role";

/** Defaults to the least privileged role when the header is missing. */
export function roleFromRequest(req: Request): Role {
  const raw = req.header(ROLE_HEADER);
  return (ROLES as readonly string[]).includes(raw ?? "") ? (raw as Role) : "member";
}

export function requireRole(...allowed: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!allowed.includes(roleFromRequest(req))) {
      next(new HttpError(403, `This action requires one of: ${allowed.join(", ")}.`));
      return;
    }
    next();
  };
}
