import Script from "next/script";

export default function Home() {
  return (
    <>
      <main className="min-h-dvh bg-[var(--color-surface-base)] text-[var(--color-text-primary)]">
        {/* Skip Link */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-6 focus:z-50 focus:px-3 focus:py-2 focus:rounded-lg focus:bg-[var(--color-accent-primary)] focus:text-[oklch(10%_0_0)]"
        >
          본문으로 건너뛰기
        </a>

        {/* Navigation - Linear Style */}
        <header className="sticky top-0 z-50 h-14 border-b border-[var(--color-border-primary)] backdrop-blur-xl backdrop-saturate-150 bg-[var(--color-surface-base)]/80">
          <div className="container mx-auto max-w-7xl h-full px-6 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="size-8 bg-gradient-to-br from-[var(--color-accent-light)] to-[var(--color-accent-hover)] rounded-xl" />
              <span className="text-sm font-semibold text-[var(--color-text-primary)] tracking-tight">
                ZZIK
              </span>
            </div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-6" aria-label="주요 메뉴">
              <a
                className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors duration-200"
                href="#features"
              >
                Features
              </a>
              <a
                className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors duration-200"
                href="#showcase"
              >
                Showcase
              </a>
              <a
                className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors duration-200"
                href="#chat"
              >
                Chat
              </a>
              <button className="h-9 px-4 bg-[var(--color-accent-primary)] text-[oklch(10%_0_0)] text-sm font-medium rounded-lg hover:bg-[var(--color-accent-hover)] active:scale-[0.98] transition-all duration-200">
                시작하기
              </button>
            </nav>
          </div>
        </header>

        {/* Hero Section - Linear 2025 Style */}
        <section
          id="main"
          className="relative min-h-[600px] flex items-center overflow-hidden bg-[radial-gradient(ellipse_at_top,oklch(18%_0.1_240),oklch(12%_0.02_240))]"
        >
          {/* Noise Texture */}
          <div className="absolute inset-0 -z-10 opacity-[0.03] mix-blend-overlay pointer-events-none" 
               style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")"}} 
          />

          <div className="container mx-auto max-w-7xl px-6 py-20">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
              {/* Left Content */}
              <div className="md:col-span-5 space-y-6">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--color-surface-elevated)] border border-[var(--color-border-primary)] rounded-full">
                  <div className="size-1.5 rounded-full bg-[var(--color-accent-primary)] animate-pulse" />
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    3km · 오늘 정산
                  </span>
                </div>

                {/* Headline */}
                <h1 className="font-[var(--font-display)] font-semibold text-5xl md:text-6xl leading-[1.1] tracking-[-0.02em] text-[var(--color-text-primary)]">
                  로컬 숏폼{" "}
                  <span className="bg-gradient-to-r from-[oklch(75%_0.15_166)] to-[oklch(67%_0.15_166)] bg-clip-text text-transparent">
                    즉시 매칭
                  </span>
                </h1>

                {/* Description */}
                <p className="text-lg leading-relaxed text-[var(--color-text-secondary)] max-w-prose">
                  찍고 올리고 승인되면 바로 정산. ZZIK은 근처 크리에이터와 상점을 5분 내
                  연결합니다.
                </p>

                {/* CTA Buttons */}
                <div className="flex items-center gap-4">
                  <button className="h-12 px-6 bg-[var(--color-accent-primary)] text-[oklch(10%_0_0)] font-medium rounded-lg shadow-md hover:bg-[var(--color-accent-hover)] hover:shadow-lg active:scale-[0.98] transition-all duration-200">
                    무료로 시작
                  </button>
                  <button className="h-12 px-6 bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] font-medium rounded-lg border border-[var(--color-border-primary)] hover:bg-[var(--color-surface-elevated)]/80 active:scale-[0.98] transition-all duration-200">
                    라이브 데모
                  </button>
                </div>

                {/* Stats with Hairline */}
                <div className="relative pt-8 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[var(--color-border-primary)] before:to-transparent">
                  <dl className="grid grid-cols-3 gap-6">
                    <div>
                      <dt className="text-xs text-[var(--color-text-tertiary)] mb-1">
                        당일 정산
                      </dt>
                      <dd className="text-2xl font-semibold text-[var(--color-text-primary)]">
                        T+0
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[var(--color-text-tertiary)] mb-1">
                        매칭 SLA
                      </dt>
                      <dd className="text-2xl font-semibold text-[var(--color-text-primary)]">
                        5분
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[var(--color-text-tertiary)] mb-1">
                        대비 게이트
                      </dt>
                      <dd className="text-2xl font-semibold text-[var(--color-text-primary)]">
                        ≥4.5:1
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Right Visual - Glass Card */}
              <div className="md:col-span-7 relative">
                {/* Glow Effect */}
                <div className="absolute -inset-8 rounded-3xl opacity-40 blur-3xl bg-[radial-gradient(60%_50%_at_30%_20%,oklch(71%_0.15_166_/_0.3),transparent_70%)] pointer-events-none" />

                {/* Glass Card */}
                <div className="relative p-8 bg-[var(--color-surface-elevated)]/75 backdrop-blur-2xl backdrop-saturate-150 border border-[var(--color-border-primary)] rounded-2xl shadow-2xl">
                  {/* Main Skeleton */}
                  <div className="h-64 md:h-80 mb-4 bg-[var(--color-surface-raised)] rounded-xl animate-pulse" />

                  {/* Grid Skeletons */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="h-24 bg-[var(--color-surface-raised)] rounded-lg animate-pulse" />
                    <div className="h-24 bg-[var(--color-surface-raised)] rounded-lg animate-pulse" />
                    <div className="h-24 bg-[var(--color-surface-raised)] rounded-lg animate-pulse" />
                  </div>

                  {/* Button Skeletons with Hairline */}
                  <div className="relative pt-6 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[var(--color-border-primary)] before:to-transparent">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-10 bg-[var(--color-surface-raised)] rounded-lg animate-pulse" />
                      <div className="h-10 bg-[var(--color-surface-raised)] rounded-lg animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Linear 3-Column */}
        <section
          id="features"
          className="py-24 bg-[var(--color-surface-base)]"
        >
          <div className="container mx-auto max-w-7xl px-6">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "즉시 매칭",
                  desc: "반경·가게 가중치·과거 성과 기반 실시간 후보 10명.",
                },
                {
                  title: "정책/리스크 가드",
                  desc: "콘텐츠·위치·결제 규칙 자동 검증.",
                },
                {
                  title: "T+0 정산",
                  desc: "승인 즉시 정산, 창구 비용↓ 체감↑.",
                },
              ].map((feature, i) => (
                <article
                  key={i}
                  className="group relative p-6 bg-[var(--color-surface-elevated)] border border-[var(--color-border-primary)] rounded-xl hover:border-[var(--color-accent-primary)]/30 hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Icon Placeholder */}
                  <div className="size-10 mb-4 bg-[var(--color-accent-bg)] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="size-5 bg-[var(--color-accent-primary)] rounded" />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    {feature.desc}
                  </p>

                  {/* Bottom Hairline */}
                  <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[var(--color-border-primary)] to-transparent" />
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Showcase Section */}
        <section
          id="showcase"
          className="py-24 bg-[var(--color-surface-base)]"
        >
          <div className="container mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-4">
                <h2 className="text-3xl font-semibold text-[var(--color-text-primary)] mb-3">
                  실제 흐름
                </h2>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  캠페인 생성 → 매칭 → 업로드 → 승인/정산.
                </p>
              </div>
              <div className="md:col-span-8 grid grid-cols-2 gap-4">
                <div className="h-40 bg-[var(--color-surface-raised)] rounded-xl animate-pulse" />
                <div className="h-40 bg-[var(--color-surface-raised)] rounded-xl animate-pulse" />
                <div className="h-40 bg-[var(--color-surface-raised)] rounded-xl animate-pulse" />
                <div className="h-40 bg-[var(--color-surface-raised)] rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Glass Style */}
        <section className="py-24 bg-[var(--color-surface-base)]">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="p-8 bg-[var(--color-surface-elevated)]/75 backdrop-blur-2xl backdrop-saturate-150 border border-[var(--color-border-primary)] rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-2">
                  오늘 찍고, 오늘 정산
                </h3>
                <p className="text-[var(--color-text-secondary)]">
                  3km 로컬 숏폼 미션을 지금 시작하세요.
                </p>
              </div>
              <div className="flex gap-4">
                <button className="h-12 px-6 bg-[var(--color-accent-primary)] text-[oklch(10%_0_0)] font-medium rounded-lg hover:bg-[var(--color-accent-hover)] active:scale-[0.98] transition-all duration-200">
                  무료 시작
                </button>
                <button className="h-12 px-6 bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] font-medium rounded-lg border border-[var(--color-border-primary)] hover:bg-[var(--color-surface-elevated)]/80 active:scale-[0.98] transition-all duration-200">
                  문의
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Chat Section */}
        <section
          id="chat"
          className="py-24 bg-[var(--color-surface-base)]"
        >
          <div className="container mx-auto max-w-3xl px-6">
            <h2 className="text-3xl font-semibold text-[var(--color-text-primary)] mb-8 text-center">
              AI 어시스턴트 (실시간 스트리밍)
            </h2>
            <form
              id="chat-form"
              className="p-6 bg-[var(--color-surface-elevated)] border border-[var(--color-border-primary)] rounded-xl"
            >
              <div id="chat-history" className="mb-6 space-y-3 min-h-[200px] max-h-[400px] overflow-y-auto" />
              <div className="flex gap-3">
                <input
                  type="text"
                  id="chat-input"
                  placeholder="메시지 입력..."
                  className="flex-1 h-10 px-3 bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] text-sm border border-[var(--color-border-primary)] rounded-lg placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent-primary)] focus:ring-2 focus:ring-[var(--color-accent-primary)]/20 focus:outline-none transition-all duration-200"
                  aria-describedby="chat-help"
                />
                <button
                  type="submit"
                  className="h-10 px-4 bg-[var(--color-accent-primary)] text-[oklch(10%_0_0)] font-medium rounded-lg hover:bg-[var(--color-accent-hover)] active:scale-[0.98] transition-all duration-200"
                >
                  전송
                </button>
              </div>
              <p id="chat-help" className="mt-2 text-xs text-[var(--color-text-tertiary)]">
                실험기능 · 응답은 스트리밍으로 표시됩니다.
              </p>
              <noscript className="block mt-2 text-xs text-red-400">
                자바스크립트를 활성화해야 채팅이 동작합니다.
              </noscript>
            </form>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto max-w-7xl px-6 py-12 text-[var(--color-text-tertiary)] text-sm text-center">
          © ZZIK — local short-form missions
        </footer>
      </main>

      {/* Chat Client Script */}
      <Script src="/chat.js" strategy="afterInteractive" />
    </>
  );
}
