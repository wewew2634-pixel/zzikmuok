# 딥다이브 진단 분석 및 실행 계획
**분석 일자:** 2025-10-22
**기준 커밋:** e53a6b5

---

## 🎯 Executive Summary

### 현재 상태 평가
- **달성도:** 88.9% (8/9 체크리스트)
- **Go/No-Go:** **Go (제한적)** - 파일럿 배포 가능, 프로덕션은 조건부

### 최우선 Blocker (3개)
1. 🔴 **보안:** GitHub PAT 유출 (`ghp_2ukt...`) - 즉시 조치 필요
2. 🟡 **인프라:** Playwright 환경 (E2E 자동화 블록)
3. 🟠 **아키텍처:** In-memory 스토리지 (스케일/안정성 리스크)

### No-Go 조건 (프로덕션 배포 불가)
- ❌ 웹훅 서명 검증 없이 외부 PG 연결
- ❌ In-memory 단독으로 멀티 인스턴스 스케일
- ❌ 원자성 보장 없는 `/redeem` 처리

---

## 📊 섹션별 상세 분석

### 1. 보안·컴플라이언스 (Critical Priority)

#### 1.1 GitHub PAT 유출 대응 ⚠️ CRITICAL

**현재 상황:**
- 토큰 `ghp_2ukt...`가 대화 로그/Git 히스토리에 노출
- Git remote URL에서는 제거했으나 세션 로그에 잔존

**즉시 조치 (T+0h):**
1. ✅ GitHub Settings → Tokens → 해당 토큰 Revoke
2. 🔄 Secret Scanning 활성화
3. 🔄 Pre-commit hook 추가 (gitleaks)

**권장 조치 (T+24h):**
```bash
# BFG로 히스토리 정리 (선택)
bfg --replace-text <(echo 'ghp_2ukt***==>[REDACTED]')
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

**평가:**
- ✅ 진단 정확함
- ✅ 해결 방법 명확함
- ⚠️ 이미 공개된 토큰은 폐기 외 방법 없음

---

#### 1.2 웹훅 서명 검증 누락 ⚠️ HIGH

**현재 코드 문제:**
```javascript
// mcp/server.js:307 - 현재 구현
app.post('/api/v1/pg/webhook', (req, res) => {
  const { status } = req.body;
  // ❌ 서명 검증 없음
  // ❌ 타임스탬프 확인 없음
  // ❌ 리플레이 방지 없음
})
```

**제안된 개선안:**
```javascript
app.post('/api/v1/pg/webhook',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const sig = req.header('X-Pay-Signature');
    const ts  = req.header('X-Pay-Timestamp');

    // 타임스탬프 검증 (5분 이내)
    if (Math.abs(Date.now()/1000 - Number(ts)) > 300) {
      return res.status(400).json({ error: 'TIMESTAMP_OUT_OF_RANGE' });
    }

    // HMAC-SHA256 서명 검증
    const expected = crypto
      .createHmac('sha256', process.env.PG_WEBHOOK_SECRET)
      .update(ts + '.' + req.body.toString('utf8'))
      .digest('base64');

    if (sig !== expected) {
      return res.status(401).json({ error: 'INVALID_SIGNATURE' });
    }

    // Event ID 기반 중복 처리 방지
    const eventId = req.body.event_id;
    if (processedEvents.has(eventId)) {
      return res.status(200).json({ received: true, duplicate: true });
    }

    // 정상 처리
    processedEvents.add(eventId);
    // ... QR 발급 로직
})
```

**평가:**
- ✅ 제안이 업계 표준 (Stripe/PayPal 방식)
- ✅ 구현 복잡도 낮음 (30줄 이내)
- ✅ 보안 효과 매우 높음
- **우선순위: P0** (외부 PG 연결 전 필수)

---

#### 1.3 Redirect URL Allowlist 누락 ⚠️ MEDIUM

**현재 리스크:**
```javascript
// mcp/server.js:284 - 현재 구현
const redirectUrl = `https://payment-gateway.example.com/checkout/${sessionId}`;
// ❌ 사용자 입력 return_url 검증 없음
```

**제안된 개선안:**
```javascript
const ALLOWED_HOSTS = (process.env.ALLOWED_REDIRECT_HOSTS || 'payment-gateway.example.com').split(',');

function isAllowedRedirect(urlStr) {
  try {
    const u = new URL(urlStr);
    return (u.protocol === 'https:') && ALLOWED_HOSTS.includes(u.host);
  } catch {
    return false;
  }
}

