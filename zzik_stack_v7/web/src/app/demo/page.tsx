import Link from "next/link";
import { formatNumber, mockCreators } from "@/lib/mock-data";

const sampleMissions = [
  {
    id: "demo-1",
    title: "강남 카페 신메뉴 홍보",
    location: "강남구 역삼동",
    distance: "1.2km",
    reward: 180000,
    deadline: "2일 남음",
    requirements: ["릴스 15초 이상", "해시태그 3개 필수"],
    matchScore: 94,
  },
  {
    id: "demo-2",
    title: "이태원 레스토랑 브이로그",
    location: "용산구 이태원동",
    distance: "2.8km",
    reward: 250000,
    deadline: "5일 남음",
    requirements: ["릴스 30초 이상", "매장 방문 필수"],
    matchScore: 88,
  },
  {
    id: "demo-3",
    title: "홍대 팝업스토어 체험",
    location: "마포구 서교동",
    distance: "3.0km",
    reward: 150000,
    deadline: "1일 남음",
    requirements: ["스토리 5개 이상", "제품 태그"],
    matchScore: 82,
  },
];

export default function DemoPage() {
  return (
    <main className="min-h-dvh bg-[var(--color-surface-base)] text-[var(--color-text-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 h-14 border-b border-[var(--color-border-primary)] backdrop-blur-xl backdrop-saturate-150 bg-[var(--color-surface-base)]/80">
        <div className="container mx-auto max-w-7xl h-full px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="size-8 bg-gradient-to-br from-[var(--color-accent-light)] to-[var(--color-accent-hover)] rounded-xl" />
            <span className="text-sm font-semibold text-[var(--color-text-primary)] tracking-tight">
              ZZIK
            </span>
          </Link>
          <Link
            href="/auth/oauth/select"
            className="inline-flex h-9 items-center rounded-lg bg-[var(--color-accent-primary)] px-4 text-sm font-medium text-[oklch(10%_0_0)] transition-all duration-200 hover:bg-[var(--color-accent-hover)] active:scale-[0.98]"
          >
            실제 계정 연결
          </Link>
        </div>
      </header>

      {/* Demo Banner */}
      <div className="sticky top-14 z-40 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-b border-purple-500/30">
        <div className="container mx-auto max-w-7xl px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <svg
                className="size-5 text-purple-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-purple-400">
                  샘플 데이터 모드
                </p>
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  실제 계정 연결 시 실시간 데이터로 전환됩니다
                </p>
              </div>
            </div>
            <Link
              href="/auth/oauth/select"
              className="hidden sm:inline-flex h-9 items-center gap-2 rounded-lg border border-purple-400/30 bg-purple-500/10 px-4 text-sm font-medium text-purple-400 transition-all duration-200 hover:bg-purple-500/20 active:scale-[0.98]"
            >
              <svg
                className="size-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
              Instagram 연결하기
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="container mx-auto max-w-7xl px-6 py-12 space-y-12">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-[var(--color-surface-elevated)]/70 border border-[var(--color-border-primary)] rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-10 bg-[var(--color-accent-bg)] rounded-lg flex items-center justify-center">
                <svg
                  className="size-5 text-[var(--color-accent-primary)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  추천 미션
                </p>
                <p className="text-2xl font-semibold text-[var(--color-text-primary)]">
                  {sampleMissions.length}개
                </p>
              </div>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              실제 연결 시 실시간으로 업데이트됩니다
            </p>
          </div>

          <div className="p-6 bg-[var(--color-surface-elevated)]/70 border border-[var(--color-border-primary)] rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-10 bg-[var(--color-accent-bg)] rounded-lg flex items-center justify-center">
                <svg
                  className="size-5 text-[var(--color-accent-primary)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  예상 정산액
                </p>
                <p className="text-2xl font-semibold text-[var(--color-text-primary)]">
                  ₩{formatNumber(580000)}
                </p>
              </div>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              샘플 데이터 기준 합산액
            </p>
          </div>

          <div className="p-6 bg-[var(--color-surface-elevated)]/70 border border-[var(--color-border-primary)] rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-10 bg-[var(--color-accent-bg)] rounded-lg flex items-center justify-center">
                <svg
                  className="size-5 text-[var(--color-accent-primary)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  매칭 정확도
                </p>
                <p className="text-2xl font-semibold text-[var(--color-text-primary)]">
                  92%
                </p>
              </div>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              SNS 데이터 기반 예측 정확도
            </p>
          </div>
        </div>

        {/* Missions List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
              추천 미션
            </h2>
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
              <div className="size-2 rounded-full bg-purple-400 animate-pulse" />
              샘플 데이터
            </div>
          </div>

          <div className="grid gap-4">
            {sampleMissions.map((mission) => (
              <article
                key={mission.id}
                className="group p-6 bg-[var(--color-surface-elevated)] border border-[var(--color-border-primary)] rounded-xl hover:border-[var(--color-accent-primary)]/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                        {mission.title}
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--color-accent-bg)] rounded-full text-xs font-medium text-[var(--color-accent-primary)]">
                        <svg
                          className="size-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {mission.matchScore}%
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
                      <span className="flex items-center gap-1">
                        <svg
                          className="size-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {mission.location} · {mission.distance}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg
                          className="size-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {mission.deadline}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--color-text-tertiary)] mb-1">
                      예상 보상
                    </p>
                    <p className="text-xl font-semibold text-[var(--color-accent-primary)]">
                      ₩{formatNumber(mission.reward)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {mission.requirements.map((req, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--color-surface-raised)] border border-[var(--color-border-primary)] rounded text-xs text-[var(--color-text-secondary)]"
                    >
                      <svg
                        className="size-3 text-[var(--color-accent-primary)]"
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
                      {req}
                    </span>
                  ))}
                </div>

                <button
                  disabled
                  className="w-full h-10 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-surface-raised)] text-sm font-medium text-[var(--color-text-tertiary)] cursor-not-allowed"
                >
                  SNS 연결 후 신청 가능
                </button>
              </article>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="p-8 bg-gradient-to-r from-[var(--color-accent-primary)]/10 to-purple-500/10 border border-[var(--color-accent-primary)]/30 rounded-2xl text-center space-y-4">
          <h3 className="text-2xl font-semibold text-[var(--color-text-primary)]">
            실제 계정을 연결하고 로컬 미션을 받으세요
          </h3>
          <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            Instagram이나 TikTok 계정을 연결하면 실시간 미션 추천, 자동 인사이트
            리포트, 촬영 후 T+0 정산을 받을 수 있습니다.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/auth/oauth/select"
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-[var(--color-accent-primary)] px-8 font-medium text-[oklch(10%_0_0)] transition-all duration-200 hover:bg-[var(--color-accent-hover)] active:scale-[0.98]"
            >
              <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
              지금 Instagram으로 시작
            </Link>
            <Link
              href="/auth/oauth/select"
              className="inline-flex h-12 items-center gap-2 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-surface-base)] px-8 font-medium text-[var(--color-text-primary)] transition-all duration-200 hover:bg-[var(--color-surface-elevated)] active:scale-[0.98]"
            >
              <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
              </svg>
              또는 TikTok으로 연결
            </Link>
          </div>
        </div>
      </section>

      {/* Sticky Bottom CTA (Mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-4 bg-[var(--color-surface-base)] border-t border-[var(--color-border-primary)] backdrop-blur-xl">
        <Link
          href="/auth/oauth/select"
          className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[var(--color-accent-primary)] font-medium text-[oklch(10%_0_0)] transition-all duration-200 active:scale-[0.98]"
        >
          <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
          계정 연결하고 시작하기
        </Link>
      </div>

      <footer className="container mx-auto max-w-7xl px-6 py-12 text-[var(--color-text-tertiary)] text-sm text-center">
        © ZZIK — local short-form missions
      </footer>
    </main>
  );
}
