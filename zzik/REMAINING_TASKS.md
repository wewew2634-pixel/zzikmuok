# ZZMUK 프로젝트 남은 작업 목록
**생성 일자:** 2025-10-22
**기준 커밋:** 0e2ee9e
**현재 진행률:** 88.9% (8/9 체크리스트)

---

## 📊 현재 상태 요약

### ✅ 완료된 작업 (최근 4개 커밋)
1. **0e2ee9e** - 무한 로딩 문제 근본 해결 (Chat ID, Hero/Showcase skeleton 교체)
2. **3efea89** - 대규모 레포지토리 정리 (148MB 디자인 템플릿 삭제)
3. **fd2283e** - 딥다이브 진단 분석 보고서 (875 lines)
4. **e53a6b5** - ZZMUK v1 API 구현 (4개 엔드포인트, QR 시스템)

### 🎯 목표
- **단기:** Phase 0/1 완료 → 파일럿 배포 가능
- **중기:** Phase 2 완료 → 프로덕션 준비
- **장기:** Phase 3 완료 → 스케일링/모니터링

---

## 🔴 Phase 0: 긴급 조치 (T+0 ~ T+24h)

### 1. 보안 이슈 해결

#### 1.1 GitHub PAT 폐기 🔴 **P0-CRITICAL**
- **작업:** 노출된 토큰 `ghp_2ukt...` 즉시 폐기
- **수행자:** 사용자 (수동)
- **예상 시간:** 5분
- **절차:**
  ```bash
  # 1. GitHub → Settings → Developer settings → Personal access tokens
  # 2. 해당 토큰 찾기 → Revoke
  # 3. 새 토큰 발급 (7일 만료 설정)
  ```
- **완료 조건:** 토큰 삭제 확인 + Secret scanning 알림 없음

#### 1.2 Secret Scanning 활성화 🟡 **P1**
- **작업:** GitHub Secret Scanning + Push Protection 활성화
- **수행자:** 사용자
- **예상 시간:** 10분
- **절차:**
  ```
  Repository → Settings → Code security and analysis
  → Secret scanning: Enable
  → Push protection: Enable
  ```
- **완료 조건:** Settings에서 "Enabled" 확인

#### 1.3 Pre-commit Hook (gitleaks) 🟡 **P1**
- **작업:** 로컬 커밋 전 시크릿 검증
- **수행자:** 개발
- **예상 시간:** 30분
- **구현:**
  ```bash
  # .husky/pre-commit
  npx gitleaks protect --staged --verbose
  ```
- **완료 조건:** 의도적 시크릿 커밋 시도 → 블록 확인

---

### 2. API 보안 강화

#### 2.1 Webhook 서명 검증 구현 🔴 **P0-HIGH**
- **작업:** HMAC-SHA256 서명 검증 추가
- **파일:** `mcp/server.js:307`
- **예상 시간:** 2시간
- **구현 체크리스트:**
  - [ ] `X-Pay-Signature` 헤더 검증
  - [ ] `X-Pay-Timestamp` 타임스탬프 검증 (±5분)
  - [ ] `PG_WEBHOOK_SECRET` 환경변수 추가
  - [ ] Event ID 기반 중복 방지 (Map/Set)
  - [ ] 401 Unauthorized 응답 처리
- **테스트:**
  ```bash
  # 유효 서명
  curl -X POST /api/v1/pg/webhook \
    -H "X-Pay-Signature: valid_hmac" \
    -H "X-Pay-Timestamp: $(date +%s)" \
    -d '{"status":"CAPTURED","event_id":"evt_123"}'
  # Expected: 200

  # 무효 서명
  curl -X POST /api/v1/pg/webhook \
    -H "X-Pay-Signature: invalid" \
    -d '{"status":"CAPTURED"}'
  # Expected: 401
  ```
- **완료 조건:** 테스트 2개 통과 + 문서화