// 사용
if (!isAllowedRedirect(return_url)) {
  return res.status(400).json({ error: 'INVALID_REDIRECT_URL' });
}
```

**평가:**
- ✅ 오픈 리다이렉트 공격 방지
- ✅ 구현 간단 (10줄)
- **우선순위: P1** (파일럿 배포 전 권장)

---

### 2. API별 개선 권고

#### 2.1 GET `/api/v1/feed`

**현재 구현:**
```javascript
// 단순 Mock 반환, 필터 미적용
const mockOffers = [{ id: 'offer_1', ... }];
```

**제안된 개선 (6개):**

| 항목 | 현재 | 개선안 | 우선순위 |
|------|------|--------|----------|
| 필수 파라미터 | 선택적 | lat/lng 필수, 스키마 검증 | P1 |
| 페이지네이션 | 없음 | `limit(≤50), cursor` | P2 |
| 정렬 | 없음 | `score DESC, distance ASC` | P2 |
| PostGIS 전환 | Mock | `ST_DWithin(3km)` 쿼리 | P0 (중기) |
| 캐시 | 없음 | Redis/CDN (1분 TTL) | P3 |
| 레이트 리밋 | 없음 | 100req/min per IP | P2 |

**제안된 PostgreSQL 쿼리:**
```sql
SELECT id, name,
  0.35*intent + 0.25*(1/(1+distance_km)) + 0.20*availability +
  0.10*freshness + 0.10*roi AS score
FROM offers
WHERE ST_DWithin(geom, ST_SetSRID(ST_MakePoint($lng, $lat), 4326)::geography, 3000)
  AND open_now = true AND slots_available > 0
  AND price BETWEEN $min AND $max
ORDER BY score DESC, distance_km ASC
LIMIT $limit;
```

**평가:**
- ✅ 쿼리 최적화 매우 우수 (PostGIS 공간 인덱스)
- ✅ 정렬 타이브레이커 명확
- ⚠️ `distance_km` 계산 비용 - 인덱스 스캔 후 계산 권장
- **실행 계획:** 단기(파라미터 검증) → 중기(PostGIS 전환)

---

#### 2.2 POST `/api/v1/checkout`

**현재 구현 강점:**
- ✅ Idempotency-Key 필수 (400 강제)
- ✅ 멱등성 보장 (Map 기반)

**제안된 개선 (3개):**

1. **Idempotency-Key 규격 명시:**
```javascript
// 현재: 검증 없음
const idempotencyKey = req.get('Idempotency-Key');

// 개선안
const IDEM_KEY_REGEX = /^[A-Za-z0-9_-]{32,128}$/;
if (!IDEM_KEY_REGEX.test(idempotencyKey)) {
  return res.status(400).json({ error: 'INVALID_IDEMPOTENCY_KEY_FORMAT' });
}
```

2. **TTL 적용 (24시간):**
```javascript
checkoutSessions.set(idempotencyKey, {
  sessionId,
  url: redirectUrl,
  createdAt: Date.now(),
  expiresAt: Date.now() + 24 * 60 * 60 * 1000
});
```

3. **고유 인덱스 (DB 전환 시):**
```sql
CREATE UNIQUE INDEX idx_sessions_idem_key ON sessions(idempotency_key);
```

**평가:**
- ✅ 제안이 실용적
- ✅ 하위 호환성 유지
- **우선순위: P1** (파라미터 검증), P2 (TTL)

---

#### 2.3 POST `/api/v1/pg/webhook`

**개선 사항:** 섹션 1.2 (서명 검증) 참조

**추가 제안:**
```javascript
// 실패 시 5xx → PG가 재시도하도록 유도
try {
  // QR 발급 로직
  res.json({ received: true, action: 'qr_issued', qr_token });
} catch (err) {
  console.error('Webhook processing failed:', err);
  res.status(500).json({ error: 'INTERNAL_ERROR' }); // PG 재시도 유도
}
```

**평가:**
- ✅ 장애 복원력 향상
- **우선순위: P1**

---

#### 2.4 POST `/api/v1/redeem`

**현재 리스크:**
```javascript
// mcp/server.js:368-374 - 경쟁 조건 취약
if (tokenData.used) {
  return res.status(409).json({ error: 'TOKEN_ALREADY_USED' });
}
tokenData.used = true; // ❌ 비원자적 연산
```

**제안된 Redis Lua 스크립트:**
```lua
-- KEYS[1] = qr:{token}
-- ARGV[1] = now (epoch ms)
local exists = redis.call('EXISTS', KEYS[1])
if exists == 0 then return {404} end

