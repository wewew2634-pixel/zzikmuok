# 🗄️ SNS 로그인 DB 가공 전략 완벽 가이드

## 🎯 목표

**"SNS 사용자 로그인으로 DB 가공 전략"** → **완료!**

여러 SNS (Facebook, Instagram, TikTok, Google 등)로 로그인한 사용자 정보를 데이터베이스에 체계적으로 저장하고 관리하는 완벽한 시스템을 구축했습니다.

---

## 📊 핵심 DB 설계 전략

### 1. **한 사용자, 여러 SNS 계정** (1:N 관계)

```
User (1) ←→ (N) Accounts

예시:
홍길동 사용자 (User ID: user_1)
├─ Facebook 계정 (account_1)
├─ Instagram 계정 (account_2)
└─ TikTok 계정 (account_3)
```

**장점:**
- 사용자가 어떤 SNS로든 로그인 가능
- 모든 SNS 프로필 정보 한눈에 확인
- 계정 연결/해제 자유롭게 관리

### 2. **자동 계정 병합** (Email 기반)

```typescript
// 시나리오: 같은 이메일로 여러 SNS 로그인

// 1단계: Facebook 로그인 (hong@example.com)
→ User 생성 (id: user_1, email: hong@example.com)
→ Account 생성 (provider: facebook)

// 2단계: Instagram 로그인 (hong@example.com) - 같은 이메일!
→ 기존 User 찾기 (user_1)
→ Account 추가 (provider: instagram)
→ user_1에게 2개의 Account 연결됨

// 3단계: TikTok 로그인 (hong@example.com) - 같은 이메일!
→ 기존 User 찾기 (user_1)
→ Account 추가 (provider: tiktok)
→ user_1에게 3개의 Account 연결됨
```

**장점:**
- 중복 계정 방지
- 사용자 데이터 통합 관리
- Stripe 구독 정보 공유

### 3. **SNS 프로필 자동 동기화**

```typescript
// 로그인할 때마다 최신 정보 업데이트
{
  profile_picture: "https://...",      // 최신 프로필 사진
  profile_username: "@qetta_t",        // 최신 username
  follower_count: 12345,               // 최신 팔로워 수
  following_count: 678,                // 최신 팔로잉 수
  access_token: "...",                 // 새로운 액세스 토큰
  expires_at: 1234567890,              // 토큰 만료 시간
}
```

### 4. **Stripe 구독 통합**

```typescript
// User 테이블에 Stripe 정보 저장
{
  stripeCustomerId: "cus_xxxxx",
  stripeSubscriptionId: "sub_xxxxx",
  stripePriceId: "price_xxxxx",
  stripeCurrentPeriodEnd: "2025-11-18",
}

// 어떤 SNS로 로그인해도 구독 정보 유지됨!
```

---

## 🗃️ 데이터베이스 스키마

### **users** 테이블 (핵심 사용자 정보)

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,              -- 고유 ID (cuid)
  email TEXT UNIQUE,                -- 이메일 (unique, 계정 병합 키)
  email_verified DATETIME,          -- 이메일 인증 여부
  name TEXT,                        -- 이름
  image TEXT,                       -- 프로필 사진 URL
  username TEXT UNIQUE,             -- 사용자명 (선택)
  bio TEXT,                         -- 자기소개
  phone TEXT,                       -- 전화번호
  
  -- Stripe 구독 정보
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  stripe_current_period_end DATETIME,
  
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW()
);
```

### **accounts** 테이블 (SNS 계정 연결)

```sql
CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,            -- User FK (외래키)
  type TEXT,                        -- oauth, email, credentials
  provider TEXT,                    -- facebook, instagram, tiktok, google
  provider_account_id TEXT,         -- SNS에서 부여한 사용자 ID
  
  -- OAuth 토큰
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  
  -- SNS 프로필 정보
  profile_picture TEXT,             -- SNS 프로필 사진
  profile_username TEXT,            -- SNS username
  follower_count INTEGER,           -- 팔로워 수
  following_count INTEGER,          -- 팔로잉 수
  
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(provider, provider_account_id)
);
```

### **sessions** 테이블 (로그인 세션)

```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  session_token TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  expires DATETIME NOT NULL,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### **user_activities** 테이블 (활동 로그)

