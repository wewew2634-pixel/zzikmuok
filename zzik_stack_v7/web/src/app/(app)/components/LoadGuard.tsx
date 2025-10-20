"use client";

import { useEffect, useState } from "react";

interface LoadGuardProps {
  /** Milliseconds to wait before revealing the slow state message */
  delay?: number;
  /** Custom message explaining the current loading state */
  message?: string;
  /** Optional retry handler for long running tasks */
  onRetry?: () => void;
  /** Additional content rendered inside the guard (e.g., skeletons) */
  children?: React.ReactNode;
}

const DEFAULT_MESSAGE = "예상보다 시간이 조금 더 걸리고 있어요. 연결 상태를 확인하거나 다시 시도해 주세요.";

export default function LoadGuard({
  delay = 2500,
  message = DEFAULT_MESSAGE,
  onRetry,
  children,
}: LoadGuardProps) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setSlow(true), delay);
    return () => window.clearTimeout(timeout);
  }, [delay]);

  return (
    <div className="flex w-full flex-col items-center gap-4 text-center text-[var(--color-text-secondary)]">
      {children}
      {slow && (
        <div
          role="status"
          aria-live="polite"
          className="w-full max-w-xl rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)]/70 px-6 py-5 shadow-lg"
        >
          <div className="flex flex-col items-center gap-3">
            <span className="inline-flex h-9 items-center gap-2 rounded-full border border-[var(--color-border-primary)] bg-[var(--color-surface-raised)] px-3 text-xs uppercase tracking-wide text-[var(--color-text-tertiary)]">
              <span className="size-2 rounded-full bg-[var(--color-accent-primary)] animate-pulse" aria-hidden="true" />
              연결 대기
            </span>
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{message}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="h-10 rounded-lg bg-[var(--color-accent-primary)] px-4 text-xs font-medium text-[oklch(10%_0_0)] transition-colors duration-200 hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]/60"
              >
                다시 불러오기
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
