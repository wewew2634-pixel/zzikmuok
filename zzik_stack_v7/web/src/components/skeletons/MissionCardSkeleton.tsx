export default function MissionCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)] p-6">
      {/* Header */}
      <div className="mb-4 flex items-start gap-4">
        <div className="size-16 shrink-0 rounded-full bg-[var(--color-surface-raised)]" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-32 rounded-lg bg-[var(--color-surface-raised)]" />
          <div className="h-4 w-24 rounded-lg bg-[var(--color-surface-raised)]" />
          <div className="flex gap-2">
            <div className="h-5 w-16 rounded bg-[var(--color-surface-raised)]" />
            <div className="h-5 w-20 rounded bg-[var(--color-surface-raised)]" />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="mb-4 space-y-2">
        <div className="h-4 w-full rounded-lg bg-[var(--color-surface-raised)]" />
        <div className="h-4 w-4/5 rounded-lg bg-[var(--color-surface-raised)]" />
      </div>

      {/* Categories */}
      <div className="mb-4 flex gap-2">
        <div className="h-6 w-16 rounded-md bg-[var(--color-surface-raised)]" />
        <div className="h-6 w-20 rounded-md bg-[var(--color-surface-raised)]" />
        <div className="h-6 w-18 rounded-md bg-[var(--color-surface-raised)]" />
      </div>

      {/* Stats */}
      <div className="mb-4 rounded-lg bg-[var(--color-surface-raised)] p-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="mb-2 h-3 w-20 rounded bg-[var(--color-surface-base)]" />
            <div className="h-8 w-24 rounded bg-[var(--color-surface-base)]" />
          </div>
          <div>
            <div className="mb-2 h-3 w-16 rounded bg-[var(--color-surface-base)]" />
            <div className="h-8 w-20 rounded bg-[var(--color-surface-base)]" />
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="flex items-center justify-between border-t border-[var(--color-border-primary)] pt-4">
        <div className="h-6 w-24 rounded-lg bg-[var(--color-surface-raised)]" />
        <div className="h-10 w-24 rounded-lg bg-[var(--color-surface-raised)]" />
      </div>
    </div>
  );
}
