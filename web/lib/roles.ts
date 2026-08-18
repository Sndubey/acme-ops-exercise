/**
 * Operator accounts and the role vocabulary, shared by the server and the
 * browser. Kept free of `next/headers` so client components can import it.
 */

export const ROLES = ["owner", "admin", "member"] as const;
export type Role = (typeof ROLES)[number];

export const SESSION_COOKIE = "acme_ops_session";

/** Header the API reads the operator's role from. Keep in step with api/lib/auth.ts. */
export const ROLE_HEADER = "x-acme-role";

export type Operator = {
  email: string;
  name: string;
  role: Role;
};

/**
 * Stand-in for the real SSO integration. Three fixed accounts, one per role, so
 * permission behaviour can be checked locally without standing up an identity
 * provider. Swapping this out is tracked separately.
 */
export const OPERATORS: Operator[] = [
  { email: "dana.okafor@acme.test", name: "Dana Okafor", role: "owner" },
  { email: "priya.raman@acme.test", name: "Priya Raman", role: "admin" },
  { email: "sam.ellery@acme.test", name: "Sam Ellery", role: "member" },
];

/** Every fixture account shares this. Local development only. */
export const DEV_PASSWORD = "ops";

export const ROLE_LABEL: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

export const ROLE_HINT: Record<Role, string> = {
  owner: "Full access, including billing",
  admin: "Manage members and keys",
  member: "Read only",
};

export function findOperator(email: string | undefined): Operator | null {
  if (!email) return null;
  const wanted = email.trim().toLowerCase();
  return OPERATORS.find((operator) => operator.email === wanted) ?? null;
}

export function can(operator: Operator, allowed: readonly Role[]): boolean {
  return allowed.includes(operator.role);
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
