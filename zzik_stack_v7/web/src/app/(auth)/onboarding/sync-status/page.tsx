"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";

interface SyncPhase {
  name: string;
  progress: number;
  status: "pending" | "in_progress" | "completed" | "error";
}

function SyncStatusContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const provider = searchParams.get("provider") || "instagram";

  const [phases, setPhases] = useState<SyncPhase[]>([
    { name: "릴스", progress: 0, status: "pending" },
    { name: "스토리", progress: 0, status: "pending" },
    { name: "프로필 인사이트", progress: 0, status: "pending" },
  ]);

  const [overallProgress, setOverallProgress] = useState(0);
  const [timeoutWarning, setTimeoutWarning] = useState(false);
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    // Generate unique jobId for this sync session
    const syncJobId = jobId || crypto.randomUUID();

    // Setup EventSource for SSE connection
    const eventSource = new EventSource(
      `/api/onboarding/sync/${syncJobId}`
    );

    // Timeout warning after 90 seconds
    const timeoutTimer = setTimeout(() => {
      setTimeoutWarning(true);
    }, 90000);

    // Phase name mapping
    const phaseMap: Record<string, number> = {
      reels: 0,
      stories: 1,
      insights: 2,
    };

    // Connected event
    eventSource.addEventListener('connected', (e) => {
      console.log('[SSE] Connected:', e.data);
    });

    // Progress event
    eventSource.addEventListener('progress', (e) => {
      const data = JSON.parse(e.data);
      const phaseIndex = phaseMap[data.phase];

      if (phaseIndex !== undefined) {
        // Update phase status
        setPhases((prev) =>
          prev.map((p, i) => {
            if (i === phaseIndex) {
              return {
                ...p,
                status: data.progress === 100 ? 'completed' : 'in_progress',
                progress: data.progress,
              };
            }
            return p;
          })
        );

        // Update overall progress
        const baseProgress = phaseIndex * 33.33;
        const phaseProgress = (data.progress / 100) * 33.33;
        setOverallProgress(Math.min(100, baseProgress + phaseProgress));
      }
    });

    // Complete event
    eventSource.addEventListener('complete', (e) => {
      const data = JSON.parse(e.data);
      console.log('[SSE] Complete:', data);

      setOverallProgress(100);
      setCanContinue(true);
      eventSource.close();
    });

    // Error event
    eventSource.addEventListener('error', (e: any) => {
      if (e.data) {
        const data = JSON.parse(e.data);
        console.error('[SSE] Error:', data);
      } else {
        console.error('[SSE] Connection error');
      }

      // Keep timeout warning visible if error occurs after timeout
      if (!timeoutWarning) {
        setTimeoutWarning(true);
      }
    });

    // Timeout event (from server)
    eventSource.addEventListener('timeout', (e) => {
      const data = JSON.parse(e.data);
      console.warn('[SSE] Server timeout:', data);
      setTimeoutWarning(true);
    });

    // Heartbeat event (keep-alive)
    eventSource.addEventListener('heartbeat', () => {
      // Silent heartbeat to keep connection alive
    });

    // Cleanup on unmount
    return () => {
      clearTimeout(timeoutTimer);
      eventSource.close();
    };
  }, [jobId]);

  const providerName =
    provider === "instagram" ? "Instagram" : "TikTok";

  return (
    <main className="min-h-dvh bg-[var(--color-surface-base)] text-[var(--color-text-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 h-14 border-b border-[var(--color-border-primary)] backdrop-blur-xl backdrop-saturate-150 bg-[var(--color-surface-base)]/80">
        <div className="container mx-auto max-w-7xl h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-gradient-to-br from-[var(--color-accent-light)] to-[var(--color-accent-hover)] rounded-xl" />
            <span className="text-sm font-semibold text-[var(--color-text-primary)] tracking-tight">
              ZZIK
            </span>
          </div>
          <div className="text-xs text-[var(--color-text-tertiary)]">
            단계 1 / 3
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="sticky top-14 z-40 bg-[var(--color-surface-base)] border-b border-[var(--color-border-primary)]">
        <div className="container mx-auto max-w-3xl px-6 py-3">
          <div className="relative h-2 bg-[var(--color-surface-elevated)] rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-hover)] transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--color-text-tertiary)] text-center">
            {Math.round(overallProgress)}% 완료
          </p>
        </div>
      </div>

      <section className="container mx-auto max-w-3xl px-6 py-12 space-y-8">
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-semibold text-[var(--color-text-primary)]">
            {providerName} 데이터를 불러오는 중이에요
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            평균 42초 정도 소요됩니다.
          </p>
        </div>

        {/* Timeout Warning Banner (90s SSE Timeout) */}
        {timeoutWarning && !canContinue && (
          <div
            className="frosted-medium border border-yellow-500/30 rounded-xl p-6 space-y-4"
            role="alert"
          >
            <div className="flex items-start gap-3">
              <div className="size-10 bg-yellow-500/10 rounded-full flex items-center justify-center shrink-0">
                <svg
                  className="size-5 text-yellow-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-yellow-500 mb-1">
                  네트워크가 잠시 지연되고 있습니다
                </p>
                <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                  작업은 <strong className="text-[var(--color-text-primary)]">백그라운드에서 계속 진행</strong>되며 완료되면 알림을 드릴게요.
                  다른 단계로 이동해도 동기화가 계속됩니다.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/onboarding/profile-confirm"
                    className="inline-flex h-10 items-center px-4 rounded-lg bg-[var(--color-accent-primary)] text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] transition-colors"
                  >
                    백그라운드 계속
                  </Link>
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex h-10 items-center px-4 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)] text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-raised)] transition-colors"
                  >
                    새로고침
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Phase Cards */}
        <div className="space-y-4">
          {phases.map((phase, idx) => (
            <div
              key={idx}
              className="p-6 bg-[var(--color-surface-elevated)] border border-[var(--color-border-primary)] rounded-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`size-8 rounded-full flex items-center justify-center ${
                      phase.status === "completed"
                        ? "bg-green-500/20"
                        : phase.status === "in_progress"
                          ? "bg-[var(--color-accent-bg)]"
                          : "bg-[var(--color-surface-raised)]"
                    }`}
                  >
                    {phase.status === "completed" ? (
                      <svg
                        className="size-5 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : phase.status === "in_progress" ? (
                      <div className="size-4 border-2 border-[var(--color-accent-primary)] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <div className="size-2 bg-[var(--color-text-tertiary)] rounded-full" />
                    )}
                  </div>
                  <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
                    {phase.name}
                  </h3>
                </div>
                <span className="text-sm text-[var(--color-text-tertiary)]">
                  {phase.progress}%
                </span>
              </div>
              {phase.status === "in_progress" && (
                <div className="h-1.5 bg-[var(--color-surface-raised)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-accent-primary)] transition-all duration-300"
                    style={{ width: `${phase.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-4 pt-6">
          {canContinue ? (
            <Link
              href="/onboarding/profile-confirm"
              className="inline-flex h-12 items-center rounded-lg bg-[var(--color-accent-primary)] px-8 font-medium text-[oklch(10%_0_0)] transition-all duration-200 hover:bg-[var(--color-accent-hover)] active:scale-[0.98]"
            >
              다음 단계로
            </Link>
          ) : (
            <button
              disabled
              className="inline-flex h-12 items-center rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border-primary)] px-8 font-medium text-[var(--color-text-tertiary)] cursor-not-allowed"
            >
              데이터 동기화 중...
            </button>
          )}
          <p className="text-xs text-[var(--color-text-tertiary)] text-center max-w-md">
            {canContinue
              ? "필수 데이터 수집이 완료되었습니다."
              : "백그라운드에서 진행 중이므로 다른 탭으로 이동해도 괜찮습니다."}
          </p>
        </div>
      </section>

      <footer className="container mx-auto max-w-7xl px-6 py-12 text-[var(--color-text-tertiary)] text-sm text-center">
        © ZZIK — local short-form missions
      </footer>
    </main>
  );
}

export default function SyncStatusPage() {
  return (
    <Suspense fallback={
      <main className="min-h-dvh bg-[var(--color-surface-base)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="size-12 border-4 border-[var(--color-accent-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[var(--color-text-secondary)]">로딩 중...</p>
        </div>
      </main>
    }>
      <SyncStatusContent />
    </Suspense>
  );
}
