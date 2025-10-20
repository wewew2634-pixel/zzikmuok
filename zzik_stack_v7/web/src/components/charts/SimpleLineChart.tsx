"use client";

interface DataPoint {
  label: string;
  value: number;
}

interface SimpleLineChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  fillColor?: string;
  showDots?: boolean;
}

export default function SimpleLineChart({
  data,
  height = 200,
  color = "var(--color-accent-primary)",
  fillColor = "var(--color-accent-bg)",
  showDots = true,
}: SimpleLineChartProps) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-dashed border-[var(--color-border-primary)] bg-[var(--color-surface-raised)]/40"
        style={{ height }}
      >
        <p className="text-sm text-[var(--color-text-tertiary)]">데이터 없음</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((point.value - minValue) / range) * 100;
    return { x, y, ...point };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaD = `${pathD} L 100 100 L 0 100 Z`;

  return (
    <div className="space-y-3">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full overflow-visible"
        style={{ height }}
      >
        {/* Area fill */}
        <path
          d={areaD}
          fill={fillColor}
          opacity="0.2"
          className="transition-all duration-300"
        />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300"
          vectorEffect="non-scaling-stroke"
        />

        {/* Dots */}
        {showDots &&
          points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="1.5"
              fill={color}
              className="transition-all duration-300"
              vectorEffect="non-scaling-stroke"
            >
              <title>
                {p.label}: {p.value.toLocaleString("ko-KR")}
              </title>
            </circle>
          ))}
      </svg>

      {/* X-axis labels (show first, middle, last) */}
      <div className="flex justify-between text-xs text-[var(--color-text-tertiary)]">
        <span>{data[0]?.label}</span>
        {data.length > 2 && (
          <span>{data[Math.floor(data.length / 2)]?.label}</span>
        )}
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}
