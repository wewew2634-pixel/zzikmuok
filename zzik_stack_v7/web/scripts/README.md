# 🛠️ API 설정 자동화 스크립트

이 디렉토리에는 API 통합을 쉽게 설정할 수 있는 자동화 스크립트들이 있습니다.

---

## 📋 사용 가능한 스크립트

### 1. SendGrid 발신자 인증

**명령어**:
```bash
npm run setup:sendgrid
```

**기능**:
- SendGrid 발신자 이메일 인증 상태 확인
- 미인증 시 자동으로 인증 요청 발송
- 인증 완료 여부 확인

**필요한 환경변수**:
- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`

**소요 시간**: 2분 (이메일 확인 포함)

---

### 2. Instagram Access Token 발급

**명령어**:
```bash
npm run setup:instagram
```

**기능**:
- Instagram Access Token 발급 방법 안내
- Facebook Graph API 사용법 설명
- Long-lived token 발급 가이드

**필요한 환경변수**:
- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`

**소요 시간**: 10분

**참고**:
- 이 스크립트는 가이드만 제공합니다
- Facebook Graph API Explorer에서 수동으로 토큰을 발급받아야 합니다
- 발급받은 토큰을 `.env.local`의 `INSTAGRAM_ACCESS_TOKEN`에 추가하세요

---

### 3. Stripe 가격 상품 생성

**명령어**:
```bash
npm run setup:stripe
```

**기능**:
- Stripe에 구독 상품 자동 생성
- 월간 구독 (₩9,900/월) Price ID 생성
- 연간 구독 (₩99,000/년) Price ID 생성
- 생성된 Price ID를 환경변수에 추가하는 방법 안내

**필요한 환경변수**:
- `STRIPE_SECRET_KEY` (TEST 모드)

**소요 시간**: 1분

**생성되는 상품**:
- **ZZIK Premium Monthly**: ₩9,900/월
- **ZZIK Premium Yearly**: ₩99,000/년 (16% 할인)

---

### 4. 전체 API 테스트

**명령어**:
```bash
npm run test:apis
```

**기능**:
- 모든 통합된 API의 연결 상태 확인
- OpenAI, Stripe, SendGrid, Facebook, Instagram, Coupang 테스트
- 각 API의 응답 시간 측정
- 문제 발견 시 해결 방법 제안

**소요 시간**: 10초

**테스트 항목**:
- ✅ OpenAI Chat API
- ✅ Stripe Payment API
- ✅ SendGrid Email API
- ⏳ Facebook OAuth
- ⏳ Instagram Graph API
- ⏳ Coupang Partners API

---

## 🚀 빠른 시작

### 전체 설정 (한 번에 실행)

```bash
# 1. tsx 패키지 설치
npm install

# 2. SendGrid 설정
npm run setup:sendgrid

# 3. Instagram 토큰 발급 (가이드 확인)
npm run setup:instagram

# 4. Stripe 가격 생성
npm run setup:stripe

# 5. 모든 API 테스트
npm run test:apis
```

---

## 📝 개별 실행 예시

### SendGrid 발신자 인증

```bash
$ npm run setup:sendgrid

📧 SendGrid Sender Verification Setup

From Email: qettapay@gmail.com
From Name: ZZIK

🔍 Checking existing verified senders...
✅ qettapay@gmail.com is already verified!

🎉 You can start sending emails immediately.
```

---

### Stripe 가격 생성

```bash
$ npm run setup:stripe

💳 Stripe Price Setup
════════════════════════════════════════════════════════════════
✅ Stripe Configuration:
   Secret Key: sk_test_51S5Ka...
   Mode: TEST MODE ✓

📦 Creating ZZIK Subscription Products...

1️⃣  Creating Product: "ZZIK Premium"
   ✅ Product created: prod_ABC123

2️⃣  Creating Monthly Price: ₩9,900/month
   ✅ Monthly Price ID: price_1XYZ789monthly

3️⃣  Creating Yearly Price: ₩99,000/year (16% off)
   ✅ Yearly Price ID: price_1XYZ789yearly

════════════════════════════════════════════════════════════════

✨ Success! Your subscription prices are ready.

📋 Add these to your .env.local file:

STRIPE_PRICE_ID_MONTHLY=price_1XYZ789monthly
STRIPE_PRICE_ID_YEARLY=price_1XYZ789yearly
```

---

### API 테스트

```bash
$ npm run test:apis

🧪 ZZIK API Integration Tests

══════════════════════════════════════════════════════════════════════
Base URL: http://localhost:3004

Running tests...

══════════════════════════════════════════════════════════════════════

📊 Test Results:

✅ OpenAI Chat API (234ms)
   OpenAI Chat API is working (streaming response received)

✅ Stripe Payment API (156ms)
   Stripe API is connected (needs valid price_id)

✅ SendGrid Email API (423ms)
   SendGrid API is connected (needs sender verification)

✅ Facebook OAuth (2ms)
   Facebook OAuth is configured (App ID present)

❌ Instagram Graph API (89ms)
   Instagram Access Token not configured (run setup-instagram script)

❌ Coupang Partners API (1ms)
   Coupang API keys not configured (waiting for partner approval)

══════════════════════════════════════════════════════════════════════

📈 Summary: 4 passed, 2 failed

⚠️  Some tests failed. Please check the errors above.

📘 Quick Fixes:
   → Instagram: Run "npx tsx scripts/setup-instagram.ts"
   → Coupang: Wait for partner approval
```

---

## 🔧 문제 해결

### "tsx not found" 에러

```bash
npm install
```

### "SENDGRID_API_KEY not found" 에러

`.env.local` 파일에 API 키가 있는지 확인하세요:
```bash
cat .env.local | grep SENDGRID_API_KEY
```

### Stripe "LIVE mode" 경고

개발 환경에서는 반드시 TEST 키를 사용하세요:
- TEST 키: `sk_test_...`
- LIVE 키: `sk_live_...` ⚠️  (프로덕션 전용)

---

## 📚 추가 문서

- **환경변수 설정**: `../ENV_SETUP_GUIDE.md`
- **API 사용법**: `../API_INTEGRATION_GUIDE.md`
- **통합 완료 보고**: `../API_통합완료_최종보고.md`

---

## 💡 팁

1. **스크립트 실행 전**: `.env.local` 파일에 필요한 API 키가 모두 있는지 확인
2. **순서 중요**: SendGrid → Stripe → Instagram 순서로 설정하는 것을 권장
3. **테스트 자주**: `npm run test:apis`를 실행해서 API 상태를 주기적으로 확인
4. **로그 확인**: 스크립트가 실패하면 에러 메시지를 자세히 읽어보세요

---

**작성일**: 2025-10-18  
**버전**: 1.0.0
