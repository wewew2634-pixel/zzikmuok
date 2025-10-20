/**
 * tfetch - Timeout-enabled fetch wrapper
 * Global network layer with 8s timeout, automatic retry, and error categorization
 */

/* eslint-disable no-restricted-globals */

export type TFetchError = 'TIMEOUT' | 'NETWORK' | 'SERVER' | 'AUTH' | 'UNKNOWN';

export interface TFetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export class TFetchTimeoutError extends Error {
  constructor(message: string, public readonly type: TFetchError = 'TIMEOUT') {
    super(message);
    this.name = 'TFetchTimeoutError';
  }
}

export class TFetchNetworkError extends Error {
  constructor(message: string, public readonly type: TFetchError = 'NETWORK') {
    super(message);
    this.name = 'TFetchNetworkError';
  }
}

export class TFetchServerError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly type: TFetchError = 'SERVER'
  ) {
    super(message);
    this.name = 'TFetchServerError';
  }
}

export class TFetchAuthError extends Error {
  constructor(message: string, public readonly type: TFetchError = 'AUTH') {
    super(message);
    this.name = 'TFetchAuthError';
  }
}

/**
 * Categorize error for user-friendly messaging
 */
export function categorizeError(error: any): TFetchError {
  if (error?.name === 'AbortError') return 'TIMEOUT';
  if (error?.name === 'TFetchTimeoutError') return 'TIMEOUT';
  if (error?.name === 'TFetchAuthError') return 'AUTH';
  if (error?.name === 'TFetchServerError') return 'SERVER';
  if (error?.name === 'TFetchNetworkError') return 'NETWORK';
  if (error?.message?.includes('fetch')) return 'NETWORK';
  if (error?.message?.includes('network')) return 'NETWORK';
  return 'UNKNOWN';
}

/**
 * Get user-friendly error message (Korean)
 */
export function getErrorMessage(errorType: TFetchError): string {
  const messages: Record<TFetchError, string> = {
    TIMEOUT: '응답이 지연되고 있어요. 잠시 후 다시 시도해 주세요.',
    NETWORK: '네트워크 연결을 확인해 주세요.',
    SERVER: '서버가 일시적으로 응답하지 않아요. 잠시 후 다시 시도해 주세요.',
    AUTH: '권한이 만료되었어요. 다시 연결해 주세요.',
    UNKNOWN: '문제가 발생했어요. 잠시 후 다시 시도해 주세요.',
  };
  return messages[errorType];
}

/**
 * Sleep utility for retry delay
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Main tfetch function with timeout, retry, and error handling
 * 
 * @param input - URL or Request object
 * @param options - Extended RequestInit with timeout and retry options
 * @returns Promise<Response>
 * 
 * @example
 * ```typescript
 * // Basic usage with default 8s timeout
 * const response = await tfetch('/api/missions');
 * 
 * // Custom timeout and retries
 * const response = await tfetch('/api/slow-endpoint', {
 *   timeout: 15000,  // 15 seconds
 *   retries: 2,      // Retry twice on failure
 * });
 * 
 * // With error handling
 * try {
 *   const response = await tfetch('/api/data');
 *   const data = await response.json();
 * } catch (error) {
 *   const errorType = categorizeError(error);
 *   const message = getErrorMessage(errorType);
 *   console.error(message);
 * }
 * ```
 */
export async function tfetch(
  input: RequestInfo | URL,
  options: TFetchOptions = {}
): Promise<Response> {
  const {
    timeout = 8000,      // Default 8 second timeout
    retries = 1,         // Default 1 retry
    retryDelay = 1000,   // Default 1 second between retries
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;
  const maxAttempts = retries + 1;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // Merge abort signal with existing signal if provided
      const signal = fetchOptions.signal
        ? combineSignals([controller.signal, fetchOptions.signal])
        : controller.signal;

      // Execute fetch with timeout
      const response = await fetch(input, {
        ...fetchOptions,
        signal,
        cache: fetchOptions.cache || 'no-store', // Default to no-store for API calls
      });

      clearTimeout(timeoutId);

      // Handle HTTP error status codes
      if (!response.ok) {
        // 401/403 - Authentication/Authorization errors
        if (response.status === 401 || response.status === 403) {
          throw new TFetchAuthError(
            `인증 오류: ${response.status}`,
            'AUTH'
          );
        }

        // 5xx - Server errors
        if (response.status >= 500) {
          throw new TFetchServerError(
            `서버 오류: ${response.status}`,
            response.status,
            'SERVER'
          );
        }

        // 4xx - Client errors (other than auth)
        throw new TFetchServerError(
          `요청 오류: ${response.status}`,
          response.status,
          'SERVER'
        );
      }

      // Success - return response
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);

      // Categorize error
      if (error.name === 'AbortError') {
        lastError = new TFetchTimeoutError(
          `요청 시간 초과 (${timeout}ms)`,
          'TIMEOUT'
        );
      } else if (error instanceof TFetchAuthError) {
        // Auth errors should not be retried
        throw error;
      } else if (error instanceof TFetchServerError) {
        lastError = error;
      } else {
        lastError = new TFetchNetworkError(
          '네트워크 오류',
          'NETWORK'
        );
      }

      // Retry logic
      const isLastAttempt = attempt === maxAttempts - 1;
      if (!isLastAttempt) {
        // Wait before retrying
        await sleep(retryDelay);
        continue;
      }

      // Last attempt failed - throw error
      throw lastError;
    }
  }

  // Should never reach here, but TypeScript needs it
  throw lastError || new Error('Unknown error');
}

/**
 * Combine multiple AbortSignals into one
 */
function combineSignals(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      break;
    }
    signal.addEventListener('abort', () => controller.abort());
  }

  return controller.signal;
}

/**
 * Convenience wrapper for JSON requests
 */
export async function tfetchJson<T = any>(
  input: RequestInfo | URL,
  options: TFetchOptions = {}
): Promise<T> {
  const response = await tfetch(input, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * POST request helper
 */
export async function tfetchPost<T = any>(
  input: RequestInfo | URL,
  data: any,
  options: TFetchOptions = {}
): Promise<T> {
  return tfetchJson<T>(input, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT request helper
 */
export async function tfetchPut<T = any>(
  input: RequestInfo | URL,
  data: any,
  options: TFetchOptions = {}
): Promise<T> {
  return tfetchJson<T>(input, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request helper
 */
export async function tfetchDelete<T = any>(
  input: RequestInfo | URL,
  options: TFetchOptions = {}
): Promise<T> {
  return tfetchJson<T>(input, {
    ...options,
    method: 'DELETE',
  });
}
