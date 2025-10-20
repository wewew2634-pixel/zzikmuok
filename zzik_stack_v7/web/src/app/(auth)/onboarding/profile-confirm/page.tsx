"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import Image from "next/image";

function ProfileConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const provider = searchParams.get("provider") || "instagram";

  // Mock data - in production, fetch from API based on jobId
  const [profileData] = useState({
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    username: provider === "instagram" ? "@seoul_foodie" : "@local_creator",
    displayName: "서울 푸디",
    bio: "서울 맛집 탐방 | 로컬 숏폼 크리에이터",
    accountType: "creator",
    categories: ["음식", "카페", "브이로그"],
    location: {
      city: "서울",
      district: "강남구",
    },
    stats: {
      followers: 12400,
      posts: 234,
      avgViews: 8500,
    },
  });

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(profileData);

  const handleContinue = () => {
    if (!isConfirmed) return;
    
    // In production: Save profile data to backend
    router.push("/onboarding/payout");
  };

  const providerName = provider === "instagram" ? "Instagram" : "TikTok";

  return (
    <main className="min-h-dvh bg-[var(--color-surface-base)] text-[var(--color-text-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 h-14 border-b border-[var(--color-border-primary)] backdrop-blur-xl backdrop-saturate-150 bg-[var(--color-surface-base)]/80">
        <div className="container mx-auto max-w-7xl h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-gradient-to-br from-[var(--color-accent-light)] to-[var(--color-accent-hover)] rounded-xl" />
            <span className="text-sm font-semibold text-[var(--color-text-primary)] tracking-tight">
              ZZIK
            </span>
          </div>
          <div className="text-xs text-[var(--color-text-tertiary)]">
            단계 2 / 3
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="sticky top-14 z-40 bg-[var(--color-surface-base)] border-b border-[var(--color-border-primary)]">
        <div className="container mx-auto max-w-3xl px-6 py-3">
          <div className="relative h-2 bg-[var(--color-surface-elevated)] rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-hover)]"
              style={{ width: "66%" }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--color-text-tertiary)] text-center">
            66% 완료
          </p>
        </div>
      </div>

      <section className="container mx-auto max-w-3xl px-6 py-12 space-y-8">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-semibold text-[var(--color-text-primary)]">
            프로필을 확인해 주세요
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            {providerName}에서 받아온 정보입니다. 필요한 항목만 확인 후 수정할 수
            있어요.
          </p>
        </div>

        {/* Info Banner */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <svg
              className="size-5 text-blue-500 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-500">
                이 정보는 매칭 추천과 통계에 사용됩니다
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                닉네임과 프로필 이미지는 언제든지 대시보드에서 바꿀 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="p-6 bg-[var(--color-surface-elevated)] border border-[var(--color-border-primary)] rounded-xl space-y-6">
          {/* Profile Header */}
          <div className="flex items-start gap-4">
            <div className="relative size-20 rounded-full overflow-hidden border-2 border-[var(--color-border-primary)]">
              <Image
                src={editedData.profileImage}
                alt={editedData.displayName}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 space-y-1">
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={editedData.username}
                    onChange={(e) =>
                      setEditedData({ ...editedData, username: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] text-sm border border-[var(--color-border-primary)] rounded-lg focus:border-[var(--color-accent-primary)] focus:ring-2 focus:ring-[var(--color-accent-primary)]/20 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={editedData.displayName}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        displayName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] text-sm border border-[var(--color-border-primary)] rounded-lg focus:border-[var(--color-accent-primary)] focus:ring-2 focus:ring-[var(--color-accent-primary)]/20 focus:outline-none"
                  />
                </>
              ) : (
                <>
                  <p className="text-sm text-[var(--color-text-tertiary)]">
                    {editedData.username}
                  </p>
                  <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                    {editedData.displayName}
                  </h2>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {editedData.bio}
                  </p>
                </>
              )}
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-surface-raised)] px-4 text-sm font-medium text-[var(--color-text-primary)] transition-all duration-200 hover:bg-[var(--color-surface-elevated)] active:scale-[0.98]"
            >
              <svg
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              {isEditing ? "저장" : "수정"}
            </button>
          </div>

          {/* Stats Grid */}
          <dl className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-[var(--color-surface-raised)] rounded-lg">
              <dt className="text-xs text-[var(--color-text-tertiary)] mb-1">
                팔로워
              </dt>
              <dd className="text-lg font-semibold text-[var(--color-text-primary)]">
                {editedData.stats.followers.toLocaleString()}
              </dd>
            </div>
            <div className="p-4 bg-[var(--color-surface-raised)] rounded-lg">
              <dt className="text-xs text-[var(--color-text-tertiary)] mb-1">
                게시물
              </dt>
              <dd className="text-lg font-semibold text-[var(--color-text-primary)]">
                {editedData.stats.posts}
              </dd>
            </div>
            <div className="p-4 bg-[var(--color-surface-raised)] rounded-lg">
              <dt className="text-xs text-[var(--color-text-tertiary)] mb-1">
                평균 조회수
              </dt>
              <dd className="text-lg font-semibold text-[var(--color-text-primary)]">
                {editedData.stats.avgViews.toLocaleString()}
              </dd>
            </div>
          </dl>

          {/* Account Type */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[var(--color-text-primary)]">
              계정 유형
            </label>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setEditedData({ ...editedData, accountType: "creator" })
                }
                className={`flex-1 h-12 rounded-lg border transition-all duration-200 ${
                  editedData.accountType === "creator"
                    ? "border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]"
                    : "border-[var(--color-border-primary)] bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)]"
                }`}
              >
                크리에이터
              </button>
              <button
                onClick={() =>
                  setEditedData({ ...editedData, accountType: "shop" })
                }
                className={`flex-1 h-12 rounded-lg border transition-all duration-200 ${
                  editedData.accountType === "shop"
                    ? "border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]"
                    : "border-[var(--color-border-primary)] bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)]"
                }`}
              >
                상점/브랜드
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[var(--color-text-primary)]">
              카테고리
            </label>
            <div className="flex flex-wrap gap-2">
              {editedData.categories.map((category, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--color-surface-raised)] border border-[var(--color-border-primary)] rounded-full text-sm text-[var(--color-text-primary)]"
                >
                  {category}
                  <button
                    onClick={() =>
                      setEditedData({
                        ...editedData,
                        categories: editedData.categories.filter(
                          (_, i) => i !== idx
                        ),
                      })
                    }
                    className="hover:text-red-500 transition-colors"
                  >
                    <svg
                      className="size-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[var(--color-text-primary)]">
              활동 지역
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={editedData.location.city}
                onChange={(e) =>
                  setEditedData({
                    ...editedData,
                    location: { ...editedData.location, city: e.target.value },
                  })
                }
                className="px-3 py-2 bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] text-sm border border-[var(--color-border-primary)] rounded-lg focus:border-[var(--color-accent-primary)] focus:ring-2 focus:ring-[var(--color-accent-primary)]/20 focus:outline-none"
                placeholder="도시"
              />
              <input
                type="text"
                value={editedData.location.district}
                onChange={(e) =>
                  setEditedData({
                    ...editedData,
                    location: {
                      ...editedData.location,
                      district: e.target.value,
                    },
                  })
                }
                className="px-3 py-2 bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] text-sm border border-[var(--color-border-primary)] rounded-lg focus:border-[var(--color-accent-primary)] focus:ring-2 focus:ring-[var(--color-accent-primary)]/20 focus:outline-none"
                placeholder="구/군"
              />
            </div>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              이 정보는 3km 반경 미션 추천에 사용됩니다.
            </p>
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <label className="flex items-start gap-3 p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-primary)] rounded-lg cursor-pointer hover:border-[var(--color-accent-primary)]/30 transition-colors">
          <input
            type="checkbox"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
            className="mt-0.5 size-5 rounded border-[var(--color-border-primary)] text-[var(--color-accent-primary)] focus:ring-2 focus:ring-[var(--color-accent-primary)]/20"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              정보가 정확함을 확인했어요
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              입력한 정보는 매칭 추천과 통계 분석에 활용되며, 언제든 대시보드에서
              수정할 수 있습니다.
            </p>
          </div>
        </label>

        {/* Actions */}
        <div className="flex flex-col gap-4 pt-6">
          <button
            onClick={handleContinue}
            disabled={!isConfirmed}
            className={`inline-flex h-12 items-center justify-center rounded-lg px-8 font-medium transition-all duration-200 active:scale-[0.98] ${
              isConfirmed
                ? "bg-[var(--color-accent-primary)] text-[oklch(10%_0_0)] hover:bg-[var(--color-accent-hover)]"
                : "bg-[var(--color-surface-elevated)] border border-[var(--color-border-primary)] text-[var(--color-text-tertiary)] cursor-not-allowed"
            }`}
          >
            다음 단계로
          </button>
          <p className="text-xs text-[var(--color-text-tertiary)] text-center">
            입력 도움이 필요하면{" "}
            <a
              href="mailto:support@zzik.kr"
              className="text-[var(--color-accent-primary)] hover:underline"
            >
              고객지원
            </a>
            으로 연락하세요.
          </p>
        </div>
      </section>

      <footer className="container mx-auto max-w-7xl px-6 py-12 text-[var(--color-text-tertiary)] text-sm text-center">
        © ZZIK — local short-form missions
      </footer>
    </main>
  );
}

export default function ProfileConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-[var(--color-surface-base)] flex items-center justify-center">
        <div className="text-[var(--color-text-secondary)]">로딩 중...</div>
      </div>
    }>
      <ProfileConfirmContent />
    </Suspense>
  );
}
