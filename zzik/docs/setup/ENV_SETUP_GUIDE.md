# 🔐 환경변수 설정 가이드 (Environment Variables Setup)

## 📋 Quick Start

```bash
# 1. 템플릿 파일 복사
cp .env.local.example .env.local

# 2. .env.local 파일을 열어 실제 API 키 입력
nano .env.local  # 또는 원하는 에디터 사용

# 3. 개발 서버 재시작
npm run dev
```

---

## 🔑 API 키 발급 가이드

### 1. OpenAI API Key
**용도**: AI 챗봇 응답 생성 (GPT-4o-mini)

**발급 방법**:
1. https://platform.openai.com 방문
2. 로그인 → API Keys 메뉴
3. "Create new secret key" 클릭
4. 키 복사 (⚠️ 한 번만 표시됨)

**설정**:
```env
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
```

**과금**: 
- ChatGPT Pro 구독과 별도
- 사용량 기반 과금 (Pay-as-you-go)
- 무료 크레딧: $5 (신규 계정)

---

### 2. Facebook OAuth (Social Login)
**용도**: Facebook/Instagram 소셜 로그인

**발급 방법**:
1. https://developers.facebook.com/apps/ 방문
2. "Create App" → "Consumer" 선택
3. 앱 이름 입력 후 생성
4. Settings → Basic에서 App ID, App Secret 확인
5. Products → "Facebook Login" 추가
6. Valid OAuth Redirect URIs 설정:
   - 개발: `http://localhost:3000/api/auth/facebook/callback`
   - 프로덕션: `https://yourdomain.com/api/auth/facebook/callback`

**설정**:
```env
FACEBOOK_APP_ID=1234567890123456
FACEBOOK_APP_SECRET=abcdef1234567890abcdef1234567890
FACEBOOK_REDIRECT_URI=http://localhost:3000/api/auth/facebook/callback
```

**필수 권한**:
- `email` (기본)
- `public_profile` (기본)

---

### 3. Instagram Graph API
**용도**: Instagram 계정 연동 및 게시물 데이터

**발급 방법**:
1. Facebook Developers 콘솔에서 동일 앱 사용
2. Products → "Instagram" 추가
3. Instagram Basic Display API 설정
4. Instagram 테스터 계정 추가
5. Access Token 발급 (User Token Generator)

**설정**:
```env
INSTAGRAM_APP_ID=1234567890123456
INSTAGRAM_APP_SECRET=abcdef1234567890abcdef1234567890
INSTAGRAM_ACCESS_TOKEN=IGQVJx...long_token_here
```

**토큰 갱신**:
- Short-lived token: 1시간
- Long-lived token: 60일
- Refresh 로직 필요

---

### 4. Stripe Payment API
**용도**: 결제 처리 및 구독 관리

**발급 방법**:
1. https://dashboard.stripe.com/register 회원가입
2. Developers → API Keys 메뉴
3. **Test mode** 켜기 (개발용)
4. Publishable key, Secret key 복사

**설정**:
```env
# ⚠️ 개발 시 반드시 TEST 키 사용
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51AbC...
STRIPE_SECRET_KEY=sk_test_51AbC...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Webhook 설정**:
1. Developers → Webhooks → "Add endpoint"
2. 엔드포인트 URL: `https://yourdomain.com/api/webhooks/stripe`
3. 이벤트 선택:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Webhook signing secret 복사

**가격 상품 생성**:
1. Products → "Add product"
2. 월간/연간 요금제 생성
3. Price ID를 `.env.local`에 추가:
```env
STRIPE_PRICE_ID_MONTHLY=price_1AbC...
STRIPE_PRICE_ID_YEARLY=price_1XyZ...
```

---

### 5. SendGrid Email API
**용도**: 트랜잭션 이메일 발송

**발급 방법**:
1. https://signup.sendgrid.com/ 회원가입
2. Settings → API Keys → "Create API Key"
3. Full Access 권한 선택
4. 키 복사 (⚠️ 한 번만 표시됨)

**설정**:
```env
SENDGRID_API_KEY=SG.abc123...
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=ZZIK
```

**발신자 인증 (필수)**:
1. Settings → Sender Authentication
2. Single Sender Verification 또는 Domain Authentication 선택
3. 이메일 인증 완료

