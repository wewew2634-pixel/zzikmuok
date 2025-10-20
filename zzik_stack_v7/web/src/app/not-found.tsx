/**
 * Custom 404 Not Found Page
 * 
 * Linear 2025 Dark Frosted design with helpful navigation.
 * WCAG 2.1 AA compliant.
 * 
 * Phase 9: Error Pages
 * Created: 2025-10-18
 */

import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - 페이지를 찾을 수 없어요 | ZZIK',
  description: '요청하신 페이지를 찾을 수 없습니다.',
};

export default function NotFound() {
  return (
    <main className="min-h-dvh bg-[var(--color-surface-base)] text-[var(--color-text-primary)] flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Error Code */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-hover)] opacity-20 blur-3xl rounded-full" />
          <h1 className="relative text-[8rem] md:text-[12rem] font-bold leading-none bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-hover)] bg-clip-text text-transparent">
            404
          </h1>
        </div>

        {/* Title & Description */}
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-semibold text-[var(--color-text-primary)]">
            페이지를 찾을 수 없어요
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-md mx-auto">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
        </div>

        {/* Suggested Actions */}
        <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {/* Home */}
          <Link
            href="/"
            className="card-frosted hover:depth-2 p-6 space-y-2 group transition-all"
          >
            <div className="size-12 bg-[var(--color-accent-primary)]/10 rounded-xl flex items-center justify-center mx-auto group-hover:bg-[var(--color-accent-primary)]/20 transition-colors">
              <svg
                className="size-6 text-[var(--color-accent-primary)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <h3 className="text-base font-semibold">홈으로</h3>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              메인 페이지로 이동
            </p>
          </Link>

          {/* Matching */}
          <Link
            href="/matching"
            className="card-frosted hover:depth-2 p-6 space-y-2 group transition-all"
          >
            <div className="size-12 bg-[var(--color-accent-primary)]/10 rounded-xl flex items-center justify-center mx-auto group-hover:bg-[var(--color-accent-primary)]/20 transition-colors">
              <svg
                className="size-6 text-[var(--color-accent-primary)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-base font-semibold">매칭</h3>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              맞춤 미션 찾기
            </p>
          </Link>

          {/* Help */}
          <Link
            href="/help"
            className="card-frosted hover:depth-2 p-6 space-y-2 group transition-all"
          >
            <div className="size-12 bg-[var(--color-accent-primary)]/10 rounded-xl flex items-center justify-center mx-auto group-hover:bg-[var(--color-accent-primary)]/20 transition-colors">
              <svg
                className="size-6 text-[var(--color-accent-primary)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-base font-semibold">도움말</h3>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              자주 묻는 질문
            </p>
          </Link>
        </div>

        {/* Primary CTA */}
        <div className="pt-4">
          <Link
            href="/"
            className="btn-primary inline-flex items-center gap-2 group"
          >
            <svg
              className="size-5 transition-transform group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>홈으로 돌아가기</span>
          </Link>
        </div>

        {/* Additional Info */}
        <div className="text-sm text-[var(--color-text-tertiary)] space-y-1">
          <p>문제가 계속되면 <a href="mailto:support@zzik.app" className="text-[var(--color-accent-primary)] hover:underline">고객센터</a>로 문의해 주세요.</p>
        </div>
      </div>
    </main>
  );
}
