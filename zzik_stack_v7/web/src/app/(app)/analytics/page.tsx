"use client";

import { useState } from "react";
import SimpleBarChart from "@/components/charts/SimpleBarChart";
import SimpleLineChart from "@/components/charts/SimpleLineChart";
import {
  analyticsSummary,
  categoryStrengths,
  dailyMetrics,
  formatCurrency,
  formatNumber,
  formatPercentage,
  getRecentWeekData,
  missionRevenues,
} from "@/lib/analytics-data";

type TimeRange = "7d" | "30d" | "90d";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  // 시간 범위에 따른 데이터 필터링
  const filteredMetrics =
    timeRange === "7d"
      ? getRecentWeekData()
      : timeRange === "30d"
        ? dailyMetrics
        : dailyMetrics; // 90d는 동일 (mock 데이터 제한)

  // 차트용 데이터 변환
  const reachChartData = filteredMetrics.map((m) => ({
    label: m.date.slice(5), // MM-DD
    value: m.reach,
  }));

  const revenueChartData = filteredMetrics
    .filter((m) => m.revenue > 0)
    .map((m) => ({
      label: m.date.slice(5),
      value: m.revenue,
    }));

  const categoryChartData = categoryStrengths.map((c) => ({
    label: c.category,
    value: c.totalRevenue,
    color: getCategoryColor(c.category),
  }));

  return (
    <main className="min-h-dvh bg-[var(--color-surface-base)] text-[var(--color-text-primary)]">
      <div className="container mx-auto max-w-7xl px-6 py-16">
        {/* Header */}
        <header className="mb-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-[var(--font-display)] text-4xl font-semibold tracking-tight">
                분석 대시보드
              </h1>
              <p className="mt-2 text-base text-[var(--color-text-secondary)]">
                SNS 인사이트와 수익 현황을 한눈에 확인하세요
              </p>
            </div>

            {/* Time Range Selector */}
            <div className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)] p-1">
              {(["7d", "30d", "90d"] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setTimeRange(range)}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    timeRange === range
                      ? "bg-[var(--color-accent-primary)] text-[oklch(10%_0_0)] shadow-sm"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  {range === "7d" ? "7일" : range === "30d" ? "30일" : "90일"}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Summary Cards */}
        <section className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)]/60 p-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-[var(--color-text-tertiary)]">
                이번 달 수익
              </p>
              <span className="text-xl" aria-hidden="true">
                💰
              </span>
            </div>
            <p className="text-3xl font-bold text-[var(--color-text-primary)]">
              {formatCurrency(analyticsSummary.totalRevenue)}
            </p>
            <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
              <span className="text-green-500">
                +{formatPercentage(analyticsSummary.growthRate)}
              </span>{" "}
              전월 대비
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)]/60 p-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-[var(--color-text-tertiary)]">
                완료 미션
              </p>
              <span className="text-xl" aria-hidden="true">
                ✅
              </span>
            </div>
            <p className="text-3xl font-bold text-[var(--color-text-primary)]">
              {analyticsSummary.totalMissions}건
            </p>
            <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
              평균 {formatCurrency(analyticsSummary.totalRevenue / analyticsSummary.totalMissions)} /
              미션
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)]/60 p-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-[var(--color-text-tertiary)]">
                평균 도달
              </p>
              <span className="text-xl" aria-hidden="true">
                📍
              </span>
            </div>
            <p className="text-3xl font-bold text-[var(--color-text-primary)]">
              {formatNumber(analyticsSummary.avgReach)}명
            </p>
            <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
              3km 반경 평균
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)]/60 p-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-[var(--color-text-tertiary)]">
                평균 참여율
              </p>
              <span className="text-xl" aria-hidden="true">
                💬
              </span>
            </div>
            <p className="text-3xl font-bold text-[var(--color-text-primary)]">
              {formatPercentage(analyticsSummary.avgEngagementRate)}
            </p>
            <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
              좋아요 + 댓글 / 조회수
            </p>
          </div>
        </section>

        {/* Charts Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Reach Chart */}
          <section className="rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)]/60 p-6">
            <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
              3km 도달 추이
            </h2>
            <SimpleLineChart data={reachChartData} height={240} />
          </section>

          {/* Revenue Chart */}
          <section className="rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)]/60 p-6">
            <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
              수익 추이
            </h2>
            <SimpleLineChart
              data={revenueChartData}
              height={240}
              color="oklch(75% 0.15 166)"
              fillColor="oklch(75% 0.15 166 / 0.1)"
            />
          </section>

          {/* Category Strength */}
          <section className="rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)]/60 p-6">
            <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
              카테고리별 수익
            </h2>
            <SimpleBarChart
              data={categoryChartData}
              height={280}
              formatValue={(v) => formatCurrency(v)}
            />
          </section>

          {/* Mission Revenue List */}
          <section className="rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)]/60 p-6">
            <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
              최근 미션 수익
            </h2>
            <div className="space-y-3">
              {missionRevenues.slice(0, 8).map((mission) => (
                <div
                  key={mission.id}
                  className="flex items-center justify-between rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-surface-raised)]/60 px-4 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                      {mission.title}
                    </p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">
                      {mission.date} · {getStatusLabel(mission.status)}
                    </p>
                  </div>
                  <p className="ml-4 text-sm font-semibold text-[var(--color-text-primary)]">
                    {formatCurrency(mission.revenue)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Category Insights */}
        <section className="mt-8 rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)]/60 p-6">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text-primary)]">
            카테고리별 상세 분석
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border-primary)]">
                  <th className="pb-3 pr-4 text-left font-medium text-[var(--color-text-tertiary)]">
                    카테고리
                  </th>
                  <th className="pb-3 px-4 text-right font-medium text-[var(--color-text-tertiary)]">
                    평균 조회수
                  </th>
                  <th className="pb-3 px-4 text-right font-medium text-[var(--color-text-tertiary)]">
                    평균 좋아요
                  </th>
                  <th className="pb-3 px-4 text-right font-medium text-[var(--color-text-tertiary)]">
                    참여율
                  </th>
                  <th className="pb-3 px-4 text-right font-medium text-[var(--color-text-tertiary)]">
                    미션 수
                  </th>
                  <th className="pb-3 pl-4 text-right font-medium text-[var(--color-text-tertiary)]">
                    총 수익
                  </th>
                </tr>
              </thead>
              <tbody>
                {categoryStrengths.map((category, index) => (
                  <tr
                    key={category.category}
                    className={`${
                      index !== categoryStrengths.length - 1
                        ? "border-b border-[var(--color-border-primary)]"
                        : ""
                    }`}
                  >
                    <td className="py-4 pr-4 font-medium text-[var(--color-text-primary)]">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block size-3 rounded-full"
                          style={{
                            backgroundColor: getCategoryColor(category.category),
                          }}
                        />
                        {category.category}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right text-[var(--color-text-secondary)]">
                      {formatNumber(category.avgViews)}
                    </td>
                    <td className="py-4 px-4 text-right text-[var(--color-text-secondary)]">
                      {formatNumber(category.avgLikes)}
                    </td>
                    <td className="py-4 px-4 text-right text-[var(--color-text-secondary)]">
                      {formatPercentage(category.engagementRate)}
                    </td>
                    <td className="py-4 px-4 text-right text-[var(--color-text-secondary)]">
                      {category.missionCount}건
                    </td>
                    <td className="py-4 pl-4 text-right font-semibold text-[var(--color-text-primary)]">
                      {formatCurrency(category.totalRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "completed":
      return "완료";
    case "in_progress":
      return "진행 중";
    case "pending":
      return "대기";
    default:
      return status;
  }
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    음식: "oklch(70% 0.2 30)",
    카페: "oklch(75% 0.15 60)",
    브이로그: "oklch(65% 0.18 240)",
    패션: "oklch(70% 0.16 300)",
    뷰티: "oklch(75% 0.14 330)",
  };
  return colors[category] || "var(--color-accent-primary)";
}
