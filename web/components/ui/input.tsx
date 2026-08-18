import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "surface-well h-9 w-full rounded-md px-3 text-sm text-ink outline-none",
        "placeholder:text-ink-faint",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "[&::-webkit-calendar-picker-indicator]:opacity-55",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
