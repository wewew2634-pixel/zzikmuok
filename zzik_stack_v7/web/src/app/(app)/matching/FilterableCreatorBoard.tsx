"use client";

import { useEffect, useMemo, useState } from "react";
import CreatorCard from "@/components/CreatorCard";
import MissionDetailModal from "@/components/MissionDetailModal";
import {
  Creator,
  categoryOptions,
  distanceOptions,
  followerRanges,
  formatNumber,
  formatPrice,
  mockCreators,
} from "@/lib/mock-data";

const BASE_LOCATION = {
  latitude: 37.4979,
  longitude: 127.0276,
};

type SortKey = "reach" | "confidence" | "priceAsc" | "priceDesc";

type MatchState = "idle" | "submitting" | "success";

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "reach", label: "3km 도달순" },
  { value: "confidence", label: "신뢰도순" },
  { value: "priceAsc", label: "가격 낮은순" },
  { value: "priceDesc", label: "가격 높은순" },
];

const platformOptions: { value: "all" | "instagram" | "tiktok"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
];

const followerRangeMap = followerRanges.reduce<Record<string, (typeof followerRanges)[number]>>(
  (acc, range) => {
    const maxKey = Number.isFinite(range.max) ? range.max : "Infinity";
    acc[`${range.min}-${maxKey}`] = range;
    return acc;
  },
  {},
);

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default function FilterableCreatorBoard() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [platform, setPlatform] = useState<"all" | "instagram" | "tiktok">("all");
  const [distance, setDistance] = useState<number | "all">("all");
  const [followerKey, setFollowerKey] = useState<string>("all");
  const [onlyActive, setOnlyActive] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<SortKey>("reach");
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [matchState, setMatchState] = useState<MatchState>("idle");
  const [detailCreator, setDetailCreator] = useState<Creator | null>(null);

  useEffect(() => {
    if (selectedCreator) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
    return undefined;
  }, [selectedCreator]);

  const filteredCreators = useMemo(() => {
    let creators = [...mockCreators];

    if (onlyActive) {
      creators = creators.filter((creator) => creator.is_active);
    }

    if (category !== "all") {
      creators = creators.filter((creator) =>
        creator.categories.some((cat) => cat === category),
      );
    }

    if (platform !== "all") {
      creators = creators.filter((creator) => creator.platform === platform);
    }

    if (distance !== "all") {
      creators = creators.filter((creator) => {
        const dist = calculateDistanceKm(
          BASE_LOCATION.latitude,
          BASE_LOCATION.longitude,
          creator.location.latitude,
          creator.location.longitude,
        );
        return dist <= distance;
      });
    }

    if (followerKey !== "all") {
      const range = followerRangeMap[followerKey];
      if (range) {
        creators = creators.filter(
          (creator) =>
            creator.follower_count >= range.min &&
            creator.follower_count < (Number.isFinite(range.max) ? range.max : Infinity),
        );
      }
    }

    if (query) {
      const keyword = query.toLowerCase();
      creators = creators.filter((creator) =>
        creator.display_name.toLowerCase().includes(keyword) ||
        creator.username.toLowerCase().includes(keyword) ||
        creator.categories.some((cat) => cat.toLowerCase().includes(keyword)),
      );
    }

    creators.sort((a, b) => {
      switch (sortBy) {
        case "confidence":
          return b.confidence_score - a.confidence_score;
        case "priceAsc":
          return a.price_per_post - b.price_per_post;
        case "priceDesc":
          return b.price_per_post - a.price_per_post;
        case "reach":
        default:
          return b.reach_3km - a.reach_3km;
      }
    });

    return creators;
  }, [onlyActive, category, platform, distance, followerKey, query, sortBy]);

  const aggregate = useMemo(() => {
    if (!filteredCreators.length) {
      return {
        expectedVisitors: 0,
        avgConfidence: null as number | null,
        avgPrice: null as number | null,
      };
    }

    const expectedVisitors = filteredCreators.reduce(
      (sum, creator) => sum + creator.expected_visitors,
      0,
    );

    const avgConfidence =
      filteredCreators.reduce((sum, creator) => sum + creator.confidence_score, 0) /
      filteredCreators.length;

    const avgPrice =
      filteredCreators.reduce((sum, creator) => sum + creator.price_per_post, 0) /
      filteredCreators.length;

    return { expectedVisitors, avgConfidence, avgPrice };
  }, [filteredCreators]);

  const handleMatch = (creatorId: string) => {
    const creator = mockCreators.find((item) => item.id === creatorId);
    if (creator) {
      setSelectedCreator(creator);
      setMatchState("idle");
    }
  };

  const handleViewDetail = (creatorId: string) => {
    const creator = mockCreators.find((item) => item.id === creatorId);
    if (creator) {
      setDetailCreator(creator);
    }
  };

  const handleDialogClose = () => {
    setSelectedCreator(null);
    setMatchState("idle");
  };

  const handleDetailClose = () => {
    setDetailCreator(null);
  };

  const handleMatchFromDetail = () => {
    if (detailCreator) {
      setDetailCreator(null);
      setSelectedCreator(detailCreator);
      setMatchState("idle");
    }
  };

  const handleMatchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMatchState("submitting");

    window.setTimeout(() => {
      setMatchState("success");
    }, 900);
  };

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-6 rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)]/55 p-6">
          <div className="space-y-2">
            <label htmlFor="matching-search" className="text-xs font-medium text-[var(--color-text-tertiary)]">
              검색
            </label>
            <input
              id="matching-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="크리에이터, 태그, 계정을 검색하세요"
              className="w-full rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-surface-raised)]/70 px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]/20"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-[var(--color-text-tertiary)]">카테고리</p>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCategory(option.value)}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors duration-200 ${
                    category === option.value
                      ? "border-[var(--color-accent-primary)] bg-[var(--color-accent-bg)] text-[var(--color-accent-primary)]"
                      : "border-[var(--color-border-primary)] bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-primary)]/40"
                  }`}
                  aria-pressed={category === option.value}
                >
                  <span aria-hidden="true">{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-[var(--color-text-tertiary)]">플랫폼</p>
            <div className="inline-flex flex-wrap gap-2">
              {platformOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPlatform(option.value)}
                  className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs transition-colors duration-200 ${
                    platform === option.value
                      ? "bg-[var(--color-accent-primary)] text-[oklch(10%_0_0)]"
                      : "border border-[var(--color-border-primary)] bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-primary)]/40"
                  }`}
                  aria-pressed={platform === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="distance-select" className="text-xs font-medium text-[var(--color-text-tertiary)]">
              거리
            </label>
            <select
              id="distance-select"
              value={distance === "all" ? "all" : String(distance)}
              onChange={(event) => {
                const value = event.target.value;
                setDistance(value === "all" ? "all" : Number(value));
              }}
              className="w-full rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-surface-raised)]/70 px-3 py-2 text-xs text-[var(--color-text-primary)] focus:border-[var(--color-accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]/20"
            >
              <option value="all">전체 거리</option>
              {distanceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="follower-select" className="text-xs font-medium text-[var(--color-text-tertiary)]">
              팔로워 수
            </label>
            <select
              id="follower-select"
              value={followerKey}
              onChange={(event) => setFollowerKey(event.target.value)}
              className="w-full rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-surface-raised)]/70 px-3 py-2 text-xs text-[var(--color-text-primary)] focus:border-[var(--color-accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]/20"
            >
              <option value="all">전체 팔로워</option>
              {followerRanges.map((range) => {
                const maxKey = Number.isFinite(range.max) ? range.max : "Infinity";
                const key = `${range.min}-${maxKey}`;
                return (
                  <option key={key} value={key}>
                    {range.label}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-surface-raised)]/60 px-3 py-3">
            <label htmlFor="active-switch" className="text-xs text-[var(--color-text-secondary)]">
              활동 중인 계정만
            </label>
            <input
              id="active-switch"
              type="checkbox"
              checked={onlyActive}
              onChange={(event) => setOnlyActive(event.target.checked)}
              className="size-4 accent-[var(--color-accent-primary)]"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="sort-select" className="text-xs font-medium text-[var(--color-text-tertiary)]">
              정렬 기준
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortKey)}
              className="w-full rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-surface-raised)]/70 px-3 py-2 text-xs text-[var(--color-text-primary)] focus:border-[var(--color-accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]/20"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("all");
              setPlatform("all");
              setDistance("all");
              setFollowerKey("all");
              setOnlyActive(true);
              setSortBy("reach");
            }}
            className="w-full rounded-lg border border-[var(--color-border-primary)] bg-transparent px-3 py-2 text-xs text-[var(--color-text-secondary)] transition-colors duration-200 hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]"
          >
            필터 초기화
          </button>
        </aside>

        <div className="space-y-6">
          <header className="rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)]/60 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs text-[var(--color-text-tertiary)]">필터링 결과</p>
                <p className="text-xl font-semibold text-[var(--color-text-primary)]">
                  {filteredCreators.length}명
                  <span className="text-sm font-normal text-[var(--color-text-secondary)]">
                    {" "}/ {mockCreators.length}명 전체 풀
                  </span>
                </p>
              </div>
              <dl className="grid grid-cols-1 gap-4 text-xs text-[var(--color-text-secondary)] sm:grid-cols-3">
                <div>
                  <dt className="mb-1">예상 방문</dt>
                  <dd className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {formatNumber(aggregate.expectedVisitors)}명
                  </dd>
                </div>
                <div>
                  <dt className="mb-1">평균 신뢰도</dt>
                  <dd className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {aggregate.avgConfidence !== null
                      ? `${Math.round(aggregate.avgConfidence * 100)}%`
                      : "-"}
                  </dd>
                </div>
                <div>
                  <dt className="mb-1">평균 단가</dt>
                  <dd className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {aggregate.avgPrice !== null ? formatPrice(aggregate.avgPrice) : "-"}
                  </dd>
                </div>
              </dl>
            </div>
          </header>

          {filteredCreators.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredCreators.map((creator) => (
                <CreatorCard 
                  key={creator.id} 
                  creator={creator} 
                  onMatch={handleMatch}
                  onViewDetail={handleViewDetail}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)]/40 p-10 text-center text-sm text-[var(--color-text-secondary)]">
              조건에 맞는 크리에이터가 없습니다. 필터를 조정해 다시 시도하세요.
            </div>
          )}
        </div>
      </div>

      {selectedCreator ? (
        <MatchRequestDialog
          creator={selectedCreator}
          state={matchState}
          onClose={handleDialogClose}
          onSubmit={handleMatchSubmit}
        />
      ) : null}

      {detailCreator ? (
        <MissionDetailModal
          creator={detailCreator}
          onClose={handleDetailClose}
          onMatch={handleMatchFromDetail}
        />
      ) : null}
    </>
  );
}

