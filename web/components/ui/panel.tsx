import * as React from "react";

import { cn } from "@/lib/utils";

function Panel({ className, ...props }: React.ComponentProps<"section">) {
  return <section className={cn("surface-raised rounded-lg", className)} {...props} />;
}

function PanelHeader({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-line px-4 py-3",
        className,
      )}
      {...props}
    />
  );
}

function PanelTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn("etched text-sm font-semibold tracking-tight text-ink", className)}
      {...props}
    />
  );
}

function PanelBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("px-4 py-3", className)} {...props} />;
}

function PanelFooter({ className, ...props }: React.ComponentProps<"footer">) {
  return (
    <footer
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-2.5",
        className,
      )}
      {...props}
    />
  );
}

export { Panel, PanelHeader, PanelTitle, PanelBody, PanelFooter };
