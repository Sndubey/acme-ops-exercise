import { cn } from "@/lib/utils";

/**
 * The product mark: a control knob seen from above, pointer at twelve o'clock.
 * The console is a piece of equipment, so its mark is a part rather than a logo.
 */
function Mark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "surface-brass relative grid size-6 shrink-0 place-items-center rounded-[7px]",
        className,
      )}
    >
      <span className="absolute left-1/2 top-[3.5px] h-[4.5px] w-[2px] -translate-x-1/2 rounded-full bg-[rgba(255,255,255,0.8)]" />
      <span className="mt-[1.5px] size-[7px] rounded-full border border-[rgba(255,255,255,0.4)]" />
    </span>
  );
}

export { Mark };
