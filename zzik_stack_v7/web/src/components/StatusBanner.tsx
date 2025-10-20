'use client';

import { useEffect, useState } from 'react';
import { TFetchError, getErrorMessage } from '@/lib/tfetch';

export interface StatusBannerProps {
  error?: TFetchError | null;
  message?: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

/**
 * StatusBanner - User-friendly error/status message banner
 * 
 * Displays at the top of the page with appropriate styling based on type
 * Supports auto-close and manual dismiss
 * 
 * @example
 * ```tsx
 * // With error type
 * <StatusBanner error="TIMEOUT" />
 * 
 * // With custom message
 * <StatusBanner type="success" message="데이터가 저장되었습니다" />
 * 
 * // Auto-close after 5 seconds
 * <StatusBanner 
 *   type="info" 
 *   message="처리 중입니다..." 
 *   autoClose 
 *   autoCloseDelay={5000} 
 * />
 * ```
 */
export function StatusBanner({
  error,
  message,
  type = 'error',
  onClose,
  autoClose = false,
  autoCloseDelay = 5000,
}: StatusBannerProps) {
  const [visible, setVisible] = useState(true);

  // Auto-close logic
  useEffect(() => {
    if (autoClose && visible) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, visible, onClose]);

  // Get message from error type or use custom message
  const displayMessage = message || (error ? getErrorMessage(error) : '');

  if (!visible || !displayMessage) return null;

  // Style based on type
  const styles = {
    error: {
      bg: 'bg-[var(--color-error)]/10',
      border: 'border-[var(--color-error)]/30',
      text: 'text-[var(--color-error)]',
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    warning: {
      bg: 'bg-[var(--color-warning)]/10',
      border: 'border-[var(--color-warning)]/30',
      text: 'text-[var(--color-warning)]',
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
    info: {
      bg: 'bg-[var(--color-info)]/10',
      border: 'border-[var(--color-info)]/30',
      text: 'text-[var(--color-info)]',
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    success: {
      bg: 'bg-[var(--color-success)]/10',
      border: 'border-[var(--color-success)]/30',
      text: 'text-[var(--color-success)]',
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  };

  const style = styles[type];

  return (
    <div
      className={`fixed top-0 inset-x-0 z-[var(--z-toast)] safe-area-top`}
      role="alert"
      aria-live="assertive"
    >
      <div
        className={`
          ${style.bg} ${style.border} ${style.text}
          frosted-medium border-b
          transition-all duration-300
          animate-in slide-in-from-top
        `}
      >
        <div className="container mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Icon + Message */}
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-shrink-0">{style.icon}</div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                {displayMessage}
              </p>
            </div>

            {/* Action buttons based on error type */}
            {error === 'AUTH' && (
              <a
                href="/oauth/select"
                className="flex-shrink-0 px-4 py-2 bg-[var(--color-accent-primary)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors"
              >
                다시 연결
              </a>
            )}

            {error === 'TIMEOUT' && (
              <button
                onClick={() => window.location.reload()}
                className="flex-shrink-0 px-4 py-2 bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] text-sm font-semibold rounded-lg hover:bg-[var(--color-surface-elevated)] transition-colors border border-[var(--color-border-secondary)]"
              >
                다시 시도
              </button>
            )}

            {/* Close button */}
            <button
              onClick={() => {
                setVisible(false);
                onClose?.();
              }}
              className="flex-shrink-0 p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="닫기"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * useStatusBanner hook for managing banner state
 * 
 * @example
 * ```tsx
 * const { showBanner, bannerProps, hideBanner } = useStatusBanner();
 * 
 * async function loadData() {
 *   try {
 *     const response = await tfetch('/api/data');
 *     const data = await response.json();
 *   } catch (error) {
 *     showBanner({
 *       error: categorizeError(error),
 *     });
 *   }
 * }
 * 
 * return (
 *   <>
 *     <StatusBanner {...bannerProps} onClose={hideBanner} />
 *     <YourComponent />
 *   </>
 * );
 * ```
 */
export function useStatusBanner() {
  const [bannerProps, setBannerProps] = useState<StatusBannerProps | null>(null);

  const showBanner = (props: StatusBannerProps) => {
    setBannerProps(props);
  };

  const hideBanner = () => {
    setBannerProps(null);
  };

  return {
    showBanner,
    hideBanner,
    bannerProps: bannerProps
      ? { ...bannerProps, onClose: hideBanner }
      : null,
  };
}

/**
 * Global StatusBanner provider component
 * Place in root layout to show banners app-wide
 */
export function StatusBannerProvider({ children }: { children: React.ReactNode }) {
  const { bannerProps } = useStatusBanner();

  return (
    <>
      {bannerProps && <StatusBanner {...bannerProps} />}
      {children}
    </>
  );
}
