/**
 * ZZIK Analytics Mock Data
 * ========================
 * 
 * 크리에이터 분석 대시보드용 mock 데이터
 * - SNS 인사이트 (도달률, 조회수, 참여율)
 * - 수익 분석 (이번 달 누적, 미션별, 예상 수익)
 * - 카테고리별 강점 분석
 */

export interface DailyMetric {
  date: string; // YYYY-MM-DD
  reach: number;
  views: number;
  engagement: number;
  revenue: number;
}

export interface CategoryStrength {
  category: string;
  avgViews: number;
  avgLikes: number;
  engagementRate: number;
  missionCount: number;
  totalRevenue: number;
}

export interface MissionRevenue {
  id: string;
  title: string;
  date: string;
  revenue: number;
  status: "completed" | "pending" | "in_progress";
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalMissions: number;
  avgReach: number;
  avgEngagementRate: number;
  growthRate: number; // 전월 대비 성장률
}

// 최근 30일 일별 데이터
export const dailyMetrics: DailyMetric[] = [
  { date: "2024-12-01", reach: 2100, views: 8500, engagement: 425, revenue: 0 },
  { date: "2024-12-02", reach: 2200, views: 9100, engagement: 455, revenue: 180000 },
  { date: "2024-12-03", reach: 2150, views: 8800, engagement: 440, revenue: 0 },
  { date: "2024-12-04", reach: 2300, views: 9500, engagement: 475, revenue: 220000 },
  { date: "2024-12-05", reach: 2250, views: 9200, engagement: 460, revenue: 0 },
  { date: "2024-12-06", reach: 2400, views: 10100, engagement: 505, revenue: 250000 },
  { date: "2024-12-07", reach: 2350, views: 9800, engagement: 490, revenue: 0 },
  { date: "2024-12-08", reach: 2500, views: 10500, engagement: 525, revenue: 180000 },
  { date: "2024-12-09", reach: 2450, views: 10200, engagement: 510, revenue: 0 },
  { date: "2024-12-10", reach: 2600, views: 11000, engagement: 550, revenue: 300000 },
  { date: "2024-12-11", reach: 2550, views: 10700, engagement: 535, revenue: 0 },
  { date: "2024-12-12", reach: 2700, views: 11500, engagement: 575, revenue: 220000 },
  { date: "2024-12-13", reach: 2650, views: 11200, engagement: 560, revenue: 0 },
  { date: "2024-12-14", reach: 2800, views: 12000, engagement: 600, revenue: 280000 },
  { date: "2024-12-15", reach: 2750, views: 11700, engagement: 585, revenue: 0 },
  { date: "2024-12-16", reach: 2900, views: 12500, engagement: 625, revenue: 320000 },
  { date: "2024-12-17", reach: 2850, views: 12200, engagement: 610, revenue: 0 },
  { date: "2024-12-18", reach: 3000, views: 13000, engagement: 650, revenue: 250000 },
  { date: "2024-12-19", reach: 2950, views: 12700, engagement: 635, revenue: 0 },
  { date: "2024-12-20", reach: 3100, views: 13500, engagement: 675, revenue: 350000 },
  { date: "2024-12-21", reach: 3050, views: 13200, engagement: 660, revenue: 0 },
  { date: "2024-12-22", reach: 3200, views: 14000, engagement: 700, revenue: 280000 },
  { date: "2024-12-23", reach: 3150, views: 13700, engagement: 685, revenue: 0 },
  { date: "2024-12-24", reach: 3300, views: 14500, engagement: 725, revenue: 380000 },
  { date: "2024-12-25", reach: 3250, views: 14200, engagement: 710, revenue: 0 },
  { date: "2024-12-26", reach: 3400, views: 15000, engagement: 750, revenue: 320000 },
  { date: "2024-12-27", reach: 3350, views: 14700, engagement: 735, revenue: 0 },
  { date: "2024-12-28", reach: 3500, views: 15500, engagement: 775, revenue: 400000 },
  { date: "2024-12-29", reach: 3450, views: 15200, engagement: 760, revenue: 0 },
  { date: "2024-12-30", reach: 3600, views: 16000, engagement: 800, revenue: 350000 },
];

