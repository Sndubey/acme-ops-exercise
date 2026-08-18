import type { Metadata } from "next";

import { LoginForm } from "@/components/app/login-form";
import { Mark } from "@/components/app/mark";
import { firstParam } from "@/lib/utils";

export const metadata: Metadata = { title: "Sign in · Acme Ops" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const next = firstParam((await searchParams).next) ?? "/dashboard";

  return (
    <div className="w-full max-w-[23rem]">
      <div className="mb-6 flex items-center gap-2.5">
        <Mark className="size-7" />
        <span className="etched text-[1.0625rem] font-semibold tracking-tight text-ink">
          Acme Ops
        </span>
      </div>

      <div className="surface-raised rounded-lg p-5">
        <h1 className="etched text-lg font-semibold tracking-tight text-ink">Sign in</h1>
        <p className="mt-1 mb-5 text-sm text-ink-soft">
          Internal operations console. Staff accounts only.
        </p>

        <LoginForm next={next} />
      </div>

      <p className="legend mt-5 text-center">Acme Ops &middot; internal use only</p>
    </div>
  );
}
