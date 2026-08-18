import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[0.6875rem] font-medium leading-5",
  {
    variants: {
      tone: {
        neutral: "border-line bg-well/50 text-ink-soft",
        positive: "border-verdigris/35 bg-verdigris/10 text-verdigris",
        caution: "border-amber/35 bg-amber/10 text-amber",
        critical: "border-rust/35 bg-rust/10 text-rust",
        brass: "border-brass/40 bg-brass/10 text-brass",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

function Badge({
  className,
  tone,
  dot = false,
  children,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { dot?: boolean }) {
  return (
    <span className={cn(badgeVariants({ tone, className }))} {...props}>
      {dot ? <span aria-hidden className="size-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
