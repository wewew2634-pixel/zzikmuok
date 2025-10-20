"use client";

import { useEffect } from "react";

interface MarketingErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MarketingError({ error, reset }: MarketingErrorProps) {
  useEffect(() => {
    console.error("Marketing route error:", error);
  }, [error]);

  return (
    <main className="min-h-dvh bg-[var(--color-surface-base)] text-[var(--color-text-primary)]">
      <section className="container mx-auto flex min-h-dvh max-w-4xl flex-col items-center justify-center gap-10 px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)]/60 px-4 py-1 text-sm text-[var(--color-text-secondary)]">
          <span className="size-2 rounded-full bg-[var(--color-accent-primary)]" aria-hidden="true" />
          시스템 상태 점검 중
        </div>

        <div className="space-y-4">
          <h1 className="font-[var(--font-display)] text-4xl font-semibold tracking-tight text-[var(--color-text-primary)]">
            화면을 불러오지 못했어요
          </h1>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-[var(--color-text-secondary)]">
            네트워크 연결이 불안정하거나 서버가 지연되고 있습니다. 다시 시도하면 대부분 해결되며,
            문제가 이어지면 팀에 알려 주세요.
          </p>
          {error?.digest && (
            <p className="text-xs text-[var(--color-text-tertiary)]">
              오류 코드: <span className="font-mono text-[var(--color-text-secondary)]">{error.digest}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => reset()}
            className="h-11 min-w-[200px] rounded-lg bg-[var(--color-accent-primary)] px-6 text-sm font-medium text-[oklch(10%_0_0)] transition-all duration-200 hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]/60"
          >
            다시 시도하기
          </button>
          <span className="text-xs text-[var(--color-text-tertiary)]">
            지속되면 <a href="mailto:support@zzik.kr" className="underline underline-offset-4">support@zzik.kr</a> 로 문의해 주세요.
          </span>
        </div>
      </section>
    </main>
  );
}
