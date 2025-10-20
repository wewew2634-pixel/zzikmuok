"use client";

import { Creator } from "@/lib/mock-data";
import { formatNumber, formatPrice } from "@/lib/mock-data";

interface MissionDetailModalProps {
  creator: Creator;
  onClose: () => void;
  onMatch: () => void;
}

export default function MissionDetailModal({
  creator,
  onClose,
  onMatch,
}: MissionDetailModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mission-detail-title"
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)]/98 shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)]/95 px-6 py-4 backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <img
              src={creator.profile_image}
              alt=""
              className="size-16 rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-surface-raised)]"
            />
            <div>
              <h3
                id="mission-detail-title"
                className="text-xl font-semibold text-[var(--color-text-primary)]"
              >
                {creator.display_name}
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {creator.username}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-bg)] px-2 py-0.5 text-xs text-[var(--color-accent-primary)]">
                  <span className="size-1.5 rounded-full bg-[var(--color-accent-primary)]" />
                  {creator.platform === "instagram" ? "Instagram" : "TikTok"}
                </span>
                <span className="text-xs text-[var(--color-text-tertiary)]">
                  {creator.location.adm2} · {creator.location.adm3}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full border border-[var(--color-border-primary)] bg-[var(--color-surface-raised)] text-lg text-[var(--color-text-secondary)] transition-colors duration-200 hover:text-[var(--color-text-primary)]"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* Bio */}
          <section>
            <h4 className="mb-2 text-xs font-medium text-[var(--color-text-tertiary)]">
              소개
            </h4>
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {creator.bio}
            </p>
          </section>

          {/* Key Metrics */}
          <section>
            <h4 className="mb-3 text-xs font-medium text-[var(--color-text-tertiary)]">
              핵심 지표
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-surface-raised)]/60 px-4 py-3">
                <p className="text-xs text-[var(--color-text-tertiary)]">3km 도달</p>
                <p className="mt-1 text-lg font-semibold text-[var(--color-text-primary)]">
                  {formatNumber(creator.reach_3km)}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-surface-raised)]/60 px-4 py-3">
                <p className="text-xs text-[var(--color-text-tertiary)]">예상 방문</p>
                <p className="mt-1 text-lg font-semibold text-[var(--color-text-primary)]">
                  {creator.expected_visitors}명
                </p>
              </div>
              <div className="rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-surface-raised)]/60 px-4 py-3">
                <p className="text-xs text-[var(--color-text-tertiary)]">팔로워</p>
                <p className="mt-1 text-lg font-semibold text-[var(--color-text-primary)]">
                  {formatNumber(creator.follower_count)}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-surface-raised)]/60 px-4 py-3">
                <p className="text-xs text-[var(--color-text-tertiary)]">신뢰도</p>
                <p className="mt-1 text-lg font-semibold text-[var(--color-text-primary)]">
                  {Math.round(creator.confidence_score * 100)}%
                </p>
              </div>
            </div>
          </section>

          {/* Categories */}
          <section>
            <h4 className="mb-3 text-xs font-medium text-[var(--color-text-tertiary)]">
              전문 카테고리
            </h4>
            <div className="flex flex-wrap gap-2">
              {creator.categories.map((category, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full border border-[var(--color-border-primary)] bg-[var(--color-surface-raised)] px-3 py-1 text-xs text-[var(--color-text-secondary)]"
                >
                  {category}
                </span>
              ))}
            </div>
          </section>

          {/* Performance Stats */}
          <section>
            <h4 className="mb-3 text-xs font-medium text-[var(--color-text-tertiary)]">
              콘텐츠 성과
            </h4>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-surface-raised)]/60 px-4 py-3">
                <p className="text-xs text-[var(--color-text-tertiary)]">평균 조회수</p>
                <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
                  {formatNumber(creator.avg_views)}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-surface-raised)]/60 px-4 py-3">
                <p className="text-xs text-[var(--color-text-tertiary)]">평균 좋아요</p>
                <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
                  {formatNumber(creator.avg_likes)}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-surface-raised)]/60 px-4 py-3">
                <p className="text-xs text-[var(--color-text-tertiary)]">참여율</p>
                <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
                  {(creator.engagement_rate * 100).toFixed(2)}%
                </p>
              </div>
            </div>
          </section>

          {/* Recent Content */}
          <section>
            <h4 className="mb-3 text-xs font-medium text-[var(--color-text-tertiary)]">
              최근 콘텐츠
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {creator.recent_content.slice(0, 6).map((content, index) => (
                <div
                  key={index}
                  className="aspect-square overflow-hidden rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-surface-raised)]"
                >
                  <img
                    src={content.thumbnail_url}
                    alt={`콘텐츠 ${index + 1}`}
                    className="size-full object-cover"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Pricing */}
          <section className="rounded-2xl border border-[var(--color-accent-primary)]/30 bg-[var(--color-accent-bg)]/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--color-text-tertiary)]">포스팅 단가</p>
                <p className="mt-1 text-2xl font-bold text-[var(--color-text-primary)]">
                  {formatPrice(creator.price_per_post)}
                </p>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                  T+0 정산 · 응답 SLA 5분
                </p>
              </div>
              <button
                type="button"
                onClick={onMatch}
                className="rounded-xl bg-[var(--color-accent-primary)] px-6 py-3 text-sm font-medium text-[oklch(10%_0_0)] shadow-lg transition-all duration-200 hover:bg-[var(--color-accent-hover)] hover:shadow-xl active:scale-95"
              >
                매칭 요청
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