```sql
CREATE TABLE user_activities (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT,                        -- login, logout, profile_update, etc
  provider TEXT,                    -- 어떤 SNS로 로그인했는지
  metadata JSON,                    -- 추가 정보
  created_at DATETIME DEFAULT NOW()
);
```

---

## 🚀 설치 및 설정

### 1단계: 데이터베이스 초기화 (1분)

```bash
# Prisma 마이그레이션 실행
npm run db:migrate

# 또는 직접:
npx prisma migrate dev --name init
```

**결과:**
- `prisma/dev.db` 파일 생성 (SQLite)
- 모든 테이블 자동 생성
- Prisma Client 자동 생성

### 2단계: 테스트 데이터 추가 (선택사항)

```bash
# 시드 데이터 실행
npm run db:seed
```

**결과:**
- 테스트 사용자 2명 생성
- 여러 SNS 계정 연결된 예시 데이터
- 활동 로그 샘플

### 3단계: DB 확인 (GUI)

```bash
# Prisma Studio 실행
npm run db:studio
```

→ http://localhost:5555 에서 DB 확인 가능

---

## 💻 사용 방법

### 방법 1: API 엔드포인트 사용

#### **POST /api/auth/social-login** - SNS 로그인 처리

```typescript
// Facebook 로그인 후 DB 저장
const response = await fetch('/api/auth/social-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'facebook',
    providerAccountId: 'fb_123456',
    email: 'user@example.com',
    name: 'Hong Gildong',
    image: 'https://graph.facebook.com/me/picture',
    username: 'hong_fb',
    followerCount: 1234,
    followingCount: 567,
    accessToken: 'access_token_here',
    refreshToken: 'refresh_token_here',
    expiresAt: 1234567890,
  }),
});

const data = await response.json();

console.log(data);
// {
//   success: true,
//   isNewUser: true/false,
//   user: { id, email, name, image, username },
//   account: { provider, profilePicture, followerCount },
//   sessionToken: "...",
//   message: "Welcome! New account created with facebook"
// }
```

#### **GET /api/auth/social-login?userId=xxx** - 사용자 정보 조회

```typescript
const response = await fetch('/api/auth/social-login?userId=user_123');
const data = await response.json();

console.log(data);
// {
//   success: true,
//   user: {
//     id: "user_123",
//     email: "user@example.com",
//     name: "Hong Gildong",
//     createdAt: "2025-10-18T..."
//   },
//   accounts: [
//     {
//       provider: "facebook",
//       profileUsername: "@hong_fb",
//       followerCount: 1234,
//       connectedAt: "2025-10-18T..."
//     },
//     {
//       provider: "instagram",
//       profileUsername: "@hong_ig",
//       followerCount: 5678,
//       connectedAt: "2025-10-18T..."
//     }
//   ],
//   totalAccounts: 2
// }
```

### 방법 2: 프로그래밍 방식 (서버 컴포넌트)

```typescript
import { 
  handleSocialLogin,
  getUserWithAccounts,
  getUserAccounts,
  unlinkAccount,
  updateUserProfile,
  updateUserSubscription,
} from '@/lib/auth-db';

// 1. SNS 로그인 처리
const result = await handleSocialLogin({
  provider: 'facebook',
  providerAccountId: 'fb_123',
  email: 'user@example.com',
  name: 'Hong Gildong',
  image: 'https://...',
  accessToken: '...',
});

console.log(result.isNewUser);  // true = 신규 가입, false = 기존 사용자
console.log(result.user);       // User 정보
console.log(result.account);    // Account 정보

// 2. 사용자 정보 조회 (모든 SNS 계정 포함)
const user = await getUserWithAccounts('user_123');

console.log(user.name);
console.log(user.email);
console.log(user.accounts);  // 연결된 모든 SNS 계정 배열

// 3. 특정 SNS 계정만 조회
const facebookAccounts = user.accounts.filter(
  acc => acc.provider === 'facebook'
);

// 4. 프로필 업데이트
await updateUserProfile('user_123', {
  name: 'New Name',
  bio: 'New bio',
  username: 'new_username',
});

// 5. Stripe 구독 정보 업데이트
await updateUserSubscription('user_123', {
  stripeCustomerId: 'cus_xxx',
  stripeSubscriptionId: 'sub_xxx',
  stripePriceId: 'price_xxx',
  stripeCurrentPeriodEnd: new Date('2025-11-18'),
});

// 6. 계정 연결 해제
await unlinkAccount('user_123', 'facebook');
// ⚠️  최소 1개 계정은 남겨야 함
```

