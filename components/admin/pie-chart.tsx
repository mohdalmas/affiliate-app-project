"use client";

import { useState } from "react";

// A small, dependency-free pie chart — real SVG wedges (not a single
// conic-gradient div) so each slice is its own hoverable element, plus a
// legend list below (not a <table>). Good enough for a handful of
// products; not meant to replace a real charting library if this ever
// needs animation or dozens of thin slices.
const PALETTE = [
  "#6366f1", // indigo
  "#22c55e", // green
  "#f59e0b", // amber
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#ef4444", // red
  "#8b5cf6", // violet
  "#84cc16", // lime
  "#f97316", // orange
  "#14b8a6", // teal
];

export type PieSlice = {
  label: string;
  value: number;
  detail?: string;
};

// Point on a circle of radius r centered at (cx, cy), at angleDeg measured
// clockwise from the top (12 o'clock) — matches how a pie chart reads.
function pointOnCircle(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function wedgePath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string[] {
  // A full-circle single slice (only one product with data) can't be drawn
  // as one arc — split it into two halves so the SVG path is still valid.
  if (endDeg - startDeg >= 359.999) {
    const mid = startDeg + 180;
    return [...wedgePath(cx, cy, r, startDeg, mid), ...wedgePath(cx, cy, r, mid, endDeg)];
  }
  const start = pointOnCircle(cx, cy, r, startDeg);
  const end = pointOnCircle(cx, cy, r, endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return [`M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`];
}

export function PieChart({
  data,
  size = 260,
  legendMaxHeight = 260,
  unit = "",
}: {
  data: PieSlice[];
  size?: number;
  // Caps how tall the legend list can grow before it scrolls internally —
  // keeps a long product list from pushing the rest of the dashboard down.
  legendMaxHeight?: number;
  // A plain string, not a function — this is a Client Component, and a
  // function prop passed in from a Server Component (like app/admin/page.tsx)
  // can't cross that boundary (it isn't serializable over the RSC wire
  // format, and crashes at render time). "clicks" → "3 clicks".
  unit?: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const r = size / 2;
  const formatValue = (v: number) => (unit ? `${v} ${unit}` : String(v));

  let cumulative = 0;
  const slices = data.map((d, i) => {
    const startDeg = total ? (cumulative / total) * 360 : 0;
    cumulative += d.value;
    const endDeg = total ? (cumulative / total) * 360 : 0;
    return { ...d, index: i, startDeg, endDeg };
  });

  return (
    <div className="flex flex-wrap items-start gap-6">
      {total === 0 ? (
        <div
          role="img"
          aria-label="Pie chart, no data yet"
          style={{ width: size, height: size, borderRadius: "9999px", background: "var(--muted)" }}
          className="shrink-0"
        />
      ) : (
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            role="img"
            aria-label="Pie chart"
          >
            {slices.map((s) =>
              wedgePath(r, r, r, s.startDeg, s.endDeg).map((d, partIndex) => (
                <path
                  key={`${s.label}-${partIndex}`}
                  d={d}
                  fill={PALETTE[s.index % PALETTE.length]}
                  stroke="var(--background)"
                  strokeWidth={hovered === s.index ? 0 : 1}
                  opacity={hovered === null || hovered === s.index ? 1 : 0.45}
                  style={{ transition: "opacity 120ms, transform 120ms", transformOrigin: `${r}px ${r}px` }}
                  transform={hovered === s.index ? "scale(1.04)" : undefined}
                  onMouseEnter={() => setHovered(s.index)}
                  onMouseLeave={() => setHovered((h) => (h === s.index ? null : h))}
                  onFocus={() => setHovered(s.index)}
                  onBlur={() => setHovered((h) => (h === s.index ? null : h))}
                  tabIndex={0}
                  className="cursor-pointer outline-none"
                >
                  <title>
                    {s.label}: {formatValue(s.value)} ({((s.value / total) * 100).toFixed(1)}%)
                    {s.detail ? ` — ${s.detail}` : ""}
                  </title>
                </path>
              )),
            )}
          </svg>
          {hovered !== null && (
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-md bg-background/95 px-2 py-1 text-center shadow border"
              style={{ maxWidth: size - 20 }}
            >
              <span className="text-xs font-medium truncate max-w-full">
                {data[hovered].label}
              </span>
              <span className="text-sm font-bold">{formatValue(data[hovered].value)}</span>
              <span className="text-xs text-muted-foreground">
                {((data[hovered].value / total) * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      )}
      <div
        className="flex flex-col gap-1 text-sm min-w-0 w-full sm:w-72 overflow-y-auto pr-2"
        style={{ maxHeight: legendMaxHeight }}
      >
        {data.length === 0 ? (
          <p className="text-muted-foreground">No data yet.</p>
        ) : (
          data.map((d, i) => (
            <div
              key={d.label}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
              className={`flex items-center gap-2 rounded px-1 py-0.5 -mx-1 cursor-default transition-colors ${
                hovered === i ? "bg-accent" : ""
              }`}
            >
              <span
                aria-hidden
                className="h-3 w-3 rounded-sm shrink-0"
                style={{ background: PALETTE[i % PALETTE.length] }}
              />
              <span className="font-medium truncate max-w-[10rem]">{d.label}</span>
              <span className="text-muted-foreground whitespace-nowrap">
                {formatValue(d.value)}
                {total > 0 && ` (${((d.value / total) * 100).toFixed(1)}%)`}
              </span>
              {d.detail && (
                <span className="text-xs text-muted-foreground truncate">· {d.detail}</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
