"use client";

import { useState } from "react";

type DataPoint = { date: string; count: number };

type MiniChartProps = {
  data: DataPoint[];
  color?: string;
};

export function MiniChart({ data, color = "#2563eb" }: MiniChartProps) {
  const [tooltip, setTooltip] = useState<{ point: DataPoint; index: number } | null>(null);

  const displayData = data.slice(-30);
  const max = Math.max(...displayData.map((d) => d.count), 1);

  return (
    <div className="relative w-full space-y-1">
      {displayData.map((point, i) => {
        const pct = Math.round((point.count / max) * 100);
        return (
          <div
            key={point.date}
            className="group flex items-center gap-2"
            onMouseEnter={() => setTooltip({ point, index: i })}
            onMouseLeave={() => setTooltip(null)}
          >
            <span className="w-20 shrink-0 text-right text-[10px] text-gray-400 tabular-nums">
              {point.date}
            </span>
            <div className="relative flex-1 rounded-full bg-gray-100" style={{ height: "12px" }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
            <span className="w-8 shrink-0 text-[10px] text-gray-500 tabular-nums">
              {point.count}
            </span>
          </div>
        );
      })}

      {tooltip && (
        <div className="pointer-events-none absolute right-0 top-0 z-10 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg text-xs">
          <p className="font-semibold text-gray-800">{tooltip.point.date}</p>
          <p className="text-gray-600">{tooltip.point.count}</p>
        </div>
      )}
    </div>
  );
}
