# 🔌 API 통합 가이드 (API Integration Guide)

## 📚 목차

1. [OpenAI Chat API](#openai-chat-api)
2. [Facebook OAuth](#facebook-oauth)
3. [Instagram Graph API](#instagram-graph-api)
4. [Stripe Payments](#stripe-payments)
5. [SendGrid Email](#sendgrid-email)
6. [Coupang Partners](#coupang-partners)
7. [에러 처리](#에러-처리)
8. [보안 가이드](#보안-가이드)

---

## OpenAI Chat API

### Endpoint: `POST /api/chat`

AI 챗봇과 대화하기

**Request Body**:
```json
{
  "message": "안녕하세요!",
  "history": [
    { "role": "user", "content": "이전 메시지" },
    { "role": "assistant", "content": "이전 응답" }
  ]
}
```

**Response** (Server-Sent Events):
```
data: {"content":"안","done":false}
data: {"content":"녕","done":false}
data: {"content":"하","done":false}
data: {"content":"세","done":false}
data: {"content":"요","done":false}
data: {"content":"!","done":true}
```

**클라이언트 예시**:
```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message, history }),
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { value, done } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      console.log(data.content);
    }
  }
}
```

**에러 응답**:
```json
{
  "error": "Message is required",
  "status": 400
}
```

---

## Facebook OAuth

### Endpoint: `GET /api/auth/facebook`

Facebook 로그인 시작

**Flow**:
1. 사용자가 `/api/auth/facebook` 접속
2. Facebook 로그인 페이지로 리다이렉트
3. 사용자 승인 후 `/api/auth/facebook?code=...`로 콜백
4. 서버가 access token 교환 및 사용자 정보 반환

**Success Response**:
```json
{
  "success": true,
  "user": {
    "id": "123456789",
    "name": "홍길동",
    "email": "user@example.com",
    "picture": "https://graph.facebook.com/..."
  }
}
```

**프론트엔드 버튼 예시**:
```tsx
<button
  onClick={() => {
    window.location.href = '/api/auth/facebook';
  }}
  className="h-12 px-6 bg-[#1877F2] text-white rounded-lg"
>
  Facebook으로 로그인
</button>
```

---

## Instagram Graph API

### Endpoint: `GET /api/instagram/profile`

Instagram 프로필 정보 가져오기

**Response**:
```json
{
  "success": true,
  "profile": {
    "id": "17841400455970028",
    "username": "yourinstagram",
    "account_type": "BUSINESS",
    "media_count": 234
  }
}
```

### Endpoint: `GET /api/instagram/media?limit=10`

Instagram 게시물 목록 가져오기

**Response**:
```json
{
  "success": true,
  "media": [
    {
      "id": "17893882742036",
      "caption": "게시물 설명",
      "media_type": "IMAGE",
      "media_url": "https://...",
      "permalink": "https://www.instagram.com/p/...",
      "timestamp": "2025-10-18T12:00:00+0000"
    }
  ]
}
```

**프론트엔드 예시**:
```typescript
const fetchInstagramMedia = async () => {
  const res = await fetch('/api/instagram/media?limit=12');
  const data = await res.json();
  
  if (data.success) {
    setMedia(data.media);
  }
};
```

---

## Stripe Payments

### Endpoint: `POST /api/stripe/checkout`

결제 세션 생성

**Request Body**:
```json
{
  "priceId": "price_1AbCdEfGhIjKlMnO",
  "customerId": "cus_ABC123",
  "successUrl": "https://yourdomain.com/success",
  "cancelUrl": "https://yourdomain.com/pricing"
}
```

**Response**:
```json
{
  "sessionId": "cs_test_abc123...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_abc123..."
}
```

**프론트엔드 예시**:
```typescript
const handleSubscribe = async (priceId: string) => {
  const res = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId }),
  });

  const { url } = await res.json();
  
  // Stripe Checkout 페이지로 리다이렉트
  window.location.href = url;
};
```

### Webhook: `POST /api/stripe/webhook`

Stripe 이벤트 수신 (서버에서만 호출)

**처리되는 이벤트**:
- `checkout.session.completed` - 결제 완료
- `customer.subscription.created` - 구독 생성
- `customer.subscription.updated` - 구독 변경
- `customer.subscription.deleted` - 구독 취소
- `invoice.payment_failed` - 결제 실패

**Stripe Dashboard 설정**:
1. Developers → Webhooks
2. "Add endpoint" 클릭
3. Endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. 이벤트 선택 (위 5개)
5. Webhook signing secret 복사 → `.env.local`에 추가

---

## SendGrid Email

### Endpoint: `POST /api/sendgrid/send`

이메일 발송

**일반 이메일**:
```json
{
  "to": "user@example.com",
  "subject": "환영합니다!",
  "text": "텍스트 내용",
  "html": "<h1>HTML 내용</h1>"
}
```

**템플릿 이메일**:
```json
{
  "to": "user@example.com",
  "templateId": "d-abc123...",
  "dynamicData": {
    "userName": "홍길동",
    "verificationUrl": "https://..."
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

**프론트엔드 예시**:
```typescript
const sendWelcomeEmail = async (email: string) => {
  await fetch('/api/sendgrid/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: email,
      subject: '환영합니다!',
      html: '<h1>가입을 환영합니다!</h1>',
    }),
  });
};
```

---

## Coupang Partners

### Endpoint: `GET /api/coupang/search?keyword=노트북&limit=10`

쿠팡 제품 검색

**Response**:
```json
{
  "success": true,
  "keyword": "노트북",
  "products": [
    {
      "productId": "123456",
      "productName": "삼성 갤럭시북",
      "productPrice": 1290000,
      "productImage": "https://...",
      "productUrl": "https://www.coupang.com/vp/products/123456"
    }
  ]
}
```

### Endpoint: `POST /api/coupang/deeplink`

제휴 링크 생성 (수익 추적용)

**Request Body**:
```json
{
  "productId": "123456"
}
```

**Response**:
```json
{
  "success": true,
  "productId": "123456",
  "deepLink": "https://link.coupang.com/a/abc123..."
}
```

**프론트엔드 예시**:
```typescript
const generateAffiliateLink = async (productId: string) => {
  const res = await fetch('/api/coupang/deeplink', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId }),
  });

  const { deepLink } = await res.json();
  
  // 사용자를 제휴 링크로 리다이렉트
  window.open(deepLink, '_blank');
};
```

---

## 에러 처리

모든 API는 일관된 에러 형식을 반환합니다:

```json
{
  "error": "Error message",
  "details": "Optional detailed error information"
}
```

**HTTP 상태 코드**:
- `200` - 성공
- `400` - 잘못된 요청 (필수 파라미터 누락 등)
- `401` - 인증 실패
- `403` - 권한 없음
- `500` - 서버 오류

**프론트엔드 에러 처리 예시**:
```typescript
try {
  const res = await fetch('/api/endpoint', options);
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Something went wrong');
  }
  
  const data = await res.json();
  return data;
} catch (err) {
  console.error('API Error:', err);
  toast.error(err.message);
}
```

---

## 보안 가이드

### 1. API 키 보호

✅ **올바른 사용**:
```typescript
// 서버 컴포넌트 또는 API 라우트에서만 사용
const apiKey = process.env.OPENAI_API_KEY;
```

❌ **절대 금지**:
```typescript
// 클라이언트에서 직접 사용 (브라우저에 노출됨!)
const apiKey = 'sk-proj-abc123...';
fetch('https://api.openai.com/...', {
  headers: { 'Authorization': `Bearer ${apiKey}` }
});
```

### 2. 환경변수 네이밍

- **서버 전용**: `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`
- **클라이언트 노출 허용**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### 3. CORS 설정

프론트엔드가 다른 도메인에 있을 경우:

```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_FRONTEND_URL || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}
```

### 4. Rate Limiting

API 남용 방지:

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

// API 라우트에서 사용
export async function POST(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  // ... 나머지 로직
}
```

### 5. Input Validation

모든 사용자 입력 검증:

```typescript
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  message: z.string().min(1).max(1000),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  try {
    const validated = schema.parse(body);
    // ... validated 데이터 사용
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid input' },
      { status: 400 }
    );
  }
}
```

---

## 🧪 테스트

### 로컬 테스트

```bash
# OpenAI Chat 테스트
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"안녕하세요","history":[]}'

# SendGrid 이메일 테스트
curl -X POST http://localhost:3000/api/sendgrid/send \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","text":"Hello"}'

# Coupang 제품 검색
curl http://localhost:3000/api/coupang/search?keyword=노트북&limit=5
```

### Stripe Webhook 로컬 테스트

```bash
# Stripe CLI 설치
brew install stripe/stripe-cli/stripe

# Webhook 리스닝 시작
stripe listen --forward-to localhost:3000/api/stripe/webhook

# 테스트 이벤트 발송
stripe trigger checkout.session.completed
```

---

## 📞 지원

- **API 문서 이슈**: GitHub Issues
- **보안 문제**: security@yourcompany.com
- **긴급 문의**: Slack #dev-support

---

**Last Updated**: 2025-10-18  
**Version**: 1.0.0
