import { ROLE_HEADER } from "@/lib/roles";
import { getSession } from "@/lib/session";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Absolute URL for a link the browser follows directly, such as a download. */
export function apiUrl(path: string): string {
  return `${API_URL}${path}`;
}

/**
 * Server-side call to the API, forwarding the operator's role. The browser
 * never talks to the API directly, so there is one place that decides what
 * identity a request carries.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const operator = await getSession();

  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      ...init,
      cache: "no-store",
      headers: {
        "content-type": "application/json",
        ...(operator ? { [ROLE_HEADER]: operator.role } : {}),
        ...(init.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(
      503,
      `Cannot reach the API at ${API_URL}. Start it with \`npm run dev\` from the repository root.`,
    );
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new ApiError(response.status, body?.error ?? `API responded ${response.status}.`);
  }

  return (await response.json()) as T;
}
