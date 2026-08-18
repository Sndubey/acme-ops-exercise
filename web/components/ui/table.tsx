import * as React from "react";

import { cn } from "@/lib/utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full border-collapse text-sm", className)} {...props} />
    </div>
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead className={className} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody className={className} {...props} />;
}

/** Header cells form one continuous recessed strip across the table. */
function TableHeaderCell({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "border-y border-line bg-gradient-to-b from-well-deep to-well",
        "px-3 py-[0.3125rem] text-left align-middle",
        "font-mono text-[0.6875rem] font-medium uppercase tracking-[0.11em] text-ink-soft",
        "shadow-[inset_0_1px_2px_rgba(34,32,29,0.10)]",
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      className={cn("row-flush border-b border-line-soft last:border-b-0", className)}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("px-3 py-2 align-middle", className)} {...props} />;
}

export { Table, TableHead, TableBody, TableHeaderCell, TableRow, TableCell };
