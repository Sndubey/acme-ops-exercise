"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/organizations", label: "Organizations" },
  { href: "/reports", label: "Reports" },
];

/** Bank of switches: the selected one sits proud of its recessed track. */
function NavRail({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Sections"
      className={cn("surface-well flex gap-1 rounded-lg p-1", className)}
    >
      {LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "press rounded-md px-3 py-1.5 text-[0.8125rem] font-medium",
              active
                ? "surface-raised-sm text-ink"
                : "border border-transparent text-ink-soft hover:text-ink",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export { NavRail };