#### 2.2 Redirect URL Allowlist 🟡 **P1**
- **작업:** 오픈 리다이렉트 방지
- **파일:** `mcp/server.js:284`
- **예상 시간:** 30분
- **구현:**
  ```javascript
  const ALLOWED_HOSTS = process.env.ALLOWED_REDIRECT_HOSTS.split(',');

  function isAllowedRedirect(url) {
    try {
      const u = new URL(url);
      return u.protocol === 'https:' && ALLOWED_HOSTS.includes(u.host);
    } catch { return false; }
  }
  ```
- **환경변수:** `ALLOWED_REDIRECT_HOSTS=payment-gateway.example.com,pg.zzmuk.com`
- **완료 조건:** 차단 테스트 통과

#### 2.3 Rate Limiting 추가 🟡 **P1**
- **작업:** 기본 rate limiting (express-rate-limit)
- **예상 시간:** 1시간
- **구현:**
  ```javascript
  const rateLimit = require('express-rate-limit');

  const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1분
    max: 100, // IP당 100 req/min
    message: { error: 'RATE_LIMIT_EXCEEDED' }
  });

  app.use('/api/', apiLimiter);
  ```
- **완료 조건:** 101번째 요청 → 429 Too Many Requests

---

## 🟡 Phase 1: 단기 개선 (T+1w ~ T+2w)

### 3. 빌드 & 환경 수정

#### 3.1 Google Fonts 네트워크 에러 해결 🔴 **P0-BUILD**
- **문제:** `next build` 실패 (Google Fonts fetch 403)
- **파일:** `src/app/layout.tsx`
- **예상 시간:** 1시간
- **해결 옵션:**

  **Option A: Local Font 전환 (권장)**
  ```typescript
  // src/app/layout.tsx
  import localFont from 'next/font/local';

  const inter = localFont({
    src: '../fonts/Inter-Variable.woff2',
    variable: '--font-inter'
  });
  ```
  - [ ] `public/fonts/Inter-Variable.woff2` 다운로드
  - [ ] layout.tsx 수정
  - [ ] `npm run build` 테스트

  **Option B: Fallback 추가**
  ```typescript
  import { Inter } from 'next/font/google';

  const inter = Inter({
    subsets: ['latin'],
    fallback: ['system-ui', 'arial'],
    display: 'swap'
  });
  ```
  - [ ] fallback 추가
  - [ ] `NEXT_PUBLIC_SKIP_FONT_OPTIMIZATION=1` 환경변수

- **완료 조건:** `npm run build` 성공

#### 3.2 TypeScript 에러 수정 🟡 **P1**
- **문제:** 9개 TypeScript 에러
- **예상 시간:** 2시간
- **작업별 체크리스트:**

  **3.2.1 Stripe API Version**
  - [ ] `scripts/setup-stripe.ts:40` → `"2025-02-24.acacia"`
  - [ ] `src/lib/api-clients.ts:104` → `"2025-02-24.acacia"`

  **3.2.2 Prisma Types**
  - [ ] `src/lib/auth-db.ts:12` → Prisma generate 실행
  - [ ] `npx prisma generate` 후 타입 확인

  **3.2.3 Missing Type Definitions**
  - [ ] `npm install --save-dev @types/pg`
  - [ ] `src/lib/db.ts:8` import 확인

  **3.2.4 Implicit Any**
  - [ ] `src/app/api/auth/social-login/route.ts:140` → `account: Account`
  - [ ] `src/lib/db.ts:26` → `err: Error`
  - [ ] `src/lib/matching-engine.ts:140` → `sum: number, account: Account`

- **테스트:** `npx tsc --noEmit`
- **완료 조건:** 0 errors

#### 3.3 Playwright Docker 환경 구축 🔴 **P0-TEST**
- **문제:** PPA 403 에러로 `npx playwright install` 실패
- **예상 시간:** 4시간
- **해결 방법:**

  **Option A: Dockerfile 생성 (권장)**
  ```dockerfile
  # Dockerfile.playwright
  FROM mcr.microsoft.com/playwright:v1.49.1-jammy

  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .

  CMD ["npm", "run", "test:e2e"]
  ```
  - [ ] Dockerfile 생성
  - [ ] `.dockerignore` 추가
  - [ ] `docker build -t zzmuk-playwright -f Dockerfile.playwright .`
  - [ ] `docker run --rm zzmuk-playwright`

  **Option B: GitHub Actions (CI 우선)**
  ```yaml
  # .github/workflows/e2e.yml
  - uses: microsoft/playwright-github-action@v1
  - run: npm run test:e2e
  ```