local used = redis.call('HGET', KEYS[1], 'used')
if used == '1' then
  return {409, redis.call('HGET', KEYS[1], 'used_at')}
end

local exp = tonumber(redis.call('HGET', KEYS[1], 'expires_at'))
if tonumber(ARGV[1]) > exp + 60000 then
  return {410}
end

redis.call('HSET', KEYS[1], 'used', '1', 'used_at', ARGV[1])
return {200, ARGV[1]}
```

**Node.js 호출 예:**
```javascript
const result = await redis.eval(REDEEM_SCRIPT, 1, `qr:${qr_token}`, Date.now());
const [status, data] = result;
if (status === 200) {
  res.json({ success: true, redeemed_at: new Date(data).toISOString() });
} else if (status === 409) {
  res.status(409).json({ error: 'TOKEN_ALREADY_USED', used_at: data });
}
// ...
```

**평가:**
- ✅ 원자성 완벽 보장
- ✅ 성능 우수 (단일 라운드트립)
- ⚠️ Redis 의존성 추가
- **우선순위: P0** (멀티 인스턴스 배포 전 필수)

---

### 3. 데이터·영속화 설계

**제안된 Prisma 스키마:**
```prisma
model Session {
  id                String   @id @default(cuid())
  idempotencyKey    String   @unique
  sessionId         String   @unique
  createdAt         DateTime @default(now())
  @@index([createdAt])
}

model QrToken {
  token       String   @id
  sessionId   String
  issuedAt    DateTime @default(now())
  expiresAt   DateTime
  used        Boolean  @default(false)
  usedAt      DateTime?
  @@index([expiresAt])
  @@index([sessionId])
}

model Offer {
  id        String   @id @default(cuid())
  name      String
  priceMin  Int
  priceMax  Int
  openNow   Boolean
  slots     Int
  // geom은 SQL 마이그레이션에서 추가
  createdAt DateTime @default(now())
  @@index([createdAt])
}
```

**PostGIS 마이그레이션:**
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
ALTER TABLE "Offer" ADD COLUMN geom geography(Point,4326);
CREATE INDEX idx_offer_geom ON "Offer" USING GIST (geom);
```

**평가:**
- ✅ 스키마 설계 깔끔 (정규화 적절)
- ✅ 인덱스 전략 정확 (`expiresAt`, `geom`)
- ✅ Prisma + PostGIS 조합 검증됨
- ⚠️ `Offer.geom`을 Prisma Unsupported 타입으로 선언 필요
- **실행 계획:** 단기(Prisma 스키마) → 중기(PostGIS 전환)

---

### 4. 테스트 전략

#### 4.1 Playwright 환경 수정

**현재 문제:**
```
E: Failed to fetch PPA repository (403)
Error: Installation process exited with code: 100
```

**제안된 해결책 (3가지):**

**Option 1: 공식 Docker 이미지 (권장)**
```dockerfile
FROM mcr.microsoft.com/playwright:v1.49.1

WORKDIR /work
COPY package*.json ./
RUN npm ci
RUN npx playwright install --with-deps

COPY . .
CMD ["npm", "run", "test:e2e"]
```

**Option 2: CI/CD에서 캐시**
```yaml
# .github/workflows/ci.yml
- name: Install Playwright
  run: |
    export PLAYWRIGHT_BROWSERS_PATH=0
    npx playwright install --with-deps chromium
```

**Option 3: System deps 우회**
```bash
npx playwright install --skip-system-deps chromium
```

**평가:**
- ✅ Option 1이 가장 안정적 (공식 지원)
- ✅ 환경 일관성 보장
- **우선순위: P0** (E2E 자동화 복구)

---

#### 4.2 시간 모킹 (만료 테스트 unskip)

**현재 상태:**
```typescript
// tests/e2e/04-zzmuk-ttl-and-skew.spec.ts:45
test.skip('Expired QR token should return 410 [REQUIRES TIME MOCKING]', ...)
```

**제안된 해결책:**

**1. TimeProvider 추상화:**
```typescript
// src/lib/time.ts
export interface TimeProvider {
  now(): number;
}

export const SystemClock: TimeProvider = {
  now: () => Date.now()
};

export let clock: TimeProvider = SystemClock;
export function setClock(provider: TimeProvider) {
  clock = provider;
}
```