---

## 🔄 실제 통합 플로우

### Facebook 로그인 완전 플로우

```typescript
// 1. Edge Runtime (OAuth 처리)
// src/app/api/auth/facebook/route.ts

export async function GET(request: NextRequest) {
  // ... OAuth 로직 ...
  
  const tokenData = await facebookOAuth.exchangeCodeForToken(code);
  const userInfo = await facebookOAuth.getUserInfo(tokenData.access_token);

  // 2. Node.js Runtime으로 DB 저장 요청
  const dbResponse = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/social-login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'facebook',
        providerAccountId: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        image: userInfo.picture?.data?.url,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: tokenData.expires_in ? Date.now() / 1000 + tokenData.expires_in : undefined,
      }),
    }
  );

  const dbData = await dbResponse.json();

  // 3. 세션 쿠키 설정 및 리다이렉트
  const response = NextResponse.redirect(
    new URL('/dashboard', request.url)
  );
  
  response.cookies.set('session', dbData.sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}
```

### Instagram 로그인 플로우 (동일)

```typescript
// Instagram도 Facebook OAuth 사용
// type=instagram 파라미터로 구분

// ?type=instagram 으로 요청
// → 동일한 플로우로 DB 저장
// → provider: 'instagram' 으로 저장됨
```

### TikTok 로그인 플로우

```typescript
// src/app/api/auth/tiktok/route.ts

// TikTok OAuth 후
const userInfo = await tiktokOAuth.getUserInfo(accessToken);

// DB 저장
await fetch('/api/auth/social-login', {
  method: 'POST',
  body: JSON.stringify({
    provider: 'tiktok',
    providerAccountId: userInfo.data.user.open_id,
    name: userInfo.data.user.display_name,
    image: userInfo.data.user.avatar_url,
    username: userInfo.data.user.display_name,
    accessToken,
    // TikTok은 email 제공 안 할 수도 있음
  }),
});
```

---

## 📝 시나리오 예시

### 시나리오 1: 신규 사용자 가입

```
1. 사용자가 Facebook으로 로그인
   → users 테이블: User 생성 (email: hong@example.com)
   → accounts 테이블: Account 생성 (provider: facebook)
   → user_activities: signup 로그 기록

2. DB 상태:
   users:
     id: user_1
     email: hong@example.com
     name: Hong Gildong
     created_at: 2025-10-18
   
   accounts:
     id: acc_1
     user_id: user_1
     provider: facebook
     provider_account_id: fb_123
     follower_count: 1234
```

### 시나리오 2: 계정 추가 연결

```
1. 기존 사용자가 Instagram으로 로그인 (같은 이메일)
   → users 테이블: 기존 User(user_1) 찾기 ← email로 검색
   → accounts 테이블: 새 Account 추가 (provider: instagram)
   → user_activities: account_linked 로그 기록

2. DB 상태:
   users:
     id: user_1
     email: hong@example.com  ← 변화 없음
   
   accounts:
     acc_1: provider=facebook
     acc_2: provider=instagram  ← 새로 추가!
     
3. 이제 사용자는:
   - Facebook으로 로그인 가능
   - Instagram으로 로그인 가능
   → 둘 다 같은 User(user_1)로 인식됨!
```

### 시나리오 3: 여러 SNS 계정 관리

```
사용자 현황:
- User: user_1 (hong@example.com)
- Accounts:
  1. Facebook (fb_123)
  2. Instagram (ig_456)
  3. TikTok (tt_789)
  4. Google (google_999)

가능한 작업:
✅ Facebook으로 로그인 → user_1
✅ Instagram으로 로그인 → user_1
✅ TikTok으로 로그인 → user_1
✅ Google로 로그인 → user_1

✅ 모든 SNS 프로필 정보 한눈에 보기
✅ 특정 SNS 계정 연결 해제
✅ Stripe 구독은 모든 SNS에서 공유
```

---

## 🎨 프론트엔드 예시