- **완료 조건:** E2E 테스트 1개 이상 통과

---

### 4. E2E 테스트 실행

#### 4.1 Smoke Test 실행 🟡 **P1**
- **파일:** `tests/e2e/03-zzmuk-api-smoke.spec.ts`
- **예상 시간:** 30분 (환경 구축 후)
- **실행:**
  ```bash
  npm run test:e2e -- tests/e2e/03-zzmuk-api-smoke.spec.ts
  ```
- **검증 항목:**
  - [ ] Spec A: `/checkout` 400 (Idempotency-Key 없음)
  - [ ] Spec B: Full flow (checkout → webhook → redeem → 409)
  - [ ] Idempotent replay (같은 키 → 같은 세션)
  - [ ] Webhook status filtering
  - [ ] Feed endpoint smoke
- **완료 조건:** 5/5 tests passed

#### 4.2 TTL & Skew Test 실행 🟡 **P1**
- **파일:** `tests/e2e/04-zzmuk-ttl-and-skew.spec.ts`
- **예상 시간:** 30분
- **실행:**
  ```bash
  npm run test:e2e -- tests/e2e/04-zzmuk-ttl-and-skew.spec.ts
  ```
- **검증 항목:**
  - [ ] Fresh token redemption (200)
  - [ ] TTL metadata (300s)
  - [ ] Expiration timestamp (±5s tolerance)
  - [ ] Burst token issuance
  - [ ] Spec documentation test
  - [ ] ⏭️ Expired token test (`.skip` - time mocking 필요)
- **완료 조건:** 5/6 tests passed (1 skipped)

#### 4.3 Time Mocking 인프라 🟢 **P2**
- **작업:** 만료 테스트를 위한 시간 제어
- **예상 시간:** 3시간
- **구현:**

  **Option A: TimeProvider DI**
  ```javascript
  // lib/time-provider.js
  class TimeProvider {
    now() { return Date.now(); }
  }

  class FakeTimeProvider extends TimeProvider {
    constructor(fixedTime) { this.fixedTime = fixedTime; }
    now() { return this.fixedTime; }
    tick(ms) { this.fixedTime += ms; }
  }

  // mcp/server.js
  const timeProvider = process.env.TEST_MODE
    ? new FakeTimeProvider(Date.now())
    : new TimeProvider();

  const now = timeProvider.now();
  ```

  **Option B: Sinon Fake Timers**
  ```javascript
  import sinon from 'sinon';

  test('Expired token', async () => {
    const clock = sinon.useFakeTimers(Date.now());

    // QR 발급
    const { qr_token } = await issueQR();

    // 6분 경과 (TTL 5분 + drift 1분)
    clock.tick(6 * 60 * 1000);

    // Redeem 시도 → 410
    const res = await redeem(qr_token);
    expect(res.status).toBe(410);

    clock.restore();
  });
  ```

- **완료 조건:** 만료 테스트 통과 (410 확인)

---

### 5. API 품질 개선

#### 5.1 Idempotency-Key 검증 🟡 **P1**
- **작업:** 헤더 포맷 검증 (UUID v4)
- **파일:** `mcp/server.js:263`
- **예상 시간:** 1시간
- **구현:**
  ```javascript
  const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  const key = req.get('Idempotency-Key');
  if (!key || !UUID_V4_REGEX.test(key)) {
    return res.status(400).json({
      error: 'INVALID_IDEMPOTENCY_KEY',
      message: 'Idempotency-Key must be a valid UUID v4'
    });
  }
  ```
- **테스트:**
  ```bash
  # 유효 UUID
  curl -H "Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000" ...
  # Expected: 200

  # 무효 포맷
  curl -H "Idempotency-Key: invalid" ...
  # Expected: 400
  ```
- **완료 조건:** 포맷 검증 테스트 통과

