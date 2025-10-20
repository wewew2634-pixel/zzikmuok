"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#1a1a25]">
        {/* Radial Gradient Orbs */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      {/* Glassmorphic Header */}
      <header className="sticky top-0 z-50 glass-strong">
        <div className="container mx-auto max-w-7xl h-16 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* 3D Logo with Glow */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#7c4dff] to-[#5e35b1] rounded-2xl blur-md group-hover:blur-lg transition-all" />
              <div className="relative size-10 bg-gradient-to-br from-[#9575ff] to-[#7c4dff] rounded-2xl flex items-center justify-center depth-2">
                <svg className="size-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent tracking-tight">
              ZZIK
            </span>
          </div>
          <Link
            href="/matching"
            className="btn-height-md px-6 rounded-xl glass hover:glass-strong transition-all text-sm font-medium text-white/80 hover:text-white border border-white/10 hover:border-purple-500/30 glow-hover flex items-center"
          >
            매칭 보드
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex items-center justify-center min-h-[calc(100dvh-4rem)] px-6">
        <div className="relative max-w-4xl mx-auto text-center space-y-12">
          {/* Status Badge with Glow */}
          <div className="inline-flex items-center gap-3 px-6 py-3 glass rounded-full border border-purple-500/30 glow">
            <div className="size-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse shadow-lg shadow-green-500/50" />
            <span className="text-sm font-semibold bg-gradient-to-r from-purple-300 to-purple-100 bg-clip-text text-transparent">
              3km 반경 · T+0 정산 · 실시간 매칭
            </span>
          </div>

          {/* Main Heading with Gradient */}
          <div className="space-y-6">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight">
              <span className="block bg-gradient-to-br from-white via-white to-white/70 bg-clip-text text-transparent">
                로컬 숏폼
              </span>
              <span className="block bg-gradient-to-r from-[#9575ff] via-[#7c4dff] to-[#b39dff] bg-clip-text text-transparent">
                즉시 매칭
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto leading-relaxed">
              Instagram·TikTok 연결하면<br className="md:hidden" /> 
              <span className="text-white/80 font-semibold"> 주변 크리에이터를 5분 내 </span>
              추천합니다
            </p>
          </div>

          {/* CTA Buttons - Premium 3D Glass */}
          <div className="flex flex-col gap-4 max-w-md mx-auto pt-8">
            {/* Primary CTA - Instagram (WCAG: 48px min height) */}
            <Link
              href="/oauth/select"
              className="group relative btn-height-lg flex items-center justify-center gap-4 rounded-2xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {/* Animated Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#7c4dff] via-[#9575ff] to-[#7c4dff] bg-[length:200%_100%] animate-gradient" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              
              {/* Glow Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity glow-strong" />
              
              {/* Content */}
              <div className="relative flex items-center gap-3 px-8">
                <svg className="size-7 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
                <span className="text-xl font-bold text-white drop-shadow-lg">
                  인스타그램으로 시작
                </span>
              </div>
            </Link>

            {/* Secondary CTA - TikTok (WCAG: 48px min height) */}
            <Link
              href="/oauth/select"
              className="group relative btn-height-lg flex items-center justify-center gap-3 rounded-2xl overflow-hidden glass-strong border border-white/10 hover:border-white/20 transition-all hover:scale-[1.02] active:scale-[0.98] glow-hover"
            >
              <svg className="size-6 text-white/90" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
              </svg>
              <span className="text-lg font-bold text-white/90 group-hover:text-white transition-colors">
                틱톡으로 시작
              </span>
            </Link>

            {/* Tertiary CTA - Demo (WCAG: 44px acceptable for tertiary) */}
            <Link
              href="/demo"
              className="btn-height-md flex items-center justify-center rounded-xl border border-white/10 hover:border-purple-500/30 px-6 text-base font-semibold text-white/60 hover:text-white/90 transition-all hover:glass"
            >
              데모 먼저 둘러보기
            </Link>
          </div>

          {/* Stats - Glassmorphic Cards (Linear frosted style with 12px radius) */}
          <div className="pt-16">
            <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto">
              <div className="card-frosted border border-purple-500/20 depth-1 hover:depth-2">
                <dt className="text-sm text-white/50 mb-2 font-medium">SNS 연동</dt>
                <dd className="text-4xl font-bold bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent">
                  99.2%
                </dd>
              </div>
              <div className="card-frosted border border-purple-500/20 depth-1 hover:depth-2">
                <dt className="text-sm text-white/50 mb-2 font-medium">평균 시간</dt>
                <dd className="text-4xl font-bold bg-gradient-to-br from-purple-300 to-purple-100 bg-clip-text text-transparent">
                  42초
                </dd>
              </div>
              <div className="card-frosted border border-purple-500/20 depth-1 hover:depth-2">
                <dt className="text-sm text-white/50 mb-2 font-medium">정확도</dt>
                <dd className="text-4xl font-bold bg-gradient-to-br from-emerald-300 to-emerald-100 bg-clip-text text-transparent">
                  92%
                </dd>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 glass py-8 text-center text-sm text-white/40">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-6 text-white/50">
            <Link href="/legal/terms" className="hover:text-white/80 transition-colors underline">
              이용약관
            </Link>
            <span>·</span>
            <Link href="/legal/privacy" className="hover:text-white/80 transition-colors underline">
              개인정보 처리방침
            </Link>
            <span>·</span>
            <Link href="/legal/data-deletion" className="hover:text-white/80 transition-colors underline">
              데이터 삭제
            </Link>
          </div>
          <p>© ZZIK — 로컬 숏폼 즉시 매칭</p>
        </div>
      </footer>

      {/* CSS for Gradient Animation */}
      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </main>
  );
}
