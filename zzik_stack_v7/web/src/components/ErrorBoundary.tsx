"use client";

import React, { Component, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo);
    // 여기서 Sentry 등 에러 리포팅 서비스에 전송 가능
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) {
  const isNetworkError =
    error.message.includes("fetch") ||
    error.message.includes("network") ||
    error.message.includes("timeout");

  const isAuthError =
    error.message.includes("401") ||
    error.message.includes("403") ||
    error.message.includes("unauthorized");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface-base)] px-6">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)]/80 p-8 text-center">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-red-500/10 text-3xl">
            {isNetworkError ? "📡" : isAuthError ? "🔒" : "⚠️"}
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
            {isNetworkError
              ? "네트워크 오류"
              : isAuthError
                ? "인증 오류"
                : "문제가 발생했습니다"}
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            {isNetworkError
              ? "인터넷 연결을 확인하고 다시 시도해주세요."
              : isAuthError
                ? "다시 로그인이 필요합니다."
                : "예상치 못한 오류가 발생했습니다."}
          </p>
        </div>

        {/* Error Details (Development) */}
        {process.env.NODE_ENV === "development" && (
          <details className="rounded-xl bg-[var(--color-surface-raised)] p-4 text-left">
            <summary className="cursor-pointer text-xs font-medium text-[var(--color-text-tertiary)]">
              개발자 정보
            </summary>
            <pre className="mt-2 overflow-auto text-xs text-red-400">
              {error.message}
            </pre>
          </details>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={resetError}
            className="w-full rounded-lg bg-[var(--color-accent-primary)] px-4 py-3 text-sm font-medium text-[oklch(10%_0_0)] transition-all duration-200 hover:bg-[var(--color-accent-hover)] active:scale-98"
          >
            다시 시도
          </button>

          {isAuthError && (
            <button
              type="button"
              onClick={() => {
                window.location.href = "/auth/oauth/select";
              }}
              className="w-full rounded-lg border border-[var(--color-border-primary)] px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)] transition-colors duration-200 hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]"
            >
              로그인하기
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            className="w-full text-sm text-[var(--color-text-tertiary)] transition-colors duration-200 hover:text-[var(--color-text-primary)]"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
