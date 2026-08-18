import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE, findOperator, type Operator } from "@/lib/roles";

/**
 * The signed-in operator, or null. The cookie holds an email and nothing else —
 * it is a local fixture, not a credential. Real sessions arrive with SSO.
 */
export async function getSession(): Promise<Operator | null> {
  const store = await cookies();
  return findOperator(store.get(SESSION_COOKIE)?.value);
}

/** For pages that must not render to a signed-out visitor. */
export async function requireSession(): Promise<Operator> {
  const operator = await getSession();
  if (!operator) redirect("/login");
  return operator;
}