#### 5.2 에러 포맷 표준화 🟢 **P2**
- **작업:** 일관된 에러 응답 스키마
- **예상 시간:** 2시간
- **구현:**
  ```javascript
  // lib/error-response.js
  function errorResponse(res, statusCode, errorCode, message, details = {}) {
    return res.status(statusCode).json({
      error: {
        code: errorCode,
        message,
        details,
        timestamp: new Date().toISOString(),
        request_id: req.id // express-request-id
      }
    });
  }

  // 사용 예시
  if (tokenData.used) {
    return errorResponse(res, 409, 'TOKEN_ALREADY_USED',
      'This QR token has already been redeemed',
      { used_at: tokenData.usedAt }
    );
  }
  ```
- **완료 조건:** 모든 에러 응답 표준 포맷 사용

#### 5.3 구조화 로그 도입 🟢 **P2**
- **작업:** Winston/Pino 로거 + 구조화 로그
- **예상 시간:** 3시간
- **구현:**
  ```javascript
  const pino = require('pino');
  const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    formatters: {
      level: (label) => ({ level: label })
    }
  });

  // 사용
  logger.info({
    event: 'qr_redeemed',
    token: qrToken,
    session_id: sessionId,
    merchant_location: location
  });
  ```
- **완료 조건:** 주요 이벤트 로그 구조화 완료

---

### 6. 프론트엔드 기능 완성