**2. 서버에서 사용:**
```javascript
import { clock } from './lib/time';

app.post('/api/v1/redeem', (req, res) => {
  const now = clock.now(); // Date.now() 대신
  // ...
});
```

**3. 테스트에서 주입:**
```typescript
import { install } from '@sinonjs/fake-timers';

test('Expired QR token should return 410', async ({ request }) => {
  const fakeClock = install();

  // QR 발급
  const { qr_token } = await issueQR();

  // 6분 경과
  fakeClock.tick(6 * 60 * 1000);

  // 만료 검증
  const res = await request.post('/api/v1/redeem', {
    data: { qr_token }
  });
  expect(res.status()).toBe(410);

  fakeClock.uninstall();
});
```

**평가:**
- ✅ 깔끔한 추상화
- ✅ 테스트 속도 대폭 향상 (6분 → 즉시)
- ⚠️ 서버 코드 수정 필요 (침투적)
- **우선순위: P2** (E2E 커버리지 향상)

---

#### 4.3 계층별 테스트 분담

**제안된 전략:**

| 레벨 | 대상 | 예시 | 실행 속도 |
|------|------|------|-----------|
| Unit | 로직/계산 | 랭킹 스코어, TTL 계산 | ~1ms |
| Integration | API 계약 | 웹훅 서명, 멱등성 | ~10ms |
| E2E | Happy path | 전체 플로우 (3개) | ~1s |
| Contract | 클라이언트-서버 | Pact 스펙 | ~100ms |

**예시 (Unit Test):**
```typescript
// tests/unit/scoring.test.ts
describe('Offer Scoring', () => {
  it('should calculate score correctly', () => {
    const score = calculateScore({
      intent: 0.85,
      proximity: 0.95,
      availability: 0.90,
      freshness: 1.0,
      roi: 0.88
    });
    expect(score).toBeCloseTo(0.916, 2);
  });
});
```

**평가:**
- ✅ 피라미드 구조 (Unit 많음 → E2E 적음)
- ✅ 빠른 피드백 루프
- **우선순위: P2**

---

### 5. 성능·스케일

#### 5.1 In-memory 한계 분석

**현재 리스크:**

| 항목 | 리스크 | 영향 |
|------|--------|------|
| 메모리 누수 | 무제한 Map 증가 | OOM 크래시 |
| 경쟁 조건 | 비원자적 연산 | 중복 사용 허용 |
| 단일 인스턴스 | 무상태 아님 | 수평 확장 불가 |
| 데이터 소실 | 재시작 시 증발 | 세션 손실 |

**임시 패치 (파일럿용):**
```javascript
const MAX_SESSIONS = 100_000;
const MAX_TOKENS = 100_000;

function cleanupExpired() {
  const now = Date.now();

  // 만료된 QR 토큰 정리
  for (const [token, data] of qrTokens) {
    if (now > data.expiresAt + 60000) {
      qrTokens.delete(token);
    }
  }

  // 오래된 세션 정리 (24시간)
  for (const [key, data] of checkoutSessions) {
    if (now - new Date(data.createdAt).getTime() > 24 * 60 * 60 * 1000) {
      checkoutSessions.delete(key);
    }
  }

  // LRU 적용 (크기 제한)
  if (qrTokens.size > MAX_TOKENS) {
    const oldest = Array.from(qrTokens.entries())
      .sort((a, b) => a[1].createdAt - b[1].createdAt)
      .slice(0, qrTokens.size - MAX_TOKENS);
    oldest.forEach(([key]) => qrTokens.delete(key));
  }
}

// 1분마다 정리
setInterval(cleanupExpired, 60000);
```

**평가:**
- ✅ 파일럿 단계에서는 충분
- ⚠️ 프로덕션에서는 부적합
- **권장:** Redis 전환 (P0, 중기)

---

#### 5.2 레이트 리미팅

**제안 (express-rate-limit):**
```javascript
import rateLimit from 'express-rate-limit';

const checkoutLimiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 10, // 10 요청/분
  message: { error: 'TOO_MANY_REQUESTS' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.get('Idempotency-Key') || req.ip;
  }
});

app.post('/api/v1/checkout', checkoutLimiter, ...);

const redeemLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30, // 30 요청/분
  keyGenerator: (req) => req.ip
});

app.post('/api/v1/redeem', redeemLimiter, ...);
```

**평가:**
- ✅ DDoS 기본 방어
- ✅ 구현 간단 (10줄)
- **우선순위: P1**

---

### 6. 관측가능성 (Observability)

