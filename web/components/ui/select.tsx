import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Native select, styled as a recessed control. Deliberately not a Radix
 * listbox: filter controls in a dense table benefit from the platform
 * behaviour, and this works without JavaScript.
 */
function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative inline-flex">
      <select
        className={cn(
          "surface-well h-9 w-full appearance-none rounded-md pl-3 pr-8 text-sm text-ink outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint"
      />
    </div>
  );
}

export { Select };