#### 6.1 Chat API 백엔드 구현 🟡 **P1**
- **문제:** `/api/chat` 엔드포인트 없음 (page.tsx에서 호출 중)
- **파일:** `src/app/api/chat/route.ts` (신규)
- **예상 시간:** 4시간
- **구현:**
  ```typescript
  // src/app/api/chat/route.ts
  import { OpenAI } from 'openai';

  export async function POST(req: Request) {
    const { history } = await req.json();

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: history,
      stream: true
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content || '';
          if (delta) {
            const data = `data: ${JSON.stringify({ delta })}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
        }
        controller.enqueue(encoder.encode('event: done\n\n'));
        controller.close();
      }
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  }
  ```
- **환경변수:** `OPENAI_API_KEY=sk-...`
- **테스트:**
  ```bash
  curl -X POST http://localhost:3000/api/chat \
    -H "Content-Type: application/json" \
    -d '{"history":[{"role":"user","content":"안녕"}]}'
  # Expected: SSE stream
  ```
- **완료 조건:** Chat 기능 정상 작동 (웰컴 메시지 → 응답)

#### 6.2 환경변수 검증 🟡 **P1**
- **작업:** 필수 환경변수 검증
- **파일:** `lib/env.ts` (신규)
- **예상 시간:** 1시간
- **구현:**
  ```typescript
  import { z } from 'zod';

  const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']),
    PG_WEBHOOK_SECRET: z.string().min(32),
    OPENAI_API_KEY: z.string().startsWith('sk-'),
    ALLOWED_REDIRECT_HOSTS: z.string(),
    DATABASE_URL: z.string().url().optional()
  });

  export const env = envSchema.parse(process.env);
  ```
- **완료 조건:** 필수 변수 누락 시 startup 실패

---

## 🟠 Phase 2: 중기 개선 (T+2w ~ T+1m)

### 7. 데이터베이스 마이그레이션

#### 7.1 Redis 전환 (/redeem 원자성) 🔴 **P0-SCALE**
- **작업:** In-memory Map → Redis + Lua scripts
- **예상 시간:** 1일 (8시간)
- **구현 단계:**

  **Step 1: Redis 클라이언트 설정**
  ```javascript
  const redis = require('redis');
  const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });
  await client.connect();
  ```

  **Step 2: Lua Script (원자적 redeem)**
  ```lua
  -- redeem-qr.lua
  local token = KEYS[1]
  local now = tonumber(ARGV[1])
  local location = ARGV[2]

  -- 존재 확인
  if redis.call('EXISTS', token) == 0 then
    return {404, 'TOKEN_NOT_FOUND'}
  end

  -- 사용 여부 확인
  local used = redis.call('HGET', token, 'used')
  if used == '1' then
    local used_at = redis.call('HGET', token, 'used_at')
    return {409, used_at}
  end

  -- TTL 확인 (±60s drift)
  local expires_at = tonumber(redis.call('HGET', token, 'expires_at'))
  if now > expires_at + 60000 then
    return {410, 'TOKEN_EXPIRED'}
  end

  -- 원자적 사용 처리
  redis.call('HSET', token, 'used', '1', 'used_at', now, 'location', location)

  return {200, now}
  ```

  **Step 3: Node.js 통합**
  ```javascript
  const redeemScript = fs.readFileSync('./redeem-qr.lua', 'utf8');

  app.post('/api/v1/redeem', async (req, res) => {
    const { qr_token, merchant_location } = req.body;

    const result = await client.eval(redeemScript, {
      keys: [qr_token],
      arguments: [Date.now().toString(), merchant_location]
    });

    const [status, data] = result;

    if (status === 200) {
      return res.json({
        success: true,
        redeemed_at: new Date(parseInt(data)).toISOString()
      });
    } else if (status === 409) {
      return res.status(409).json({
        error: 'TOKEN_ALREADY_USED',
        used_at: new Date(parseInt(data)).toISOString()
      });
    }
    // ... 기타 상태 처리
  });
  ```

- **테스트:**
  - [ ] 동시 redeem 요청 (100개) → 1개만 성공
  - [ ] 만료 토큰 → 410
  - [ ] 미존재 토큰 → 404
- **완료 조건:** Race condition 테스트 통과

#### 7.2 Prisma 스키마 작성 🔴 **P0-DB**
- **예상 시간:** 2일 (16시간)
- **구현:**

  **Step 1: Schema 정의**
  ```prisma
  // prisma/schema.prisma

  generator client {
    provider        = "prisma-client-js"
    previewFeatures = ["postgresqlExtensions"]
  }

  datasource db {
    provider   = "postgresql"
    url        = env("DATABASE_URL")
    extensions = [postgis]
  }

  model CheckoutSession {
    id               String   @id @default(uuid())
    idempotencyKey   String   @unique @map("idempotency_key")
    sessionId        String   @unique @map("session_id")
    redirectUrl      String   @map("redirect_url")
    amount           Int
    currency         String   @default("KRW")
    status           String   @default("pending")
    createdAt        DateTime @default(now()) @map("created_at")

    qrTokens         QRToken[]

    @@index([idempotencyKey])
    @@map("checkout_sessions")
  }

  model QRToken {
    id               String   @id @default(uuid())
    token            String   @unique
    sessionId        String   @map("session_id")
    session          CheckoutSession @relation(fields: [sessionId], references: [sessionId])
    paymentId        String?  @map("payment_id")
    expiresAt        DateTime @map("expires_at")
    used             Boolean  @default(false)
    usedAt           DateTime? @map("used_at")
    merchantLocation String?  @map("merchant_location")
    createdAt        DateTime @default(now()) @map("created_at")

    @@index([token])
    @@index([expiresAt])
    @@index([used, expiresAt])
    @@map("qr_tokens")
  }

  model Offer {
    id               String   @id @default(uuid())
    title            String
    description      String?
    merchantId       String   @map("merchant_id")
    location         Unsupported("geography(Point,4326)")
    distanceKm       Float?   @map("distance_km") // Computed field
    slotsAvailable   Int      @map("slots_available")
    price            Int
    currency         String   @default("KRW")
    openNow          Boolean  @map("open_now") @default(true)

    // Ranking components
    intentScore      Float    @map("intent_score") @default(0.5)
    availabilityScore Float   @map("availability_score") @default(0.5)
    freshnessScore   Float    @map("freshness_score") @default(1.0)
    roiScore         Float    @map("roi_score") @default(0.5)

    createdAt        DateTime @default(now()) @map("created_at")
    updatedAt        DateTime @updatedAt @map("updated_at")

    @@index([location], type: Gist)
    @@index([openNow, slotsAvailable])
    @@map("offers")
  }
  ```

  **Step 2: Migration 생성**
  ```bash
  npx prisma migrate dev --name init_zzmuk_schema
  ```

  **Step 3: PostGIS 활성화**
  ```sql
  -- migrations/001_enable_postgis.sql
  CREATE EXTENSION IF NOT EXISTS postgis;
  CREATE EXTENSION IF NOT EXISTS postgis_topology;
  ```

- **완료 조건:** `npx prisma db push` 성공

#### 7.3 PostGIS 전환 (/feed) 🟡 **P1-PERF**
- **예상 시간:** 3일 (24시간)
- **구현:**

  **Step 1: 공간 쿼리 구현**
  ```typescript
  // lib/feed-service.ts
  import { PrismaClient } from '@prisma/client';

  const prisma = new PrismaClient();

  export async function getOffers(lat: number, lng: number, budgetMin: number, budgetMax: number) {
    const offers = await prisma.$queryRaw`
      SELECT
        id,
        title,
        ST_Distance(
          location::geography,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
        ) / 1000.0 AS distance_km,
        slots_available,
        price,
        (
          0.35 * intent_score +
          0.25 * (1 / (1 + ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography) / 1000.0)) +
          0.20 * availability_score +
          0.10 * freshness_score +
          0.10 * roi_score
        ) AS score
      FROM offers
      WHERE
        ST_DWithin(
          location::geography,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
          3000
        )
        AND open_now = true
        AND slots_available > 0
        AND price BETWEEN ${budgetMin} AND ${budgetMax}
      ORDER BY score DESC, distance_km ASC
      LIMIT 50
    `;

    return offers;
  }
  ```

  **Step 2: API 통합**
  ```javascript
  app.get('/api/v1/feed', async (req, res) => {
    const { lat, lng, budget_min = 0, budget_max = 1000000 } = req.query;

    // 파라미터 검증
    if (!lat || !lng) {
      return res.status(400).json({
        error: 'MISSING_LOCATION',
        message: 'lat and lng parameters are required'
      });
    }

    const offers = await getOffers(
      parseFloat(lat),
      parseFloat(lng),
      parseInt(budget_min),
      parseInt(budget_max)
    );

    res.json({
      success: true,
      count: offers.length,
      offers,
      filters_applied: {
        radius_km: 3.0,
        budget: { min: budget_min, max: budget_max }
      }
    });
  });
  ```

- **성능 목표:** p95 < 200ms
- **테스트:**
  - [ ] 3km 내 필터링
  - [ ] 정렬 (score DESC, distance ASC)
  - [ ] 예산 범위 필터
  - [ ] 부하 테스트 (100 req/s)
- **완료 조건:** 성능 목표 달성 + 기능 테스트 통과

#### 7.4 TimeProvider 추상화 🟢 **P2-TEST**
- **작업:** 테스트 가능한 시간 로직
- **예상 시간:** 1일 (8시간)
- **구현:**
  ```typescript
  // lib/time-provider.ts
  export interface ITimeProvider {
    now(): number;
    nowISO(): string;
  }

  export class SystemTimeProvider implements ITimeProvider {
    now(): number {
      return Date.now();
    }

    nowISO(): string {
      return new Date().toISOString();
    }
  }

  export class FakeTimeProvider implements ITimeProvider {
    constructor(private currentTime: number = Date.now()) {}

    now(): number {
      return this.currentTime;
    }

    nowISO(): string {
      return new Date(this.currentTime).toISOString();
    }

    tick(ms: number): void {
      this.currentTime += ms;
    }

    setTime(timestamp: number): void {
      this.currentTime = timestamp;
    }
  }

  // DI Container
  export const timeProvider: ITimeProvider = process.env.NODE_ENV === 'test'
    ? new FakeTimeProvider()
    : new SystemTimeProvider();
  ```

  **사용 예시:**
  ```javascript
  // mcp/server.js
  const { timeProvider } = require('./lib/time-provider');

  app.post('/api/v1/pg/webhook', (req, res) => {
    const now = timeProvider.now();
    const expiresAt = now + (5 * 60 * 1000);

    qrTokens.set(token, {
      expiresAt,
      createdAt: now
    });
  });

  // tests/ttl.spec.ts
  import { FakeTimeProvider } from './lib/time-provider';

  test('Expired token returns 410', async () => {
    const fakeTime = new FakeTimeProvider();

    // QR 발급
    const { token } = await issueQR();

    // 6분 경과
    fakeTime.tick(6 * 60 * 1000);

    // Redeem → 410
    const res = await redeem(token);
    expect(res.status).toBe(410);
  });
  ```

- **완료 조건:** TTL 만료 테스트 활성화 (`.skip` 제거)

#### 7.5 Unit 테스트 추가 🟢 **P2**
- **예상 시간:** 2일 (16시간)
- **대상:**
  - [ ] `lib/feed-service.ts` (공간 쿼리)
  - [ ] `lib/redeem-service.ts` (원자적 처리)
  - [ ] `lib/webhook-verifier.ts` (서명 검증)
  - [ ] `lib/error-response.ts` (에러 포맷)
- **프레임워크:** Jest
- **커버리지 목표:** >80%
- **완료 조건:** `npm run test:unit` 통과

---

## 🟢 Phase 3: 프로덕션 준비 (T+1m ~ T+2m)

### 8. 모니터링 & 옵저버빌리티

#### 8.1 Prometheus 메트릭 🟡 **P1-OPS**
- **예상 시간:** 2일
- **구현:**
  ```javascript
  const promClient = require('prom-client');
  const register = new promClient.Registry();

  // 메트릭 정의
  const httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_ms',
    help: 'HTTP request duration in milliseconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [10, 50, 100, 200, 500, 1000, 2000]
  });

  const qrRedeemCounter = new promClient.Counter({
    name: 'qr_redeem_total',
    help: 'Total QR redemptions',
    labelNames: ['status']
  });

  register.registerMetric(httpRequestDuration);
  register.registerMetric(qrRedeemCounter);

  // 엔드포인트
  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });
  ```
- **완료 조건:** Grafana 대시보드 연동

#### 8.2 CI/CD 파이프라인 🟡 **P1-OPS**
- **예상 시간:** 3일
- **구현:**
  ```yaml
  # .github/workflows/ci.yml
  name: CI

  on: [push, pull_request]

  jobs:
    test:
      runs-on: ubuntu-latest

      services:
        postgres:
          image: postgis/postgis:16-3.4
          env:
            POSTGRES_PASSWORD: postgres
          options: >-
            --health-cmd pg_isready
            --health-interval 10s

        redis:
          image: redis:7-alpine

      steps:
        - uses: actions/checkout@v4

        - uses: actions/setup-node@v4
          with:
            node-version: '20'
            cache: 'npm'

        - run: npm ci

        - run: npx prisma migrate deploy

        - run: npm run test:unit

        - run: npm run test:e2e

        - run: npm run build

        - name: Upload coverage
          uses: codecov/codecov-action@v3
  ```
- **완료 조건:** PR 자동 검증 활성화

#### 8.3 부하 테스트 🟡 **P1-PERF**
- **예상 시간:** 2일
- **도구:** k6
- **시나리오:**
  ```javascript
  // tests/load/redeem-flow.js
  import http from 'k6/http';
  import { check } from 'k6';

  export const options = {
    stages: [
      { duration: '2m', target: 100 },  // Ramp-up
      { duration: '5m', target: 100 },  // Steady
      { duration: '2m', target: 0 }     // Ramp-down
    ],
    thresholds: {
      http_req_duration: ['p(95)<200'],  // 95% < 200ms
      http_req_failed: ['rate<0.01']     // 1% 에러율
    }
  };

  export default function() {
    // 1. Checkout
    const checkoutRes = http.post('http://api/v1/checkout', JSON.stringify({
      offer_id: 'offer_1',
      amount: 15000
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': `${__VU}-${__ITER}`
      }
    });

    check(checkoutRes, {
      'checkout is 200': (r) => r.status === 200
    });

    // 2. Webhook (PG simulation)
    const sessionId = checkoutRes.json('session_id');
    http.post('http://api/v1/pg/webhook', JSON.stringify({
      session_id: sessionId,
      status: 'CAPTURED',
      amount: 15000
    }));

    // 3. Feed query
    const feedRes = http.get('http://api/v1/feed?lat=37.5665&lng=126.9780');

    check(feedRes, {
      'feed p95 < 200ms': (r) => r.timings.duration < 200
    });
  }
  ```
- **목표:**
  - `/feed`: p95 < 200ms @ 100 RPS
  - `/redeem`: p95 < 100ms @ 50 RPS
- **완료 조건:** 목표 달성

#### 8.4 Percy 시각 회귀 🔵 **P3-NICE**
- **예상 시간:** 1일
- **조건:** Percy 토큰 발급 필요
- **구현:**
  ```typescript
  // tests/e2e/visual.spec.ts
  import { test } from '@playwright/test';
  import percySnapshot from '@percy/playwright';

  test('Homepage visual regression', async ({ page }) => {
    await page.goto('/');
    await percySnapshot(page, 'Homepage');
  });

  test('Chat interaction', async ({ page }) => {
    await page.goto('/');
    await page.fill('#chat-input', 'Hello');
    await page.click('button[type=submit]');
    await page.waitForSelector('[data-stream="assistant"]');
    await percySnapshot(page, 'Chat response');
  });
  ```
- **완료 조건:** Percy 대시보드에서 스냅샷 확인

#### 8.5 모니터링 대시보드 🟢 **P2-OPS**
- **예상 시간:** 2일
- **도구:** Grafana
- **대시보드 패널:**
  - Request rate (req/s)
  - Error rate (%)
  - p50/p95/p99 latency
  - QR redemption rate
  - Redis cache hit rate
  - PostgreSQL connection pool
  - Active sessions
- **완료 조건:** 프로덕션 메트릭 실시간 확인

---

## 📊 우선순위 매트릭스

```
영향도 (Impact)
 ↑
 │ 🔴 PAT Revoke    │ 🔴 Redis         │
 │ 🔴 Webhook 검증  │ 🔴 Prisma        │
 │ 🔴 Build 수정    │ 🔴 PostGIS       │
 │──────────────────┼──────────────────│
 │ 🟡 Playwright    │ 🟡 Metrics       │
 │ 🟡 Chat API      │ 🟡 CI/CD         │
 │ 🟡 E2E 실행      │ 🟢 Unit Tests    │
 │──────────────────┼──────────────────│
 │ 🟢 Error Format  │ 🟢 Dashboard     │
 │ 🟢 Logging       │ 🔵 Percy         │
 └──────────────────┴──────────────────→ 긴급도 (Urgency)

