import { Suspense } from "react";
import LoadGuard from "../components/LoadGuard";
import FilterableCreatorBoard from "./FilterableCreatorBoard";

export default function MatchingPage() {
  return (
    <main className="min-h-dvh bg-[var(--color-surface-base)] text-[var(--color-text-primary)]">
      <section className="container mx-auto max-w-6xl px-6 py-16">
        <header className="mb-12 space-y-4 text-center">
          <span className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)]/70 px-4 py-1 text-sm text-[var(--color-text-secondary)]">
            <span className="size-2 rounded-full bg-[var(--color-accent-primary)]" aria-hidden="true" />
            실시간 매칭 보드
          </span>
          <h1 className="font-[var(--font-display)] text-4xl font-semibold tracking-tight">
            강남 3km 반경 크리에이터
          </h1>
          <p className="mx-auto max-w-2xl text-base text-[var(--color-text-secondary)]">
            신뢰도, 3km 도달 수, 예상 방문객 지표를 기반으로 오늘 바로 촬영 가능한 후보를 추천합니다.
            필터를 조정해 매장 상황에 맞는 크리에이터를 찾아보세요.
          </p>
        </header>

        <Suspense fallback={<LoadGuard message="목록을 불러오는 중입니다. 잠시만 기다려 주세요." />}>
          <FilterableCreatorBoard />
        </Suspense>
      </section>
    </main>
  );
}
