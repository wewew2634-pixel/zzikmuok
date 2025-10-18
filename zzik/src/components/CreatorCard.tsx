/**
 * ZZIK 크리에이터 카드 컴포넌트
 * ================================================
 * 
 * 차별화 요소 강조:
 * 1. "3km 반경 2,100명" - 큰 폰트, 눈에 띄는 색상
 * 2. 신뢰도 점수 - 배지 형태로 시각화
 * 3. 예상 방문객 - "105명 방문 예상" 명시
 * 4. T+0 정산 - CTA 버튼에 암시
 */

import { Creator, formatNumber, formatPrice, getConfidenceLabel } from "@/lib/mock-data";
import Image from "next/image";

interface CreatorCardProps {
  creator: Creator;
  onMatch?: (creatorId: string) => void;
}

export default function CreatorCard({ creator, onMatch }: CreatorCardProps) {
  const confidenceInfo = getConfidenceLabel(creator.confidence_score);

  return (
    <article className="group relative p-6 bg-[var(--color-surface-elevated)] border border-[var(--color-border-primary)] rounded-xl hover:border-[var(--color-accent-primary)]/50 hover:-translate-y-1 transition-all duration-300">
      {/* 상단: 프로필 */}
      <div className="flex items-start gap-4 mb-4">
        {/* 프로필 이미지 */}
        <div className="relative size-16 rounded-full overflow-hidden bg-[var(--color-surface-raised)] flex-shrink-0">
          <Image
            src={creator.profile_image}
            alt={creator.display_name}
            fill
            className="object-cover"
          />
        </div>

        {/* 이름 + 플랫폼 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] truncate">
            {creator.display_name}
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] truncate">
            {creator.username}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 bg-[var(--color-surface-raised)] text-[var(--color-text-tertiary)] rounded">
              {creator.platform === "instagram" ? "Instagram" : "TikTok"}
            </span>
            {/* 신뢰도 배지 */}
            <span
              className={`text-xs px-2 py-0.5 ${confidenceInfo.bgColor} ${confidenceInfo.color} rounded font-medium`}
            >
              신뢰도 {confidenceInfo.label}
            </span>
          </div>
        </div>
      </div>

      {/* Bio */}
      <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mb-4">
        {creator.bio}
      </p>

      {/* 카테고리 태그 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {creator.categories.slice(0, 3).map((cat) => (
          <span
            key={cat}
            className="text-xs px-2 py-1 bg-[var(--color-accent-bg)] text-[var(--color-accent-primary)] rounded-md"
          >
            #{cat}
          </span>
        ))}
      </div>

      {/* 핵심 차별화: 로컬 데이터 */}
      <div className="p-4 bg-[var(--color-surface-raised)] rounded-lg mb-4">
        <div className="grid grid-cols-2 gap-3">
          {/* 3km 반경 도달 (가장 강조) */}
          <div>
            <dt className="text-xs text-[var(--color-text-tertiary)] mb-1">
              3km 반경 도달
            </dt>
            <dd className="text-2xl font-bold text-[var(--color-accent-primary)]">
              {formatNumber(creator.reach_3km)}명
            </dd>
          </div>

          {/* 예상 방문객 */}
          <div>
            <dt className="text-xs text-[var(--color-text-tertiary)] mb-1">
              예상 방문
            </dt>
            <dd className="text-2xl font-bold text-[var(--color-text-primary)]">
              {creator.expected_visitors}명
            </dd>
          </div>
        </div>

        {/* 위치 정보 */}
        <div className="mt-3 pt-3 border-t border-[var(--color-border-primary)]">
          <p className="text-xs text-[var(--color-text-secondary)]">
            📍 {creator.location.adm2} {creator.location.adm3 || ""}
          </p>
        </div>
      </div>

      {/* SNS 지표 */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center">
          <dt className="text-xs text-[var(--color-text-tertiary)]">팔로워</dt>
          <dd className="text-sm font-semibold text-[var(--color-text-primary)] mt-1">
            {formatNumber(creator.follower_count)}
          </dd>
        </div>
        <div className="text-center">
          <dt className="text-xs text-[var(--color-text-tertiary)]">참여율</dt>
          <dd className="text-sm font-semibold text-[var(--color-text-primary)] mt-1">
            {creator.engagement_rate}%
          </dd>
        </div>
        <div className="text-center">
          <dt className="text-xs text-[var(--color-text-tertiary)]">포스트</dt>
          <dd className="text-sm font-semibold text-[var(--color-text-primary)] mt-1">
            {creator.post_count}
          </dd>
        </div>
      </div>

      {/* 하단: 가격 + CTA */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border-primary)]">
        <div>
          <p className="text-xs text-[var(--color-text-tertiary)]">1회 포스팅</p>
          <p className="text-lg font-bold text-[var(--color-text-primary)]">
            {formatPrice(creator.price_per_post)}
          </p>
        </div>

        <button
          onClick={() => onMatch?.(creator.id)}
          className="h-10 px-6 bg-[var(--color-accent-primary)] text-[oklch(10%_0_0)] text-sm font-medium rounded-lg hover:bg-[var(--color-accent-hover)] active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg"
        >
          매칭 요청
        </button>
      </div>

      {/* 호버 시 글로우 효과 */}
      <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-[var(--color-accent-primary)]/0 via-[var(--color-accent-primary)]/5 to-[var(--color-accent-primary)]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </article>
  );
}
