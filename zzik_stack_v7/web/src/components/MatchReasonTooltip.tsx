"use client";

import { useState } from "react";
import { Creator } from "@/lib/mock-data";

interface MatchReasonTooltipProps {
  creator: Creator;
}

export default function MatchReasonTooltip({ creator }: MatchReasonTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 매칭 이유 계산 로직
  const reasons = [];
  
  if (creator.confidence_score >= 0.9) {
    reasons.push({
      icon: "🎯",
      text: "신뢰도 상위 10% 크리에이터",
      type: "high" as const,
    });
  }
  
  if (creator.reach_3km >= 2000) {
    reasons.push({
      icon: "📍",
      text: "3km 반경 도달력 우수 (2,000명 이상)",
      type: "high" as const,
    });
  }
  
  if (creator.engagement_rate >= 0.05) {
    reasons.push({
      icon: "💬",
      text: `높은 참여율 (${(creator.engagement_rate * 100).toFixed(1)}%)`,
      type: "medium" as const,
    });
  }
  
  if (creator.expected_visitors >= 15) {
    reasons.push({
      icon: "👥",
      text: `예상 방문객 ${creator.expected_visitors}명`,
      type: "medium" as const,
    });
  }
  
  if (creator.is_active && creator.avg_response_hours && creator.avg_response_hours < 3) {
    reasons.push({
      icon: "⚡",
      text: `빠른 응답 (평균 ${creator.avg_response_hours}시간)`,
      type: "low" as const,
    });
  }

  if (reasons.length === 0) {
    reasons.push({
      icon: "✓",
      text: "조건에 부합하는 크리에이터",
      type: "low" as const,
    });
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="inline-flex size-5 items-center justify-center rounded-full border border-[var(--color-border-primary)] bg-[var(--color-surface-raised)] text-xs text-[var(--color-text-tertiary)] transition-all duration-200 hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]"
        aria-label="매칭 이유 보기"
      >
        ?
      </button>

      {isOpen && (
        <div
          className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)]/98 p-4 shadow-2xl backdrop-blur-xl"
          role="tooltip"
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-medium text-[var(--color-text-primary)]">
              매칭 이유
            </span>
            <span className="ml-auto text-xs text-[var(--color-text-tertiary)]">
              {Math.round(creator.confidence_score * 100)}% 적합도
            </span>
          </div>

          <ul className="space-y-2">
            {reasons.map((reason, index) => (
              <li
                key={index}
                className={`flex items-start gap-2 text-xs ${
                  reason.type === "high"
                    ? "text-[var(--color-text-primary)]"
                    : reason.type === "medium"
                      ? "text-[var(--color-text-secondary)]"
                      : "text-[var(--color-text-tertiary)]"
                }`}
              >
                <span className="mt-0.5 shrink-0">{reason.icon}</span>
                <span className="leading-relaxed">{reason.text}</span>
              </li>
            ))}
          </ul>

          {/* Arrow */}
          <div className="absolute left-1/2 top-full -translate-x-1/2">
            <div className="size-3 rotate-45 border-b border-r border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)]" />
          </div>
        </div>
      )}
    </div>
  );
}
