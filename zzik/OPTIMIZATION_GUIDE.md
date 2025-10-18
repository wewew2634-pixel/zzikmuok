# ZZMUK 최적화 가이드

## 개요

이 문서는 ZZMUK 프로젝트의 성능, 보안, 접근성을 최적화하기 위한 실행 가능한 가이드입니다.

---

## 1. 즉시 적용 가능한 최적화 (30분)

### 1.1 API 키 보안 강화

#### 현재 상태
- `.env.local`에 API 키 저장 ✅
- 서버 사이드에서만 사용 ✅

#### 추가 개선
```.gitignore
# .gitignore에 확실히 추가
.env.local
.env*.local
```

### 1.2 에러 바운더리 추가

**파일 생성**: `src/app/error.tsx`

```typescript
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-dvh flex items-center justify-center p-6 bg-[var(--surface-900)] text-[var(--text)]">
      <div className="glass p-8 max-w-md text-center space-y-4">
        <h2 className="text-2xl font-semibold">오류가 발생했습니다</h2>
        <p className="opacity-75 text-sm">
          {error.message || "알 수 없는 오류가 발생했습니다."}
        </p>
        <button onClick={reset} className="btn btn-cta">
          다시 시도
        </button>
      </div>
    </div>
  );
}
```

### 1.3 로딩 상태 추가

**파일 생성**: `src/app/loading.tsx`

```typescript
export default function Loading() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--surface-900)]">
      <div className="skeleton h-64 w-full max-w-2xl"></div>
    </div>
  );
}
```

---

## 2. 단기 최적화 (1주일)

### 2.1 Rate Limiting 추가

#### 옵션 A: Upstash Redis (권장)

**설치**:
```bash
npm install @upstash/ratelimit @upstash/redis
```

**환경 변수** (`.env.local`):
```env
UPSTASH_REDIS_REST_URL=your-url
UPSTASH_REDIS_REST_TOKEN=your-token
```

**구현** (`src/lib/ratelimit.ts`):
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 분당 10회
  analytics: true,
});
```

**API에 적용** (`src/app/api/chat/route.ts`):
```typescript
import { ratelimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  // Rate limit 체크
  const identifier = req.headers.get("x-forwarded-for") || "anonymous";
  const { success, limit, reset, remaining } = await ratelimit.limit(
    identifier
  );

  if (!success) {
    return new Response(
      JSON.stringify({
        error: "Too many requests",
        limit,
        reset: new Date(reset).toISOString(),
        remaining,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      }
    );
  }

  // ... 기존 로직
}
```

#### 옵션 B: 로컬 인메모리 (간단, Vercel Edge에서 제한적)

```typescript
// src/lib/simple-ratelimit.ts
const requests = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const record = requests.get(identifier);

  if (!record || now > record.resetTime) {
    requests.set(identifier, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0 };
  }

  record.count++;
  return { success: true, remaining: limit - record.count };
}
```

### 2.2 응답 캐싱 (선택적)

시스템 프롬프트 등 정적 콘텐츠는 캐싱:

```typescript
// src/lib/prompts.ts
export const SYSTEM_PROMPTS = {
  default:
    "너는 한국어로 짧고 명확하게 답하는 ZZMUK 제품 챗봇이다. " +
    "ZZMUK은 3km 반경 내에서 로컬 숏폼 크리에이터와 상점을 즉시 매칭하고 T+0 정산을 지원하는 플랫폼이다. " +
    "질문이 불명확하면 추가 맥락을 물어봐라.",
} as const;
```

### 2.3 채팅 히스토리 로컬 저장

**파일 수정**: `public/chat.js`

```javascript
// LocalStorage 키
const HISTORY_KEY = "zzmuk_chat_history";
const MAX_STORED = 50;

// 히스토리 로드
function loadHistory() {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// 히스토리 저장
function saveHistory(history) {
  try {
    const limited = history.slice(-MAX_STORED);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(limited));
  } catch (err) {
    console.warn("Failed to save history:", err);
  }
}

// 초기화 시 로드
const history = loadHistory();

// 메시지 추가 시 저장
$form.addEventListener("submit", async (e) => {
  // ... 메시지 추가 후
  saveHistory(history);
});
```

---

## 3. 중기 최적화 (1개월)

### 3.1 이미지 최적화

#### Next.js Image 컴포넌트 사용

**Before** (page.tsx):
```tsx
<div className="h-8 w-8 rounded-xl bg-[var(--emerald-500)]"></div>
```

**After**:
```tsx
import Image from "next/image";

<Image
  src="/logo.svg"
  alt="ZZMUK 로고"
  width={32}
  height={32}
  className="rounded-xl"
  priority
/>
```

#### 스켈레톤 → 실제 이미지 교체

```tsx
// Before: skeleton
<div className="skeleton h-64 md:h-80 mb-4"></div>

// After: 실제 이미지
<Image
  src="/hero-image.jpg"
  alt="ZZMUK 플랫폼 데모"
  width={800}
  height={600}
  className="rounded-2xl"
  priority
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### 3.2 폰트 최적화

**파일 수정**: `src/app/layout.tsx`

```typescript
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

**tokens.css 수정**:
```css
@theme {
  --font-sans: var(--font-inter), sans-serif;
}
```

### 3.3 CSS 번들 최적화

#### utilities.css 정리

**Before** (card-3d):
```css
.card-3d {
  position: relative;
  box-shadow: var(--shadow-outer);
  border-radius: 24px;
}

