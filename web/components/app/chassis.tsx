import Link from "next/link";

import { Mark } from "@/components/app/mark";
import { NavRail } from "@/components/app/nav-rail";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { UserMenu } from "@/components/app/user-menu";
import type { Operator } from "@/lib/roles";

/** The case the instrument is mounted in. */
function Chassis({ operator }: { operator: Operator }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-gradient-to-b from-panel-hi to-panel shadow-[inset_0_1px_0_var(--edge-light),0_8px_20px_-16px_rgba(20,18,16,0.55)]">
      <div className="mx-auto flex h-14 max-w-[80rem] items-center gap-3 px-4 sm:gap-4">
        <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5 rounded-md py-1">
          <Mark />
          <span className="etched hidden text-[0.9375rem] font-semibold tracking-tight text-ink sm:inline">
            Acme Ops
          </span>
        </Link>

        <NavRail className="ml-1" />

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <UserMenu operator={operator} />
        </div>
      </div>
    </header>
  );
}

export { Chassis };