### 사용자 프로필 페이지

```typescript
'use client';

import { useEffect, useState } from 'react';

export default function ProfilePage({ userId }: { userId: string }) {
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/auth/social-login?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setAccounts(data.accounts);
      });
  }, [userId]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 프로필 헤더 */}
      <div className="flex items-center gap-6 mb-8">
        <img
          src={user.image}
          alt={user.name}
          className="w-24 h-24 rounded-full"
        />
        <div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-gray-600">@{user.username}</p>
          <p className="mt-2">{user.bio}</p>
        </div>
      </div>

      {/* 연결된 SNS 계정 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">
          연결된 SNS 계정 ({accounts.length})
        </h2>
        
        <div className="space-y-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between border-b pb-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={account.profilePicture}
                  alt={account.provider}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="font-bold capitalize">
                    {account.provider}
                  </div>
                  <div className="text-sm text-gray-600">
                    @{account.profileUsername}
                  </div>
                  <div className="text-xs text-gray-500">
                    팔로워: {account.followerCount?.toLocaleString() || 'N/A'}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleUnlink(account.provider)}
                className="px-4 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50"
                disabled={accounts.length === 1}
              >
                연결 해제
              </button>
            </div>
          ))}
        </div>

        {/* 새 계정 연결 버튼 */}
        <div className="mt-6 flex gap-4">
          {!accounts.find(a => a.provider === 'facebook') && (
            <button onClick={() => window.location.href = '/api/auth/facebook'}>
              Facebook 연결
            </button>
          )}
          {!accounts.find(a => a.provider === 'instagram') && (
            <button onClick={() => window.location.href = '/api/auth/facebook?type=instagram'}>
              Instagram 연결
            </button>
          )}
          {!accounts.find(a => a.provider === 'tiktok') && (
            <button onClick={() => window.location.href = '/api/auth/tiktok'}>
              TikTok 연결
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 🔧 Prisma 명령어 치트시트

```bash
# 개발 단계
npm run db:migrate      # 스키마 변경 후 마이그레이션
npm run db:generate     # Prisma Client 재생성
npm run db:studio       # GUI로 DB 확인
npm run db:seed         # 시드 데이터 추가
npm run db:push         # 스키마만 푸시 (빠름)

# 직접 실행
npx prisma migrate dev --name <migration_name>
npx prisma generate
npx prisma studio
npx prisma db push
npx prisma db pull      # 기존 DB에서 스키마 가져오기
npx prisma migrate reset  # DB 초기화 (주의!)
```

---

## 🎯 완료 체크리스트

- [x] Prisma 설치 및 설정
- [x] DB 스키마 설계 (users, accounts, sessions, user_activities)
- [x] 계정 병합 로직 구현 (handleSocialLogin)
- [x] SNS 로그인 API 통합 (/api/auth/social-login)
- [x] 헬퍼 함수 작성 (auth-db.ts)
- [x] 시드 데이터 작성
- [x] 설정 가이드 작성
- [x] 한글 완전 문서 작성

---

## 🚀 다음 단계

### 1. DB 초기화 (필수)

```bash
npm run db:migrate
```

### 2. 테스트 데이터 추가 (선택)

```bash
npm run db:seed
```

### 3. DB 확인

```bash
npm run db:studio
# → http://localhost:5555
```

### 4. SNS 로그인 테스트

```bash
npm run dev
# → Facebook/Instagram/TikTok 로그인 시도
# → Prisma Studio에서 DB 확인
```

---

## 📚 추가 리소스

- **Prisma 문서**: https://www.prisma.io/docs
- **NextAuth.js 스키마**: https://next-auth.js.org/adapters/models
- **Better Auth**: https://www.better-auth.com/docs
- **OAuth 2.0**: https://oauth.net/2/

---

## 🎉 완료!

**SNS 로그인 DB 가공 전략이 완벽하게 구현되었습니다!**

- ✅ 여러 SNS 계정 동시 연결
- ✅ 자동 계정 병합 (email 기반)
- ✅ SNS 프로필 자동 동기화
- ✅ Stripe 구독 통합
- ✅ 활동 로그 기록
- ✅ 완벽한 TypeScript 타입 지원

**이제 DB를 초기화하고 테스트해보세요!** 🚀