**이메일 템플릿 (선택)**:
1. Email API → Dynamic Templates
2. 템플릿 생성 (회원가입, 비밀번호 재설정 등)
3. Template ID 복사:
```env
SENDGRID_TEMPLATE_WELCOME=d-abc123...
SENDGRID_TEMPLATE_PASSWORD_RESET=d-xyz789...
```

---

### 6. Coupang Partners API
**용도**: 쿠팡 제휴 마케팅 링크 생성

**발급 방법**:
1. https://partners.coupang.com/ 가입
2. 파트너스 승인 대기 (1-3일)
3. API 사용 신청
4. API 키 발급 메뉴에서 Access Key, Secret Key 확인

**설정**:
```env
COUPANG_ACCESS_KEY=your_access_key
COUPANG_SECRET_KEY=your_secret_key
COUPANG_PARTNER_ID=your_partner_id
```

**주의사항**:
- 승인된 사이트에서만 사용 가능
- 부적절한 사용 시 계정 정지 가능
- 수수료 정산: 월 1회

---

## 🛡️ 보안 체크리스트

### ✅ 필수 보안 사항

- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] Git에 실수로 커밋된 API 키가 없는지 확인:
  ```bash
  git log --all --full-history --source -- .env.local
  ```
- [ ] 프로덕션 환경에서 TEST 키 사용하지 않는지 확인
- [ ] Webhook secret이 서버 측에서만 사용되는지 확인
- [ ] `NEXT_PUBLIC_*` 변수는 클라이언트에 노출됨 (민감 정보 제외)

### 🔐 권장 사항

1. **환경별 키 분리**:
   ```
   .env.local          # 로컬 개발
   .env.staging        # 스테이징
   .env.production     # 프로덕션
   ```

2. **Secret 관리 도구 사용**:
   - Vercel: Environment Variables 메뉴
   - AWS: AWS Secrets Manager
   - Azure: Key Vault
   - GCP: Secret Manager

3. **키 로테이션**:
   - 정기적으로 API 키 갱신 (3-6개월)
   - 유출 의심 시 즉시 폐기 및 재발급

4. **로깅 주의**:
   ```typescript
   // ❌ 절대 하지 마세요
   console.log(process.env.STRIPE_SECRET_KEY)
   
   // ✅ 마스킹 처리
   console.log('Stripe key:', process.env.STRIPE_SECRET_KEY?.slice(0, 7) + '...')
   ```

---

## 🚀 환경별 설정

### Development (개발)
```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Test 키 사용
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### Staging (스테이징)
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://staging.yourdomain.com

# Test 키 사용 (실제 결제 없음)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### Production (프로덕션)
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Live 키 사용 (실제 결제 발생)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

---

## 🔍 문제 해결

### Q: API 키가 작동하지 않아요
**A**: 다음을 확인하세요:
1. `.env.local` 파일 위치가 프로젝트 루트인지 확인
2. 개발 서버 재시작 (`npm run dev` 재실행)
3. 키 앞뒤 공백 제거
4. 키가 만료되지 않았는지 확인

### Q: `NEXT_PUBLIC_*` 변수가 undefined로 나와요
**A**: 
- 클라이언트 사이드에서 접근하려면 `NEXT_PUBLIC_` 접두사 필수
- 서버 측에서만 사용하는 키는 접두사 없이 사용
- 변경 후 개발 서버 재시작 필수

### Q: Stripe webhook이 작동하지 않아요
**A**:
- 로컬 개발: Stripe CLI 사용 필요
  ```bash
  stripe listen --forward-to localhost:3000/api/webhooks/stripe
  ```
- Webhook secret을 CLI에서 받은 값으로 업데이트

### Q: SendGrid 이메일이 발송되지 않아요
**A**:
1. Sender Authentication 완료 여부 확인
2. API 키 권한이 Full Access인지 확인
3. SendGrid 계정 상태 확인 (일일 발송 제한)

---

## 📞 지원

- **문서 이슈**: GitHub Issues 생성
- **보안 이슈**: security@yourcompany.com
- **긴급 문의**: Slack #dev-support 채널

---

**Last Updated**: 2025-10-18  
**Version**: 1.0.0
