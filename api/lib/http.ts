import type { NextFunction, Request, Response } from "express";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

/**
 * Express 5 forwards rejected promises from route handlers to the error
 * middleware on its own, so handlers can just throw.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const status = err instanceof HttpError ? err.status : 500;

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    error: err instanceof HttpError ? err.message : "Something went wrong.",
  });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: "No such endpoint." });
}

/** Query values arrive as string | string[] | undefined. Take the first one. */
export function asString(value: unknown): string | undefined {
  if (typeof value === "string") return value.trim() || undefined;
  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0].trim() || undefined;
  }
  return undefined;
}

export function parseId(value: unknown, label: string): number {
  const id = Number(asString(value));
  if (!Number.isInteger(id) || id < 1) {
    throw new HttpError(400, `${label} must be a positive integer.`);
  }
  return id;
}

export function parsePage(value: unknown): number {
  const page = Number(asString(value) ?? 1);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

/** Restricts a free-text filter to a known set, so bad input 400s rather than
 *  silently returning everything. */
export function parseEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  label: string,
): T | undefined {
  const raw = asString(value);
  if (!raw) return undefined;

  if (!(allowed as readonly string[]).includes(raw)) {
    throw new HttpError(400, `${label} must be one of: ${allowed.join(", ")}.`);
  }

  return raw as T;
}
