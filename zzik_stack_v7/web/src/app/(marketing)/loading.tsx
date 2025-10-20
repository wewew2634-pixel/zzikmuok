export default function MarketingLoading() {
  return (
    <main className="min-h-dvh bg-[var(--color-surface-base)] text-[var(--color-text-primary)]">
      <section className="container mx-auto flex min-h-dvh max-w-5xl flex-col justify-center gap-12 px-6 py-16">
        <div className="space-y-6">
          <div className="inline-flex h-9 w-40 animate-pulse items-center justify-center rounded-full border border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)]/80" />
          <div className="space-y-4">
            <div className="h-16 w-3/4 animate-pulse rounded-lg bg-[var(--color-surface-elevated)]" />
            <div className="h-12 w-2/3 animate-pulse rounded-lg bg-[var(--color-surface-elevated)]" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-[var(--color-surface-elevated)]" />
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="h-11 w-44 animate-pulse rounded-lg bg-[var(--color-surface-elevated)]" />
            <div className="h-11 w-36 animate-pulse rounded-lg bg-[var(--color-surface-elevated)]" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((key) => (
            <div
              key={key}
              className="space-y-3 rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)]/70 p-6"
            >
              <div className="h-14 w-14 animate-pulse rounded-xl bg-[var(--color-surface-raised)]" />
              <div className="h-5 w-1/2 animate-pulse rounded bg-[var(--color-surface-raised)]" />
              <div className="h-4 w-full animate-pulse rounded bg-[var(--color-surface-raised)]" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-[var(--color-surface-raised)]" />
            </div>
          ))}
        </div>

        <p className="text-xs text-[var(--color-text-tertiary)]">
          데이터를 정리하는 중입니다. 3초 이상 지연되면 네트워크 상태를 확인해 주세요.
        </p>
      </section>
    </main>
  );
}
