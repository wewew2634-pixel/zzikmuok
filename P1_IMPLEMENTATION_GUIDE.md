# 🚀 P1 구현 가이드: 지속 배너 + 가이드 드로어

**브랜치**: `feature/p1-banner-guideline`  
**목표**: 전환 +4-9%p, 이탈 -5-10%, 반려율 -5-10%  
**완료 날짜**: 2025-10-17  

---

## 📦 구현된 컴포넌트

### 1. BannerProvider (시스템 배너)
**경로**: `src/components/system/BannerProvider.tsx`

**기능**:
- 전역 배너 상태 관리 (Context API)
- 5가지 배너 타입: `info`, `success`, `warning`, `error`, `progress`
- 스팸 방지: 동시에 1개 배너만 노출
- Sticky 배너: 사용자가 닫을 때까지 유지
- TTL 지원: 자동 소멸 (ms)

**API**:
```typescript
const { push, replace, dismiss, clear } = useBanner();

// 배너 추가
push({
  id: 'unique-id',
  kind: 'success',
  title: '승인 완료',
  body: '지금 시작하면 더 빨리 정산돼요.',
  sticky: true,
  actions: [{
    label: '시작하기',
    onClick: () => console.log('Clicked!')
  }]
});

// 배너 교체 (기존 제거 후 추가)
replace({...});

// 특정 배너 제거
dismiss('unique-id');

// 모든 배너 제거
clear();
```

---

### 2. useMissionBanners (미션 상태→배너 매핑)
**경로**: `src/components/mission/useMissionBanners.ts`

**기능**:
- 미션 상태별 자동 배너 노출
- 6가지 상태 지원:
  - `applied_pending`: 승인 대기 (평균 15분)
  - `approved`: 승인 완료
  - `submitted`: 검수 중 (평균 2시간)
  - `rejected`: 반려됨 (가이드 링크)
  - `completed`: 정산 진행 중 (T+0 24h)
  - `paid`: 정산 완료

**사용법**:
```typescript
import { useMissionBanners } from '@/components/mission/useMissionBanners';

function MissionDetailPage({ mission }) {
  useMissionBanners(mission.state);
  
  return <div>...</div>;
}
```

---

### 3. GuidelineDrawer (콘텐츠 가이드)
**경로**: `src/components/guideline/GuidelineDrawer.tsx`

**기능**:
- 콘텐츠 제작 가이드라인 표시
- ✅ 해야 할 것: 화질, 사실 정보, 라이선스 BGM
- 🚫 금지 사항: 경쟁사 비교, 초상권 침해, 왜곡
- 저작권·초상권·상표권 체크리스트

**사용법**:
```typescript
import { GuidelineDrawer, openGuideline } from '@/components/guideline/GuidelineDrawer';

function MyComponent() {
  return (
    <>
      <button id="open-guideline" onClick={openGuideline}>
        가이드 보기
      </button>
      <GuidelineDrawer />
    </>
  );
}
```

---

### 4. Analytics (이벤트 계측)
**경로**: `src/lib/analytics/events.ts`

**이벤트**:
- `banner_show`: 배너 노출 추적
- `banner_click`: 배너 액션 클릭 추적
- `guideline_open`: 가이드 열람 추적
- `guideline_ack`: 가이드 확인 추적

**사용법**:
```typescript
import { Analytics } from '@/lib/analytics/events';

// 배너 노출 시
Analytics.banner_show({
  id: 'pending',
  kind: 'progress',
  place: 'mission-detail'
});

// 배너 액션 클릭 시
Analytics.banner_click({
  id: 'approved',
  label: '시작하기'
});

// 가이드 열람
Analytics.guideline_open('mission-detail');

// 가이드 확인
Analytics.guideline_ack('mission-detail');
```

---

## 🔧 통합 방법

### Step 1: 프로바이더 추가 (app/layout.tsx)
```typescript
import { BannerProvider } from '@/components/system/BannerProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <BannerProvider>
          {children}
        </BannerProvider>
      </body>
    </html>
  );
}
```

### Step 2: 미션 상세 페이지에서 사용
```typescript
'use client';
import { useMissionBanners } from '@/components/mission/useMissionBanners';
import { GuidelineDrawer, openGuideline } from '@/components/guideline/GuidelineDrawer';

export default function MissionDetailPage({ mission }) {
  // 자동으로 상태별 배너 노출
  useMissionBanners(mission.state);
  
  return (
    <div>
      <h1>{mission.title}</h1>
      
      {/* 가이드 트리거 */}
      <button id="open-guideline" onClick={openGuideline}>
        가이드 보기
      </button>
      
      {/* 미션 시작 버튼 (배너에서 클릭 시 트리거) */}
      <button id="start-mission" onClick={handleStart}>
        미션 시작
      </button>
      
      {/* 가이드 드로어 */}
      <GuidelineDrawer />
    </div>
  );
}
```