**제안된 구조화 로그:**
```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// 사용 예
app.post('/api/v1/redeem', (req, res) => {
  const start = Date.now();
  const { qr_token } = req.body;

  logger.info({
    event: 'redeem_attempt',
    qr_token: maskToken(qr_token), // qr_****...**7q
    ip: req.ip,
    correlation_id: req.id
  });

  // ... 처리 로직

  const duration = Date.now() - start;
  logger.info({
    event: 'redeem_complete',
    status: res.statusCode,
    duration_ms: duration,
    correlation_id: req.id
  });
});

function maskToken(token) {
  if (!token || token.length < 8) return '***';
  return token.slice(0, 4) + '****' + token.slice(-4);
}
```

**핵심 메트릭:**
```javascript
// Prometheus 메트릭 예시
const redeemCounter = new promClient.Counter({
  name: 'zzmuk_redeem_total',
  help: 'Total redeem attempts',
  labelNames: ['status']
});

const redeemDuration = new promClient.Histogram({
  name: 'zzmuk_redeem_duration_ms',
  help: 'Redeem request duration',
  buckets: [10, 50, 100, 200, 500, 1000]
});

app.post('/api/v1/redeem', (req, res) => {
  const end = redeemDuration.startTimer();
  // ... 처리
  redeemCounter.inc({ status: res.statusCode });
  end();
});
```

**평가:**
- ✅ 업계 표준 (Winston + Prometheus)
- ✅ 장애 진단 시간 단축
- **우선순위: P2** (프로덕션 전 권장)

---

### 7. API 계약 표준화

**제안된 에러 포맷:**
```typescript
// 현재 (일관성 없음)
{ "error": "TOKEN_ALREADY_USED", "used_at": "..." }
{ "error": "IDEMPOTENCY_KEY_REQUIRED", "message": "..." }

// 개선안 (일관성)
{
  "error": {
    "code": "TOKEN_ALREADY_USED",
    "message": "This QR token has already been redeemed",
    "details": { "used_at": "2025-10-22T16:01:21.608Z" },
    "trace_id": "req_abc123"
  }
}
```

**헬퍼 함수:**
```javascript
function errorResponse(res, httpStatus, code, message, details = {}) {
  return res.status(httpStatus).json({
    error: {
      code,
      message,
      details,
      trace_id: res.locals.traceId || 'unknown'
    }
  });
}

// 사용
if (tokenData.used) {
  return errorResponse(res, 409, 'TOKEN_ALREADY_USED',
    'This QR token has already been redeemed',
    { used_at: tokenData.usedAt }
  );
}
```

**평가:**
- ✅ 클라이언트 개발 편의성 향상
- ✅ 디버깅 효율 증가
- **우선순위: P2**

---

## 🎯 실행 계획

### Phase 0: 즉시 조치 (T+0 ~ T+24h)

| 작업 | 우선순위 | 예상 시간 | 담당 |
|------|----------|-----------|------|
| GitHub PAT Revoke | P0 🔴 | 5분 | 사용자 |
| 웹훅 서명 검증 구현 | P0 🔴 | 2시간 | 개발 |
| Redirect URL allowlist | P1 🟡 | 30분 | 개발 |
| 레이트 리미팅 추가 | P1 🟡 | 1시간 | 개발 |
| Secret Scanning 활성화 | P1 🟡 | 10분 | 사용자 |

**예상 완료:** 1일 이내

---

### Phase 1: 단기 개선 (T+1w ~ T+2w)

| 작업 | 우선순위 | 예상 시간 | Blocker |
|------|----------|-----------|---------|
| Playwright Docker 전환 | P0 🔴 | 4시간 | - |
| E2E 테스트 실행 | P1 🟡 | 2시간 | Playwright |
| Idempotency-Key 검증 | P1 🟡 | 1시간 | - |
| 에러 포맷 표준화 | P2 🟢 | 2시간 | - |
| 구조화 로그 도입 | P2 🟢 | 3시간 | - |

**예상 완료:** 2주 이내

---

### Phase 2: 중기 개선 (T+2w ~ T+1m)

| 작업 | 우선순위 | 예상 시간 | Blocker |
|------|----------|-----------|---------|
| Redis 전환 (/redeem 원자성) | P0 🔴 | 1일 | - |
| Prisma 스키마 마이그레이션 | P0 🔴 | 2일 | Redis |
| PostGIS 전환 (/feed) | P1 🟡 | 3일 | Prisma |
| TimeProvider 추상화 | P2 🟢 | 1일 | - |
| Unit 테스트 추가 | P2 🟢 | 2일 | - |

