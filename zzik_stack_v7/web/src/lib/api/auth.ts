/**
 * Auth API
 * =========
 * 
 * 인증 관련 API 엔드포인트
 */

import { api, setAuthToken } from "./client";

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    platform: "instagram" | "tiktok";
  };
}

export interface ReauthRequest {
  provider: "instagram" | "tiktok";
  code: string;
  state: string;
}

// POST /api/auth/oauth/callback - OAuth 콜백 처리
export async function handleOAuthCallback(code: string, state: string, provider: string) {
  const result = await api.post<AuthResponse>("/auth/oauth/callback", {
    code,
    state,
    provider,
  });

  // 인증 성공 시 토큰 저장
  if (result.data?.token) {
    setAuthToken(result.data.token);
  }

  return result;
}

// POST /api/auth/reauth - 재인증
export async function reauthenticate(request: ReauthRequest) {
  const result = await api.post<AuthResponse>("/auth/reauth", request);

  if (result.data?.token) {
    setAuthToken(result.data.token);
  }

  return result;
}

// POST /api/auth/logout - 로그아웃
export async function logout() {
  setAuthToken(null);
  return api.post<{ success: boolean }>("/auth/logout");
}

// GET /api/auth/me - 현재 사용자 정보
export async function getCurrentUser() {
  return api.get<AuthResponse["user"]>("/auth/me");
}
