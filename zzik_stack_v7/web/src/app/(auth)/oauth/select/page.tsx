import Link from "next/link";

export default function OAuthSelectPage() {
  return (
    <main className="min-h-dvh bg-[var(--color-surface-base)] text-[var(--color-text-primary)]">
      {/* Skip Link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-6 focus:z-50 focus:px-3 focus:py-2 focus:rounded-lg focus:bg-[var(--color-accent-primary)] focus:text-[oklch(10%_0_0)]"
      >
        메인 콘텐츠로 이동
      </a>

      {/* Header */}
      <header className="sticky top-0 z-50 h-14 border-b border-[var(--color-border-primary)] backdrop-blur-xl backdrop-saturate-150 bg-[var(--color-surface-base)]/80">
        <div className="container mx-auto max-w-7xl h-full px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="size-8 bg-gradient-to-br from-[var(--color-accent-light)] to-[var(--color-accent-hover)] rounded-xl" />
            <span className="text-sm font-semibold text-[var(--color-text-primary)] tracking-tight">
              ZZIK
            </span>
          </Link>
        </div>
      </header>

      <section
        id="main"
        className="container mx-auto max-w-4xl px-6 py-16 space-y-8"
      >
        {/* Title */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-semibold text-[var(--color-text-primary)]">
            어떤 SNS 계정을 연결할까요?
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            연동된 SNS 데이터는 매칭 추천과 성과 분석에만 사용됩니다.
            언제든 설정에서 연동을 해제할 수 있어요.
          </p>
        </div>

        {/* OAuth Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Instagram Card */}
          <article className="group relative p-8 bg-[var(--color-surface-elevated)] border border-[var(--color-border-primary)] rounded-2xl hover:border-[var(--color-accent-primary)]/40 hover:-translate-y-1 transition-all duration-300">
            <div className="space-y-6">
              {/* Icon */}
              <div className="size-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="size-10 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </div>

              {/* Title & Description */}
              <div>
                <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-2">
                  Instagram
                </h2>
                <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                  <li className="flex items-start gap-2">
                    <svg
                      className="size-5 text-[var(--color-accent-primary)] shrink-0 mt-0.5"
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
                    <span>릴스·스토리 자동 분석</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="size-5 text-[var(--color-accent-primary)] shrink-0 mt-0.5"
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
                    <span>해시태그 퍼포먼스 추적</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="size-5 text-[var(--color-accent-primary)] shrink-0 mt-0.5"
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
                    <span>3km 반경 매칭 최적화</span>
                  </li>
                </ul>
              </div>

              {/* Button */}
              <Link
                href="/auth/oauth/instagram"
                className="inline-flex w-full h-12 items-center justify-center rounded-lg bg-[var(--color-accent-primary)] font-medium text-[oklch(10%_0_0)] transition-all duration-200 hover:bg-[var(--color-accent-hover)] active:scale-[0.98]"
              >
                Instagram으로 시작
              </Link>
            </div>
          </article>

          {/* TikTok Card */}
          <article className="group relative p-8 bg-[var(--color-surface-elevated)] border border-[var(--color-border-primary)] rounded-2xl hover:border-[var(--color-accent-primary)]/40 hover:-translate-y-1 transition-all duration-300">
            <div className="space-y-6">
              {/* Icon */}
              <div className="size-16 bg-gradient-to-br from-black to-teal-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="size-10 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                </svg>
              </div>

              {/* Title & Description */}
              <div>
                <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-2">
                  TikTok
                </h2>
                <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                  <li className="flex items-start gap-2">
                    <svg
                      className="size-5 text-[var(--color-accent-primary)] shrink-0 mt-0.5"
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
                    <span>숏폼 영상 퍼포먼스 분석</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="size-5 text-[var(--color-accent-primary)] shrink-0 mt-0.5"
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
                    <span>참여도·완주율 스코어링</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="size-5 text-[var(--color-accent-primary)] shrink-0 mt-0.5"
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
                    <span>바이럴 콘텐츠 매칭</span>
                  </li>
                </ul>
              </div>

              {/* Button */}
              <Link
                href="/auth/oauth/tiktok"
                className="inline-flex w-full h-12 items-center justify-center rounded-lg bg-[var(--color-accent-primary)] font-medium text-[oklch(10%_0_0)] transition-all duration-200 hover:bg-[var(--color-accent-hover)] active:scale-[0.98]"
              >
                TikTok으로 시작
              </Link>
            </div>
          </article>
        </div>

        {/* Privacy & Security Info Box */}
        <div className="p-8 frosted-medium border border-[var(--color-border-primary)] rounded-xl space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 size-12 bg-[var(--color-accent-primary)]/10 rounded-full flex items-center justify-center">
              <svg className="size-6 text-[var(--color-accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
                개인정보 보호 및 권한 고지
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                ZZIK는 이용자의 개인정보를 안전하게 보호합니다
              </p>
            </div>
          </div>

          {/* Permission Details */}
          <div className="space-y-4">
            <div className="bg-[var(--color-surface-raised)] p-6 rounded-lg border border-[var(--color-border-secondary)]">
              <h4 className="font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                <span className="size-5 bg-[var(--color-accent-primary)] rounded-full flex items-center justify-center text-white text-xs font-bold">1</span>
                수집하는 정보
              </h4>
              <ul className="space-y-2 text-sm text-[var(--color-text-secondary)] ml-7">
                <li>• 프로필 정보 (이름, 사용자명, 프로필 사진)</li>
                <li>• 게시물 데이터 (이미지, 동영상, 캡션, 업로드 일시)</li>
                <li>• 성과 지표 (좋아요, 댓글, 조회 수, 참여율)</li>
                <li>• 계정 유형 및 팔로워 정보</li>
              </ul>
            </div>

            <div className="bg-[var(--color-surface-raised)] p-6 rounded-lg border border-[var(--color-border-secondary)]">
              <h4 className="font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                <span className="size-5 bg-[var(--color-accent-primary)] rounded-full flex items-center justify-center text-white text-xs font-bold">2</span>
                사용 목적
              </h4>
              <ul className="space-y-2 text-sm text-[var(--color-text-secondary)] ml-7">
                <li>• <strong className="text-[var(--color-text-primary)]">크리에이터 매칭</strong>: 지역 기반 맞춤 추천</li>
                <li>• <strong className="text-[var(--color-text-primary)]">성과 분석</strong>: 콘텐츠 퍼포먼스 인사이트 제공</li>
                <li>• <strong className="text-[var(--color-text-primary)]">서비스 개선</strong>: 매칭 알고리즘 최적화</li>
              </ul>
            </div>

            <div className="bg-[var(--color-success)]/10 p-6 rounded-lg border border-[var(--color-success)]/30">
              <h4 className="font-semibold text-[var(--color-success)] mb-3">✅ 절대 하지 않는 일</h4>
              <ul className="space-y-2 text-sm text-[var(--color-text-secondary)] ml-4">
                <li>• 제3자에게 개인정보 판매 또는 제공</li>
                <li>• 광고 목적의 데이터 활용</li>
                <li>• 사용자 동의 없는 마케팅 활동</li>
                <li>• SNS 계정으로 자동 게시물 작성</li>
              </ul>
            </div>

            <div className="bg-[var(--color-surface-raised)] p-6 rounded-lg border border-[var(--color-border-secondary)]">
              <h4 className="font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                <svg className="size-5 text-[var(--color-accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                보안 및 암호화
              </h4>
              <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                <li>• <strong className="text-[var(--color-text-primary)]">AES-256 암호화</strong>로 OAuth 토큰 저장</li>
                <li>• <strong className="text-[var(--color-text-primary)]">TLS 1.3</strong> 전송 암호화</li>
                <li>• 토큰 자동 갱신 (만료 3일 전 알림)</li>
                <li>• 정기적 보안 취약점 점검</li>
              </ul>
            </div>

            <div className="bg-[var(--color-surface-raised)] p-6 rounded-lg border border-[var(--color-border-secondary)]">
              <h4 className="font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                <svg className="size-5 text-[var(--color-accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                데이터 보관 및 삭제
              </h4>
              <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                <li>• 회원 탈퇴 시 <strong className="text-[var(--color-text-primary)]">7일 이내</strong> 데이터 삭제</li>
                <li>• 연동 해제 시 OAuth 토큰 <strong className="text-[var(--color-text-primary)]">즉시 폐기</strong></li>
                <li>• 설정에서 언제든지 연동 해제 가능</li>
                <li>• 자세한 내용: <a href="/legal/privacy" className="text-[var(--color-accent-primary)] hover:underline font-semibold">개인정보 처리방침</a></li>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="pt-4 border-t border-[var(--color-border-secondary)] flex items-center justify-between text-sm">
            <span className="text-[var(--color-text-tertiary)]">
              궁금한 점이 있으신가요?
            </span>
            <a
              href="mailto:support@zzik.com"
              className="text-[var(--color-accent-primary)] hover:underline font-semibold"
            >
              support@zzik.com
            </a>
          </div>
        </div>

        {/* Demo CTA */}
        <div className="text-center pt-4">
          <p className="text-sm text-[var(--color-text-tertiary)] mb-3">
            아직 연동이 망설여지나요?
          </p>
          <Link
            href="/demo"
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-surface-base)] px-6 font-medium text-[var(--color-text-secondary)] transition-all duration-200 hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]/50 active:scale-[0.98]"
          >
            <svg
              className="size-5"
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
            데모로 먼저 둘러보기
          </Link>
        </div>
      </section>

      <footer className="container mx-auto max-w-7xl px-6 py-12 text-[var(--color-text-tertiary)] text-sm text-center">
        © ZZIK — local short-form missions
      </footer>
    </main>
  );
}
