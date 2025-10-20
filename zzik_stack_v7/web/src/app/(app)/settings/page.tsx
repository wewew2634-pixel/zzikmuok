"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    newMission: true,
    payoutComplete: true,
    marketing: false,
  });

  const [reauthStatus, setReauthStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleReauth = (provider: "instagram" | "tiktok") => {
    setReauthStatus("loading");
    // Simulate re-authentication
    setTimeout(() => {
      setReauthStatus("success");
      setTimeout(() => setReauthStatus("idle"), 2000);
    }, 1500);
  };

  return (
    <main className="min-h-dvh bg-[var(--color-surface-base)] text-[var(--color-text-primary)]">
      <div className="container mx-auto max-w-4xl px-6 py-16">
        {/* Header */}
        <header className="mb-12">
          <h1 className="font-[var(--font-display)] text-4xl font-semibold tracking-tight">
            설정
          </h1>
          <p className="mt-2 text-base text-[var(--color-text-secondary)]">
            계정 정보, 알림, 보안 설정을 관리하세요
          </p>
        </header>

        <div className="space-y-8">
          {/* Account Section */}
          <section className="rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)]/60 p-6">
            <h2 className="mb-6 text-lg font-semibold text-[var(--color-text-primary)]">
              계정 정보
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-surface-raised)]/60 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                    <svg className="size-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      Instagram 계정
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      @seoul_foodie · 연결됨
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleReauth("instagram")}
                  disabled={reauthStatus === "loading"}
                  className="rounded-lg border border-[var(--color-border-primary)] px-4 py-2 text-xs font-medium text-[var(--color-text-secondary)] transition-colors duration-200 hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {reauthStatus === "loading"
                    ? "재인증 중..."
                    : reauthStatus === "success"
                      ? "완료!"
                      : "재인증"}
                </button>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-surface-raised)]/60 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-black via-gray-900 to-teal-500">
                    <svg className="size-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      TikTok 계정
                    </p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">
                      연결되지 않음
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-lg bg-[var(--color-accent-primary)] px-4 py-2 text-xs font-medium text-[oklch(10%_0_0)] transition-all duration-200 hover:bg-[var(--color-accent-hover)]"
                >
                  연결하기
                </button>
              </div>
            </div>
          </section>

          {/* Payout Section */}
          <section className="rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)]/60 p-6">
            <h2 className="mb-6 text-lg font-semibold text-[var(--color-text-primary)]">
              정산 계좌
            </h2>

            <div className="space-y-4">
              <div className="rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-surface-raised)]/60 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      KB국민은행
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      ***********1234
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-xs font-medium text-[var(--color-accent-primary)] hover:underline"
                  >
                    변경
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-blue-500/10 p-4 text-xs text-blue-400">
                <p className="font-medium">🔒 AES-256 암호화로 안전하게 보호됩니다</p>
                <p className="mt-1 text-blue-400/80">
                  정산은 T+0 기준으로 미션 완료 후 1일 내 자동 지급됩니다.
                </p>
              </div>
            </div>
          </section>

          {/* Notification Settings */}
          <section className="rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)]/60 p-6">
            <h2 className="mb-6 text-lg font-semibold text-[var(--color-text-primary)]">
              알림 설정
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    새 미션 알림
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    3km 반경 신규 미션 등록 시 알림을 받습니다
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.newMission}
                  onChange={(e) =>
                    setNotifications({ ...notifications, newMission: e.target.checked })
                  }
                  className="size-5 accent-[var(--color-accent-primary)]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    정산 완료 알림
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    정산 입금 완료 시 알림을 받습니다
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.payoutComplete}
                  onChange={(e) =>
                    setNotifications({ ...notifications, payoutComplete: e.target.checked })
                  }
                  className="size-5 accent-[var(--color-accent-primary)]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    마케팅 알림
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    이벤트 및 프로모션 정보를 받습니다
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.marketing}
                  onChange={(e) =>
                    setNotifications({ ...notifications, marketing: e.target.checked })
                  }
                  className="size-5 accent-[var(--color-accent-primary)]"
                />
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6">
            <h2 className="mb-4 text-lg font-semibold text-red-400">위험 구역</h2>
            <p className="mb-4 text-xs text-[var(--color-text-secondary)]">
              계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
            </p>
            <button
              type="button"
              className="rounded-lg border border-red-500/50 px-4 py-2 text-sm font-medium text-red-400 transition-colors duration-200 hover:bg-red-500/10"
            >
              계정 삭제
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}
