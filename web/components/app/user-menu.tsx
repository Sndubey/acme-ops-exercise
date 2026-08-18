"use client";

import { useTransition } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, LogOut } from "lucide-react";

import { signOut } from "@/app/actions";
import { ROLE_HINT, ROLE_LABEL, initials, type Operator } from "@/lib/roles";

function UserMenu({ operator }: { operator: Operator }) {
  const [pending, startTransition] = useTransition();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="press surface-raised-sm flex h-9 items-center gap-2 rounded-md pl-1.5 pr-2.5"
        >
          <span className="surface-well grid size-6 place-items-center rounded-full font-mono text-[0.625rem] font-medium text-ink-soft">
            {initials(operator.name)}
          </span>
          <span className="hidden text-[0.8125rem] font-medium text-ink sm:inline">
            {operator.name.split(" ")[0]}
          </span>
          <ChevronDown className="size-3.5 text-ink-faint" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="surface-raised z-50 min-w-[15rem] rounded-lg p-1"
        >
          <div className="px-2.5 py-2">
            <div className="text-[0.8125rem] font-medium text-ink">{operator.name}</div>
            <div className="font-mono text-[0.6875rem] text-ink-faint">{operator.email}</div>
            <div className="mt-1.5 text-[0.6875rem] text-ink-soft">
              <span className="font-medium text-brass">{ROLE_LABEL[operator.role]}</span>
              {" · "}
              {ROLE_HINT[operator.role]}
            </div>
          </div>

          <div className="my-1 h-px bg-line-soft" />

          <DropdownMenu.Item
            disabled={pending}
            onSelect={() => startTransition(() => signOut())}
            className="flex cursor-default items-center gap-2 rounded-md px-2.5 py-1.5 text-[0.8125rem] text-ink outline-none data-[highlighted]:bg-well/70"
          >
            <LogOut className="size-3.5 text-ink-faint" />
            {pending ? "Signing out…" : "Sign out"}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export { UserMenu };
