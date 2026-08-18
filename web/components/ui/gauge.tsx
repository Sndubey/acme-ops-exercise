import * as React from "react";

import { cn } from "@/lib/utils";
import { Sparkline } from "@/components/ui/sparkline";

/**
 * A panel meter: recessed well, stamped legend, brass numeral. The dashboard is
 * read at a glance from across a desk, so the value carries the weight and
 * everything else stays quiet.
 */
function Gauge({
  legend,
  value,
  hint,
  series,
  className,
}: {
  legend: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  series?: number[];
  className?: string;
}) {
  return (
    <div className={cn("gauge px-3.5 py-3", className)}>
      <div className="legend etched">{legend}</div>

      <div className="mt-2.5 flex items-end justify-between gap-3">
        <div className="gauge-value text-[1.6rem] font-medium leading-none">{value}</div>
        {series && series.length > 1 ? (
          <Sparkline data={series} className="h-7 w-20 shrink-0 text-brass" />
        ) : null}
      </div>

      {hint ? <div className="mt-2 text-xs leading-tight text-ink-soft">{hint}</div> : null}
    </div>
  );
}

export { Gauge };
