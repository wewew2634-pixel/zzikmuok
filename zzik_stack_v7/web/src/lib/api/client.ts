/**
 * ZZIK API Client
 * ================
 * 
 * tfetch 기반 API 클라이언트
 * - 인증 헤더 자동 추가
 * - 응답 타입 안전성
 * - 에러 핸들링
 */

import { tfetch, TFetchOptions, TFetchResult } from "../tfetch";

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

// Auth Token 관리
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

// API Client 래퍼
export async function apiClient<T = any>(
  endpoint: string,
  options: TFetchOptions = {}
): Promise<TFetchResult<T>> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // 기존 헤더 병합
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (typeof value === "string") {
        headers[key] = value;
      }
    });
  }

  // 인증 토큰 자동 추가
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  return tfetch<T>(url, {
    ...options,
    headers,
  });
}

// HTTP Method 헬퍼
export const api = {
  get: <T = any>(endpoint: string, options?: TFetchOptions) =>
    apiClient<T>(endpoint, { ...options, method: "GET" }),

  post: <T = any>(endpoint: string, body?: any, options?: TFetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: <T = any>(endpoint: string, body?: any, options?: TFetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    }),

  patch: <T = any>(endpoint: string, body?: any, options?: TFetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: <T = any>(endpoint: string, options?: TFetchOptions) =>
    apiClient<T>(endpoint, { ...options, method: "DELETE" }),
};
