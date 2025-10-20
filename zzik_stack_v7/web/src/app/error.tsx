/**
 * Custom Error Boundary (500 Internal Server Error)
 * 
 * Catches unhandled errors and displays user-friendly message.
 * Automatically reports errors to monitoring system.
 * Linear 2025 Dark Frosted design.
 * 
 * Phase 9: Error Pages
 * Created: 2025-10-18
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { trackError } from '@/lib/track';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring system
    console.error('[error-boundary]', error);

    // Track error event
    trackError(error, {
      error_boundary: 'root',
      digest: error.digest,
    });
  }, [error]);

  return (
    <main className="min-h-dvh bg-[var(--color-surface-base)] text-[var(--color-text-primary)] flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Error Icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 opacity-20 blur-3xl rounded-full" />
          <div className="relative size-24 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
            <svg
              className="size-12 text-red-500"
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
        </div>

        {/* Title & Description */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-semibold text-[var(--color-text-primary)]">
            문제가 발생했습니다
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-md mx-auto">
            예상치 못한 오류가 발생했어요. 잠시 후 다시 시도해 주세요.
          </p>
        </div>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="card-frosted p-6 text-left space-y-2 max-w-xl mx-auto border-red-500/20">
            <p className="text-sm font-semibold text-red-500">
              개발 모드 오류 정보:
            </p>
            <pre className="text-xs text-[var(--color-text-tertiary)] overflow-x-auto whitespace-pre-wrap break-words">
              {error.message}
            </pre>
            {error.digest && (
              <p className="text-xs text-[var(--color-text-tertiary)]">
                Error Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          {/* Retry Button */}
          <button
            onClick={reset}
            className="btn-primary flex items-center gap-2 group"
          >
            <svg
              className="size-5 transition-transform group-hover:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>다시 시도</span>
          </button>

          {/* Home Button */}
          <Link
            href="/"
            className="inline-flex h-12 items-center rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)] px-6 font-medium text-[var(--color-text-primary)] transition-all duration-200 hover:bg-[var(--color-surface-raised)] active:scale-[0.98]"
          >
            홈으로 이동
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4">
          {/* Status Page */}
          <a
            href="https://status.zzik.app"
            target="_blank"
            rel="noopener noreferrer"
            className="card-frosted p-4 hover:depth-2 transition-all space-y-1"
          >
            <p className="text-sm font-semibold">서비스 상태</p>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              실시간 운영 현황 확인
            </p>
          </a>

          {/* Help Center */}
          <Link
            href="/help"
            className="card-frosted p-4 hover:depth-2 transition-all space-y-1"
          >
            <p className="text-sm font-semibold">도움말</p>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              자주 묻는 질문 보기
            </p>
          </Link>

          {/* Contact Support */}
          <a
            href="mailto:support@zzik.app"
            className="card-frosted p-4 hover:depth-2 transition-all space-y-1"
          >
            <p className="text-sm font-semibold">고객센터</p>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              support@zzik.app
            </p>
          </a>
        </div>

        {/* Additional Info */}
        <div className="text-sm text-[var(--color-text-tertiary)] space-y-1">
          <p>이 오류는 자동으로 기록되었으며 팀에서 검토할 예정입니다.</p>
          {error.digest && (
            <p className="text-xs">
              문제 ID: <code className="font-mono">{error.digest}</code>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
