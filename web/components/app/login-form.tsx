"use client";

import { useActionState, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";

import { signIn } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEV_PASSWORD, OPERATORS, ROLE_LABEL } from "@/lib/roles";

function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(signIn, null);
  const [email, setEmail] = useState(OPERATORS[1]!.email);
  const passwordRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="next" value={next} />

        <label className="block">
          <span className="legend mb-1.5 block">Email</span>
          <Input
            name="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="block">
          <span className="legend mb-1.5 block">Password</span>
          <Input
            ref={passwordRef}
            name="password"
            type="password"
            autoComplete="current-password"
            required
            defaultValue={DEV_PASSWORD}
          />
        </label>

        {state?.error ? (
          <p
            role="alert"
            className="flex items-start gap-1.5 text-[0.8125rem] leading-snug text-rust"
          >
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
            {state.error}
          </p>
        ) : null}

        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="surface-well mt-5 rounded-md px-3 py-2.5">
        <p className="legend mb-2">Development accounts</p>
        <ul className="space-y-1">
          {OPERATORS.map((operator) => (
            <li key={operator.email}>
              <button
                type="button"
                onClick={() => {
                  setEmail(operator.email);
                  if (passwordRef.current) passwordRef.current.value = DEV_PASSWORD;
                }}
                className="flex w-full items-baseline justify-between gap-3 rounded px-1 py-0.5 text-left hover:bg-[color-mix(in_srgb,var(--edge-light)_50%,transparent)]"
              >
                <span className="font-mono text-[0.6875rem] text-ink-soft">
                  {operator.email}
                </span>
                <span className="shrink-0 text-[0.6875rem] font-medium text-brass">
                  {ROLE_LABEL[operator.role]}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[0.6875rem] text-ink-faint">
          Password for all three: <code className="font-mono text-ink-soft">{DEV_PASSWORD}</code>
        </p>
      </div>
    </>
  );
}

export { LoginForm };
