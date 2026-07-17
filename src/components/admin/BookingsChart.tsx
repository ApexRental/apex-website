"use client";

import { useState } from "react";

export type DayPoint = { date: string; label: string; count: number };

/**
 * Bookings-per-day column chart, last 30 days. Single series (accent),
 * hover tooltip per column, values otherwise carried by the y-ticks.
 */
export default function BookingsChart({ points }: { points: DayPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...points.map((p) => p.count));
  const yTicks = max <= 4 ? max : 4;

  return (
    <div className="relative">
      <div className="flex gap-3">
        {/* y-axis ticks */}
        <div className="flex h-40 flex-col justify-between pb-5 text-right text-[10px] tabular-nums text-muted/70">
          {Array.from({ length: yTicks + 1 }, (_, i) => (
            <span key={i}>{Math.round(max - (max / yTicks) * i)}</span>
          ))}
        </div>

        <div className="relative flex h-40 flex-1 items-end gap-[2px] border-b border-line pb-0">
          {points.map((p, i) => {
            const h = p.count === 0 ? 2 : Math.max(4, (p.count / max) * 130);
            return (
              <div
                key={p.date}
                className="relative flex h-full flex-1 cursor-default items-end justify-center"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                <div
                  className="w-full max-w-[24px] rounded-t-[4px] transition-colors"
                  style={{
                    height: `${h}px`,
                    background:
                      p.count === 0
                        ? "var(--color-line)"
                        : hover === i
                          ? "var(--color-accent-bright)"
                          : "var(--color-accent)",
                  }}
                />
                {hover === i && (
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded border border-line bg-raised px-2.5 py-1.5 text-xs shadow-lg">
                    <span className="text-muted">{p.label}: </span>
                    <span className="font-semibold text-fg">
                      {p.count} request{p.count === 1 ? "" : "s"}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="ml-9 mt-1.5 flex justify-between text-[10px] text-muted/70">
        <span>{points[0]?.label}</span>
        <span>{points[Math.floor(points.length / 2)]?.label}</span>
        <span>{points[points.length - 1]?.label}</span>
      </div>
    </div>
  );
}
