"use client";

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface SimpleBarChartProps {
  data: DataPoint[];
  height?: number;
  showValues?: boolean;
  formatValue?: (value: number) => string;
}

export default function SimpleBarChart({
  data,
  height = 200,
  showValues = true,
  formatValue = (v) => v.toLocaleString("ko-KR"),
}: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="space-y-3">
      {data.map((point, index) => {
        const percentage = (point.value / maxValue) * 100;
        const barColor =
          point.color || "var(--color-accent-primary)";

        return (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[var(--color-text-secondary)]">
                {point.label}
              </span>
              {showValues && (
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {formatValue(point.value)}
                </span>
              )}
            </div>
            <div className="relative h-8 overflow-hidden rounded-lg bg-[var(--color-surface-raised)]">
              <div
                className="absolute inset-y-0 left-0 rounded-lg transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: barColor,
                  opacity: 0.8,
                }}
              />
              <div
                className="absolute inset-y-0 left-0 rounded-lg blur-sm transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: barColor,
                  opacity: 0.3,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
