/**
 * Analytics API
 * ==============
 * 
 * 분석 데이터 API 엔드포인트
 */

import {
  AnalyticsSummary,
  CategoryStrength,
  DailyMetric,
  MissionRevenue,
} from "../analytics-data";
import { api } from "./client";

export interface AnalyticsTimeRange {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
}

// GET /api/analytics/summary - 분석 요약
export async function getAnalyticsSummary(range?: AnalyticsTimeRange) {
  return api.get<AnalyticsSummary>("/analytics/summary");
}

// GET /api/analytics/metrics - 일별 지표
export async function getDailyMetrics(range?: AnalyticsTimeRange) {
  return api.get<DailyMetric[]>("/analytics/metrics");
}

// GET /api/analytics/categories - 카테고리별 강점
export async function getCategoryStrengths() {
  return api.get<CategoryStrength[]>("/analytics/categories");
}

// GET /api/analytics/revenue - 미션별 수익
export async function getMissionRevenues() {
  return api.get<MissionRevenue[]>("/analytics/revenue");
}
