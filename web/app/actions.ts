"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { DEV_PASSWORD, SESSION_COOKIE, findOperator } from "@/lib/roles";

export type SignInResult = { error: string };

/**
 * Fixture sign-in. Checks the address against the seeded operator list and a
 * shared development password; the real integration replaces both.
 */
export async function signIn(
  _previous: SignInResult | null,
  formData: FormData,
): Promise<SignInResult> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  const operator = findOperator(email);
  if (!operator || password !== DEV_PASSWORD) {
    return { error: "That email and password do not match an operator account." };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, operator.email, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 12,
  });

  redirect(next.startsWith("/") ? next : "/dashboard");
}

export async function signOut() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