### Step 3: 기존 토스트 마이그레이션
```typescript
// ❌ 기존: 토스트 사용
toast.success('미션 신청이 완료되었습니다.');

// ✅ 새로운 방법: 배너 사용
const { replace } = useBanner();
replace({
  id: 'pending',
  kind: 'progress',
  title: '승인 대기 중',
  body: '평균 15분 내 검토됩니다.',
  sticky: true
});
```

---

## 📊 KPI 및 수용 기준

### 1차 KPI (필수)
- [ ] 배너 클릭률 ≥35%
- [ ] 동일 화면 배너 1개 초과 노출 금지
- [ ] 6개 미션 상태별 배너 정상 노출

### 2차 KPI (목표)
- [ ] 신청→승인 전환 +≥5%p
- [ ] 반려율 ≤15%
- [ ] 가이드 드로어 1클릭 접근

### 계측 이벤트 (필수)
- [ ] `banner_show` 수집
- [ ] `banner_click` 수집
- [ ] `guideline_open` 수집
- [ ] `guideline_ack` 수집

---

## 🧪 테스트

### 단위 테스트
```bash
npm test __tests__/Banner.test.tsx
```

**테스트 커버리지**:
- ✅ 배너 push/replace/dismiss/clear
- ✅ Sticky 배너 동작
- ✅ TTL 자동 소멸
- ✅ 1개 배너만 노출 (스팸 방지)
- ✅ Context 외부 사용 시 에러

### 통합 테스트
1. `/splash` 접근 → 회귀 테스트
2. 미션 신청 → `applied_pending` 배너 노출 확인
3. 승인 완료 → `approved` 배너 + "시작하기" 버튼 확인
4. 반려 → `rejected` 배너 + "가이드 보기" 버튼 클릭 → 드로어 열림
5. 정산 완료 → `paid` 배너 노출 확인

---

## 🚀 배포 전략

### A/B 테스트 설정 (7일)
- **Control Group (50%)**: 기존 토스트 유지
- **Treatment Group (50%)**: 새로운 배너 + 가이드 드로어

**측정 지표**:
| 지표 | 기대치 | Stop-rule |
|------|--------|-----------|
| 배너 클릭률 | ≥35% | 2회 연속 <30% |
| 전환율 증가 | +4-9%p | 2회 연속 <5%p |
| 반려율 감소 | -5-10% | 2회 연속 개선 없음 |
| 이탈률 감소 | -5-10% | 2회 연속 개선 없음 |

**Stop-rule**: 2회 연속 개선 <5%p면 중단 → 대안 전환

---

## 📝 마이크로카피 (한국어)

| 상태 | 제목 | 본문 |
|------|------|------|
| **승인 대기** | 승인 대기 중 | 평균 15분 내 검토됩니다. |
| **승인 완료** | 승인 완료 | 지금 시작하면 더 빨리 정산돼요. |
| **검수 중** | 검수 중 | 평균 2시간 소요됩니다. |
| **반려됨** | 반려됨 | 가이드를 확인하고 재제출 해주세요. |
| **정산 진행** | 정산 진행 중 | T+0 당일 정산(최대 24h) 예상입니다. |
| **정산 완료** | 정산 완료 | 수고하셨어요! 내역은 지갑에서 확인. |

---

## 🔗 관련 파일

### 신규 파일 (7개)
1. `src/components/system/BannerProvider.tsx` (3.7KB)
2. `src/components/mission/useMissionBanners.ts` (1.7KB)
3. `src/components/guideline/GuidelineDrawer.tsx` (1.7KB)
4. `src/lib/analytics/events.ts` (1.7KB)
5. `src/types/mission.ts` (0.4KB)
6. `__tests__/Banner.test.tsx` (2.8KB)
7. `P1_IMPLEMENTATION_GUIDE.md` (본 문서)

### 수정 필요 파일 (예상)
1. `app/layout.tsx`: BannerProvider 추가
2. `app/missions/[id]/page.tsx`: useMissionBanners 적용
3. `app/splash/page.tsx`: 초기 배너 테스트 (선택)

---

## 🎯 다음 단계

### 즉시 (1-2시간)
- [ ] `app/layout.tsx`에 BannerProvider 추가
- [ ] 미션 상세 페이지에 useMissionBanners 적용
- [ ] GuidelineDrawer 트리거 버튼 추가

### 단기 (3-7일)
- [ ] A/B 테스트 설정 및 시작
- [ ] 계측 이벤트 수집 확인
- [ ] 1차 KPI 달성 여부 확인

### 중기 (7-14일)
- [ ] A/B 테스트 결과 분석
- [ ] Stop-rule 적용 (필요 시)
- [ ] 전사 배포 또는 대안 전환

---

**작성자**: AI System  
**최종 업데이트**: 2025-10-17  
**상태**: ✅ P1 구현 완료, 통합 대기