// 카테고리별 강점
export const categoryStrengths: CategoryStrength[] = [
  {
    category: "음식",
    avgViews: 15200,
    avgLikes: 760,
    engagementRate: 5.2,
    missionCount: 8,
    totalRevenue: 1440000,
  },
  {
    category: "카페",
    avgViews: 13800,
    avgLikes: 690,
    engagementRate: 4.8,
    missionCount: 6,
    totalRevenue: 1080000,
  },
  {
    category: "브이로그",
    avgViews: 12500,
    avgLikes: 625,
    engagementRate: 4.5,
    missionCount: 5,
    totalRevenue: 900000,
  },
  {
    category: "패션",
    avgViews: 11000,
    avgLikes: 550,
    engagementRate: 4.2,
    missionCount: 3,
    totalRevenue: 540000,
  },
  {
    category: "뷰티",
    avgViews: 10200,
    avgLikes: 510,
    engagementRate: 3.9,
    missionCount: 2,
    totalRevenue: 360000,
  },
];

// 미션별 수익
export const missionRevenues: MissionRevenue[] = [
  {
    id: "M001",
    title: "강남 신규 카페 오픈 홍보",
    date: "2024-12-28",
    revenue: 400000,
    status: "completed",
  },
  {
    id: "M002",
    title: "홍대 맛집 신메뉴 소개",
    date: "2024-12-26",
    revenue: 320000,
    status: "completed",
  },
  {
    id: "M003",
    title: "성수 브런치 카페 체험",
    date: "2024-12-24",
    revenue: 380000,
    status: "completed",
  },
  {
    id: "M004",
    title: "이태원 레스토랑 디너 코스",
    date: "2024-12-22",
    revenue: 280000,
    status: "completed",
  },
  {
    id: "M005",
    title: "압구정 베이커리 신상 리뷰",
    date: "2024-12-20",
    revenue: 350000,
    status: "completed",
  },
  {
    id: "M006",
    title: "강남 디저트 카페 촬영",
    date: "2024-12-18",
    revenue: 250000,
    status: "completed",
  },
  {
    id: "M007",
    title: "역삼 일식당 런치 세트",
    date: "2024-12-16",
    revenue: 320000,
    status: "completed",
  },
  {
    id: "M008",
    title: "신사동 카페 홀리데이 이벤트",
    date: "2024-12-14",
    revenue: 280000,
    status: "completed",
  },
  {
    id: "M009",
    title: "청담 파인다이닝 체험",
    date: "2024-12-12",
    revenue: 220000,
    status: "completed",
  },
  {
    id: "M010",
    title: "가로수길 브런치 스팟",
    date: "2024-12-10",
    revenue: 300000,
    status: "completed",
  },
  {
    id: "M011",
    title: "강남역 떡볶이 맛집 (진행 중)",
    date: "2024-12-31",
    revenue: 180000,
    status: "in_progress",
  },
  {
    id: "M012",
    title: "신논현 카페 신년 이벤트 (대기)",
    date: "2025-01-05",
    revenue: 250000,
    status: "pending",
  },
];

// 분석 요약
export const analyticsSummary: AnalyticsSummary = {
  totalRevenue: 4320000,
  totalMissions: 10,
  avgReach: 2890,
  avgEngagementRate: 5.1,
  growthRate: 23.5, // 전월 대비 23.5% 증가
};

// Helper functions
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("ko-KR").format(num);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

// 최근 7일 데이터 추출
export function getRecentWeekData(): DailyMetric[] {
  return dailyMetrics.slice(-7);
}

// 이번 달 총 도달 수
export function getTotalReach(): number {
  return dailyMetrics.reduce((sum, metric) => sum + metric.reach, 0);
}

// 이번 달 총 조회수
export function getTotalViews(): number {
  return dailyMetrics.reduce((sum, metric) => sum + metric.views, 0);
}

// 평균 참여율 계산
export function getAvgEngagementRate(): number {
  const totalViews = getTotalViews();
  const totalEngagement = dailyMetrics.reduce(
    (sum, metric) => sum + metric.engagement,
    0
  );
  return totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0;
}
