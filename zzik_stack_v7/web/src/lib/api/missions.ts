/**
 * Missions API
 * =============
 * 
 * 미션 관련 API 엔드포인트
 */

import { Creator } from "../mock-data";
import { api } from "./client";

export interface MissionFilters {
  category?: string;
  platform?: "all" | "instagram" | "tiktok";
  distance?: number;
  followerRange?: string;
  onlyActive?: boolean;
}

export interface MissionMatchRequest {
  creatorId: string;
  name: string;
  email: string;
  notes?: string;
}

// GET /api/missions - 미션 목록 조회
export async function getMissions(filters?: MissionFilters) {
  return api.get<Creator[]>("/missions", {
    // Query params는 실제 구현 시 추가
  });
}

// GET /api/missions/:id - 미션 상세 조회
export async function getMissionById(id: string) {
  return api.get<Creator>(`/missions/${id}`);
}

// POST /api/missions/match - 미션 매칭 요청
export async function requestMissionMatch(request: MissionMatchRequest) {
  return api.post<{ success: boolean; matchId: string }>("/missions/match", request);
}

// GET /api/missions/recommended - 추천 미션 조회
export async function getRecommendedMissions() {
  return api.get<Creator[]>("/missions/recommended");
}