**예상 완료:** 1개월 이내

---

### Phase 3: 프로덕션 준비 (T+1m ~ T+2m)

| 작업 | 우선순위 | 예상 시간 |
|------|----------|-----------|
| Prometheus 메트릭 | P1 🟡 | 2일 |
| CI/CD 파이프라인 | P1 🟡 | 3일 |
| 부하 테스트 | P1 🟡 | 2일 |
| Percy 시각 회귀 | P3 🔵 | 1일 |
| 모니터링 대시보드 | P2 🟢 | 2일 |

**예상 완료:** 2개월 이내

---

## 📊 우선순위 매트릭스

```
영향도 (Impact)
 ↑
 │  P0-보안    │  P0-Redis    │
 │  P0-Docker  │  P0-Prisma   │
 │─────────────┼──────────────│
 │  P1-검증    │  P1-PostGIS  │
 │  P1-Rate    │  P2-Metrics  │
 └─────────────┴──────────────→ 긴급도 (Urgency)

P0 🔴 - 즉시 (보안/안정성)
P1 🟡 - 단기 (파일럿 배포 전)
P2 🟢 - 중기 (프로덕션 준비)
P3 🔵 - 장기 (최적화)
```

---

## ✅ 진단 평가

### 강점 (Excellent)
1. ✅ **보안 리스크 정확히 식별** (PAT 유출, 웹훅 검증 누락)
2. ✅ **실행 가능한 코드 제공** (복붙 가능)
3. ✅ **우선순위 명확** (즉시/단기/중기)
4. ✅ **업계 표준 준수** (HMAC, Redis Lua, PostGIS)
5. ✅ **현실적 마일스톤** (파일럿 → 프로덕션)

### 약점 (Minor)
1. ⚠️ **Redis 도입 트레이드오프** 언급 부족 (운영 복잡도 증가)
2. ⚠️ **비용 추정 없음** (Redis/Postgres 인스턴스)
3. ⚠️ **롤백 계획 부재** (Prisma 마이그레이션 실패 시)

### 추가 제안

**1. 점진적 전환 전략:**
```javascript
// Dual-write 패턴 (Redis 전환 시)
async function redeemQR(token) {
  // 1. Redis에 쓰기 (신규)
  const redisResult = await redisRedeem(token);

  // 2. In-memory에도 쓰기 (기존, 백업)
  const memResult = inMemoryRedeem(token);

  // 3. 결과 비교 (검증)
  if (redisResult.status !== memResult.status) {
    logger.error('Dual-write mismatch', { redisResult, memResult });
  }

  return redisResult; // Redis 우선
}
```

**2. 기능 플래그 (Feature Flag):**
```javascript
const FEATURES = {
  REDIS_REDEEM: process.env.FEATURE_REDIS_REDEEM === 'true',
  POSTGIS_FEED: process.env.FEATURE_POSTGIS_FEED === 'true'
};

app.post('/api/v1/redeem', (req, res) => {
  if (FEATURES.REDIS_REDEEM) {
    return redisRedeemHandler(req, res);
  }
  return inMemoryRedeemHandler(req, res);
});
```

---

## 🏆 최종 평가

**진단 품질:** ⭐⭐⭐⭐⭐ (5/5)

**이유:**
1. ✅ 보안 리스크를 최우선으로 배치 (올바른 우선순위)
2. ✅ 모든 제안이 실행 가능 (코드 샘플 포함)
3. ✅ 단계별 로드맵 명확 (즉시/단기/중기/장기)
4. ✅ 현실적 평가 (88.9% 달성도, 제한적 Go)
5. ✅ 업계 모범 사례 반영 (Stripe 웹훅, Redis Lua, PostGIS)

**실행 권고:**
- **즉시 채택:** Phase 0 (보안 조치) 전부
- **선택 채택:** Redis 전환 (파일럿에서는 In-memory + 정리 로직으로 충분)
- **점진 채택:** Prisma/PostGIS (트래픽 증가 시)

**다음 단계:**
1. 🔴 GitHub PAT Revoke (지금 즉시)
2. 🔴 웹훅 서명 검증 PR 생성
3. 🟡 Playwright Docker 환경 구축
4. 🟢 Redis 전환 스파이크 (3일)

---

**문서 버전:** 1.0
**검토 필요:** 웹훅 서명 알고리즘 PG사 확인
**다음 업데이트:** Phase 0 완료 후