🔴 P0 - Critical (즉시 조치)
🟡 P1 - High (1-2주 내)
🟢 P2 - Medium (1개월 내)
🔵 P3 - Low (최적화)
```

---

## 📅 마일스톤

### M1: 파일럿 배포 가능 (2주)
- ✅ 보안 이슈 해결 (PAT, Webhook, Rate limit)
- ✅ 빌드 성공 (Google Fonts, TypeScript)
- ✅ E2E 테스트 통과
- ✅ Chat API 작동

### M2: 프로덕션 준비 (1개월)
- ✅ Redis 전환 (원자성 보장)
- ✅ Prisma + PostgreSQL
- ✅ PostGIS (3km 쿼리 <200ms)
- ✅ Unit 테스트 커버리지 >80%

### M3: 스케일 준비 (2개월)
- ✅ CI/CD 파이프라인
- ✅ 부하 테스트 목표 달성
- ✅ 모니터링 대시보드
- ✅ Prometheus 메트릭

---

## ✅ 다음 단계 (즉시 실행)

**지금 바로 시작할 작업 TOP 5:**

1. 🔴 **GitHub PAT Revoke** (5분)
   - 링크: https://github.com/settings/tokens

2. 🔴 **Google Fonts 빌드 에러 수정** (1시간)
   - Local font로 전환

3. 🔴 **Webhook 서명 검증 구현** (2시간)
   - HMAC-SHA256 추가

4. 🟡 **TypeScript 에러 9개 수정** (2시간)
   - Stripe API version, Prisma types, @types/pg

5. 🟡 **Chat API 구현** (4시간)
   - `/api/chat` SSE endpoint

**예상 완료:** Phase 0+1 → 2주 내

---

**문서 버전:** 1.0
**마지막 업데이트:** 2025-10-22
**다음 리뷰:** Phase 0 완료 후