.card-3d::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 24px;
  pointer-events: none;
  box-shadow: var(--shadow-inner);
}
```

**After** (레이어 축소):
```css
.card-3d {
  position: relative;
  box-shadow: var(--shadow-outer), var(--shadow-inner);
  border-radius: 24px;
}
```

### 3.4 메타데이터 최적화

**파일 수정**: `src/app/layout.tsx`

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZZMUK - 로컬 숏폼 즉시 매칭",
  description:
    "3km 반경 내 크리에이터와 상점을 5분 내 연결. T+0 당일 정산 지원.",
  keywords: ["로컬 마케팅", "숏폼", "크리에이터", "즉시 정산"],
  authors: [{ name: "ZZMUK Team" }],
  openGraph: {
    title: "ZZMUK - 로컬 숏폼 즉시 매칭",
    description: "3km 반경 내 크리에이터와 상점을 5분 내 연결",
    url: "https://zzmuk.com",
    siteName: "ZZMUK",
    locale: "ko_KR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

---

## 4. 장기 최적화 (3개월)

### 4.1 모니터링 추가

#### Vercel Analytics

```bash
npm install @vercel/analytics
```

```typescript
// src/app/layout.tsx
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

#### Sentry 에러 추적

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### 4.2 A/B 테스팅

#### Vercel Edge Config

```typescript
// src/lib/experiments.ts
import { get } from "@vercel/edge-config";

export async function getExperiment(key: string) {
  return await get(key);
}
```

```typescript
// src/app/page.tsx
import { getExperiment } from "@/lib/experiments";

export default async function Home() {
  const showNewCTA = await getExperiment("new_cta_variant");

  return (
    <main>
      {showNewCTA ? (
        <button className="btn btn-cta">지금 시작하기 →</button>
      ) : (
        <button className="btn btn-cta">무료로 시작</button>
      )}
    </main>
  );
}
```

### 4.3 멀티모달 지원

#### 이미지 업로드 추가

```typescript
// src/app/api/chat/route.ts 확장
interface Message {
  role: "user" | "assistant" | "system";
  content: string | { type: "text" | "image_url"; text?: string; image_url?: string }[];
}

// OpenAI 호출 시
const stream = await client.chat.completions.create({
  model: "gpt-4o", // vision 모델 필요
  messages: [...],
});
```

---

## 5. 성능 벤치마크 목표

### 5.1 Lighthouse 점수

| 카테고리 | 현재 | 목표 |
|----------|------|------|
| Performance | 85-90 | ≥95 |
| Accessibility | 90-95 | ≥98 |
| Best Practices | 85-90 | ≥95 |
| SEO | 85-90 | ≥95 |

### 5.2 Core Web Vitals

| 지표 | 현재 | 목표 |
|------|------|------|
| LCP (Largest Contentful Paint) | ~2s | <1.5s |
| FID (First Input Delay) | ~50ms | <100ms |
| CLS (Cumulative Layout Shift) | 0 | 0 |
| TTFB (Time to First Byte) | ~300ms | <200ms |

### 5.3 API 성능

| 지표 | 현재 | 목표 |
|------|------|------|
| 첫 토큰 응답 시간 | ~500ms | <300ms |
| 스트리밍 지연 | ~100ms | <50ms |
| 에러율 | <1% | <0.1% |

---

## 6. 테스트 자동화

### 6.1 E2E 테스트 (Playwright)

```bash
npm install -D @playwright/test
```

```typescript
// tests/chat.spec.ts
import { test, expect } from "@playwright/test";

test("채팅 메시지 전송 및 응답", async ({ page }) => {
  await page.goto("http://localhost:3000");

  // 채팅 입력
  await page.fill("#chat-input", "안녕하세요");
  await page.click('button[type="submit"]');

  // 응답 대기
  await page.waitForSelector('[data-stream="assistant"]', { timeout: 5000 });

  // 응답 확인
  const response = await page.textContent('[data-stream="assistant"]');
  expect(response).toBeTruthy();
});
```

### 6.2 접근성 테스트 (axe)

```bash
npm install -D @axe-core/playwright
```

```typescript
// tests/accessibility.spec.ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("접근성 위반 없음", async ({ page }) => {
  await page.goto("http://localhost:3000");

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});
```

---

## 7. 배포 최적화

### 7.1 Vercel 설정

**vercel.json**:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["icn1"],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    }
  ]
}
```

### 7.2 환경 변수 관리

**Production 환경**:
- `OPENAI_API_KEY` (필수)
- `UPSTASH_REDIS_REST_URL` (Rate Limiting 사용 시)
- `UPSTASH_REDIS_REST_TOKEN`
- `NEXT_PUBLIC_SENTRY_DSN` (모니터링 사용 시)

---

## 8. 최종 체크리스트

### 즉시 적용 (30분)
- [ ] `.gitignore`에 `.env.local` 추가 확인
- [ ] `error.tsx` 에러 바운더리 추가
- [ ] `loading.tsx` 로딩 상태 추가

### 1주일 내
- [ ] Rate Limiting 구현 (Upstash or 인메모리)
- [ ] 채팅 히스토리 로컬 저장
- [ ] API 에러 핸들링 강화

### 1개월 내
- [ ] 이미지 최적화 (Next/Image 사용)
- [ ] 폰트 최적화 (next/font)
- [ ] CSS 번들 크기 축소
- [ ] 메타데이터 SEO 최적화

### 3개월 내
- [ ] Vercel Analytics 통합
- [ ] Sentry 에러 추적
- [ ] E2E 테스트 자동화
- [ ] A/B 테스팅 인프라
- [ ] 멀티모달 지원 (이미지 업로드)

---

**최종 업데이트**: 2025-10-17  
**다음 리뷰**: 수정 적용 후 1주일 뒤
