"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { formatAxisTime, formatDayTime } from "@/lib/format";

const HEIGHT = 160;
const PADDING = { top: 18, right: 8, bottom: 22, left: 48 };
const X_TICKS = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

type ChartColor = "accent" | "danger";

const LINE_CLASSES: Record<ChartColor, string> = {
  accent: "stroke-accent",
  danger: "stroke-danger",
};

const AREA_CLASSES: Record<ChartColor, string> = {
  accent: "fill-accent/10",
  danger: "fill-danger/10",
};

const DOT_CLASSES: Record<ChartColor, string> = {
  accent: "fill-accent",
  danger: "fill-danger",
};

export type ChartPoint = {
  at: string;
  value: number | null;
};

export type ChartMarker = {
  at: string;
  label: string;
};

type TimeSeriesChartProps = {
  label: string;
  points: ChartPoint[];
  markers: ChartMarker[];
  from: string;
  to: string;
  color: ChartColor;
  formatValue: (value: number) => string;
};

function niceMax(value: number) {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step =
    [1, 2, 5, 10].find((factor) => factor * magnitude >= value) ?? 10;
  return step * magnitude;
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

export function TimeSeriesChart({
  label,
  points,
  markers,
  from,
  to,
  color,
  formatValue,
}: TimeSeriesChartProps) {
  const [containerRef, width] = useWidth<HTMLDivElement>();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const start = new Date(from).getTime();
  const end = new Date(to).getTime();
  const spansDays = end - start > DAY_MS;
  const plotWidth = Math.max(width - PADDING.left - PADDING.right, 0);
  const plotBottom = HEIGHT - PADDING.bottom;
  const plotHeight = plotBottom - PADDING.top;

  const max = niceMax(Math.max(0, ...points.map((point) => point.value ?? 0)));

  const x = (iso: string) =>
    PADDING.left +
    ((new Date(iso).getTime() - start) / (end - start)) * plotWidth;
  const y = (value: number) => plotBottom - (value / max) * plotHeight;

  const segments: { x: number; y: number }[][] = [];
  let current: { x: number; y: number }[] = [];
  for (const point of points) {
    if (point.value === null) {
      if (current.length > 0) segments.push(current);
      current = [];
    } else {
      current.push({ x: x(point.at), y: y(point.value) });
    }
  }
  if (current.length > 0) segments.push(current);

  const linePath = segments
    .map((segment) =>
      segment
        .map((p, index) => `${index === 0 ? "M" : "L"}${p.x},${p.y}`)
        .join(""),
    )
    .join("");

  const areaPath = segments
    .map(
      (segment) =>
        `M${segment[0].x},${plotBottom}` +
        segment.map((p) => `L${p.x},${p.y}`).join("") +
        `L${segment[segment.length - 1].x},${plotBottom}Z`,
    )
    .join("");

  const xTicks = Array.from({ length: X_TICKS }, (_, index) =>
    new Date(start + ((end - start) * index) / (X_TICKS - 1)).toISOString(),
  );
  const yTicks = [0, max / 2, max];

  const visibleMarkers = markers.filter((marker) => {
    const time = new Date(marker.at).getTime();
    return time >= start && time <= end;
  });

  const active = activeIndex === null ? null : points[activeIndex];

  function nearestIndex(pointerX: number) {
    let best = 0;
    points.forEach((point, index) => {
      if (
        Math.abs(x(point.at) - pointerX) <
        Math.abs(x(points[best].at) - pointerX)
      ) {
        best = index;
      }
    });
    return best;
  }

  function handleKeyDown(event: KeyboardEvent<SVGSVGElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const step = event.key === "ArrowLeft" ? -1 : 1;
    const next = (activeIndex ?? (step > 0 ? -1 : points.length)) + step;
    setActiveIndex(Math.min(Math.max(next, 0), points.length - 1));
  }

  return (
    <div ref={containerRef} className="relative">
      {width > 0 && (
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label={label}
          tabIndex={0}
          onPointerMove={(event) => {
            const bounds = event.currentTarget.getBoundingClientRect();
            setActiveIndex(nearestIndex(event.clientX - bounds.left));
          }}
          onPointerLeave={() => setActiveIndex(null)}
          onKeyDown={handleKeyDown}
          onBlur={() => setActiveIndex(null)}
          className="block touch-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={PADDING.left}
                x2={width - PADDING.right}
                y1={y(tick)}
                y2={y(tick)}
                className="stroke-border"
              />
              <text
                x={PADDING.left - 8}
                y={y(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-fg-muted font-mono text-[11px]"
              >
                {formatValue(tick)}
              </text>
            </g>
          ))}

          {xTicks.map((tick, index) => (
            <text
              key={tick}
              x={x(tick)}
              y={HEIGHT - 6}
              textAnchor={
                index === 0 ? "start" : index === X_TICKS - 1 ? "end" : "middle"
              }
              className="fill-fg-muted font-mono text-[11px]"
            >
              {formatAxisTime(tick, spansDays)}
            </text>
          ))}

          {visibleMarkers.map((marker) => (
            <g key={`${marker.at}-${marker.label}`}>
              <line
                x1={x(marker.at)}
                x2={x(marker.at)}
                y1={PADDING.top}
                y2={plotBottom}
                strokeDasharray="3 3"
                className="stroke-fg-muted"
              />
              <text
                x={x(marker.at)}
                y={PADDING.top - 6}
                textAnchor="middle"
                className="fill-fg-muted font-mono text-[11px]"
              >
                {marker.label}
              </text>
            </g>
          ))}

          <path d={areaPath} className={AREA_CLASSES[color]} />
          <path
            d={linePath}
            fill="none"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            className={LINE_CLASSES[color]}
          />

          {active && (
            <g>
              <line
                x1={x(active.at)}
                x2={x(active.at)}
                y1={PADDING.top}
                y2={plotBottom}
                className="stroke-border-strong"
              />
              {active.value !== null && (
                <circle
                  cx={x(active.at)}
                  cy={y(active.value)}
                  r={4}
                  strokeWidth={2}
                  className={`stroke-surface ${DOT_CLASSES[color]}`}
                />
              )}
            </g>
          )}
        </svg>
      )}

      {active && (
        <div
          className="pointer-events-none absolute top-0 z-10 rounded-md border border-border-strong bg-surface-2 px-2.5 py-1.5 shadow-lg shadow-black/40"
          style={{
            left: x(active.at),
            transform: `translateX(${x(active.at) > width / 2 ? "calc(-100% - 8px)" : "8px"})`,
          }}
        >
          <p className="font-mono text-[13px] font-medium tabular-nums text-fg">
            {active.value === null ? "No data" : formatValue(active.value)}
          </p>
          <p className="font-mono text-[11px] text-fg-muted">
            {formatDayTime(active.at)}
          </p>
        </div>
      )}

      {width > 0 && (
        <table className="sr-only">
          <caption>{label}</caption>
          <thead>
            <tr>
              <th scope="col">Time</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.at}>
                <td>{formatDayTime(point.at)}</td>
                <td>
                  {point.value === null ? "No data" : formatValue(point.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