interface MatchRequestDialogProps {
  creator: Creator;
  state: MatchState;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

function MatchRequestDialog({ creator, state, onClose, onSubmit }: MatchRequestDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-dialog-title"
        className="w-full max-w-md rounded-3xl border border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)]/95 p-6 shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-[var(--color-text-tertiary)]">매칭 요청</p>
            <h3 id="match-dialog-title" className="text-xl font-semibold text-[var(--color-text-primary)]">
              {creator.display_name}
            </h3>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              {creator.location.adm2} · {creator.categories.slice(0, 2).join(" / ")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full border border-[var(--color-border-primary)] bg-[var(--color-surface-raised)] text-xs text-[var(--color-text-secondary)] transition-colors duration-200 hover:text-[var(--color-text-primary)]"
            aria-label="닫기"
          >
            ×
          </button>
        </header>

        <div className="mt-4 grid grid-cols-3 gap-3 rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-surface-raised)]/60 px-4 py-3 text-xs text-[var(--color-text-secondary)]">
          <div>
            <p className="mb-1 text-[var(--color-text-tertiary)]">3km 도달</p>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              {formatNumber(creator.reach_3km)}명
            </p>
          </div>
          <div>
            <p className="mb-1 text-[var(--color-text-tertiary)]">예상 방문</p>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              {creator.expected_visitors}명
            </p>
          </div>
          <div>
            <p className="mb-1 text-[var(--color-text-tertiary)]">단가</p>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              {formatPrice(creator.price_per_post)}
            </p>
          </div>
        </div>

        {state === "success" ? (
          <div className="mt-6 space-y-4 text-center text-sm text-[var(--color-text-secondary)]">
            <p>매칭 요청이 접수되었습니다. 담당 매니저가 곧 연락드릴 예정입니다.</p>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg bg-[var(--color-accent-primary)] px-4 py-2 text-sm font-medium text-[oklch(10%_0_0)] transition-all duration-200 hover:bg-[var(--color-accent-hover)]"
            >
              확인
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="match-name" className="text-xs text-[var(--color-text-tertiary)]">
                담당자 이름
              </label>
              <input
                id="match-name"
                name="name"
                type="text"
                required
                placeholder="홍길동"
                className="w-full rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-surface-raised)]/70 px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]/20"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="match-email" className="text-xs text-[var(--color-text-tertiary)]">
                연락 이메일
              </label>
              <input
                id="match-email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-surface-raised)]/70 px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]/20"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="match-notes" className="text-xs text-[var(--color-text-tertiary)]">
                메모
              </label>
              <textarea
                id="match-notes"
                name="notes"
                rows={3}
                placeholder="요청 일정, 특별 요구사항 등을 입력하세요."
                className="w-full rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-surface-raised)]/70 px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]/20"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--color-text-tertiary)]">
              <span>응답 SLA 5분</span>
              <span>정산 T+0</span>
            </div>

            <button
              type="submit"
              disabled={state === "submitting"}
              className="w-full rounded-lg bg-[var(--color-accent-primary)] px-4 py-2 text-sm font-medium text-[oklch(10%_0_0)] transition-all duration-200 hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:bg-[var(--color-accent-primary)]/50"
            >
              {state === "submitting" ? "요청 전송 중..." : "매칭 요청 보내기"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
