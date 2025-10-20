interface ChartSkeletonProps {
  height?: number;
}

export default function ChartSkeleton({ height = 240 }: ChartSkeletonProps) {
  return (
    <div className="animate-pulse space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-6 w-32 rounded-lg bg-[var(--color-surface-raised)]" />
        <div className="h-8 w-24 rounded-lg bg-[var(--color-surface-raised)]" />
      </div>

      {/* Chart Area */}
      <div
        className="relative overflow-hidden rounded-xl bg-[var(--color-surface-raised)]"
        style={{ height }}
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--color-surface-elevated)]/50 to-transparent animate-shimmer" />

        {/* Fake chart lines */}
        <div className="absolute inset-0 flex items-end justify-around px-4 pb-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="w-8 rounded-t-lg bg-[var(--color-accent-primary)]/20"
              style={{ height: `${Math.random() * 60 + 20}%` }}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-between">
        <div className="h-4 w-16 rounded bg-[var(--color-surface-raised)]" />
        <div className="h-4 w-16 rounded bg-[var(--color-surface-raised)]" />
        <div className="h-4 w-16 rounded bg-[var(--color-surface-raised)]" />
      </div>
    </div>
  );
}
