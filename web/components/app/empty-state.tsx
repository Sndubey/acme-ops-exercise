import { cn } from "@/lib/utils";

/** An empty screen is an instruction, not a shrug. */
function EmptyState({
  title,
  action,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-4 py-14 text-center", className)}>
      <p className="text-sm text-ink-soft">{title}</p>
      {action ? <div className="mt-3 flex justify-center">{action}</div> : null}
    </div>
  );
}

export { EmptyState };
