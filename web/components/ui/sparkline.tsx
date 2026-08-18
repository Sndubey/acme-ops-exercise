import { cn } from "@/lib/utils";

const WIDTH = 100;
const HEIGHT = 28;

/**
 * Inline SVG so it renders on the server with the rest of the row. Stretches to
 * fill its box; the stroke stays 1.25px thanks to non-scaling-stroke.
 */
function Sparkline({ data, className }: { data: number[]; className?: string }) {
  if (data.length < 2) {
    return <div className={cn("h-7", className)} aria-hidden />;
  }

  const max = Math.max(...data, 1);
  const step = WIDTH / (data.length - 1);

  const points = data.map((value, index) => {
    const x = index * step;
    const y = 1 + (1 - value / max) * (HEIGHT - 2);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  const line = `M${points.join(" L")}`;
  const area = `${line} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      className={cn("h-7 w-full overflow-visible", className)}
      aria-hidden
    >
      <path d={area} fill="currentColor" opacity={0.13} />
      <path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export { Sparkline };
