#!/usr/bin/env tsx
/**
 * 데이터베이스 설정 가이드
 * 
 * SNS 로그인을 위한 DB 스키마 초기화
 */

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║         🗄️  SNS 로그인 데이터베이스 설정 가이드             ║
║                                                              ║
║  ✅ Prisma ORM 사용                                          ║
║  ✅ 계정 병합 자동 처리                                       ║
║  ✅ 여러 SNS 계정 동시 연결                                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

📋 DB 설계 전략
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 핵심 설계 원칙:

1. **한 사용자, 여러 SNS 계정**
   User (1) ←→ (N) Accounts
   
   예시: 홍길동 사용자가
   - Facebook 계정
   - Instagram 계정  
   - TikTok 계정
   → 3개 모두 연결 가능!

2. **자동 계정 병합**
   같은 이메일이면 자동으로 하나의 User로 병합
   
   예시:
   - Facebook 로그인 (user@example.com) → User 생성
   - Instagram 로그인 (user@example.com) → 기존 User에 Account 추가
   - TikTok 로그인 (user@example.com) → 기존 User에 Account 추가

3. **SNS 프로필 자동 업데이트**
   로그인할 때마다 최신 프로필 정보 갱신:
   - 프로필 사진
   - 팔로워 수
   - 팔로잉 수
   - username

4. **Stripe 구독 통합**
   User 테이블에 Stripe 정보 저장:
   - stripeCustomerId
   - stripeSubscriptionId
   - 구독 만료일


📊 데이터베이스 스키마
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

테이블 구조:

1. **users** (사용자)
   - id: 고유 ID
   - email: 이메일 (unique)
   - name: 이름
   - image: 프로필 사진
   - username: 사용자명
   - bio: 자기소개
   - stripeCustomerId: Stripe 고객 ID
   - stripeSubscriptionId: 구독 ID
   - createdAt, updatedAt

2. **accounts** (SNS 계정 연결)
   - id: 고유 ID
   - userId: User FK
   - provider: facebook, instagram, tiktok, google 등
   - providerAccountId: SNS에서 부여한 ID
   - access_token: OAuth 액세스 토큰
   - refresh_token: 리프레시 토큰
   - expires_at: 토큰 만료 시간
   - profile_picture: SNS 프로필 사진
   - profile_username: SNS username
   - follower_count: 팔로워 수
   - following_count: 팔로잉 수

3. **sessions** (로그인 세션)
   - id: 고유 ID
   - userId: User FK
   - sessionToken: 세션 토큰
   - expires: 만료 시간

4. **user_activities** (활동 로그)
   - id: 고유 ID
   - userId: User FK
   - type: login, logout, profile_update 등
   - provider: 어떤 SNS로 로그인했는지
   - metadata: 추가 정보 (JSON)


🚀 설치 단계
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: DB 초기화 (1분)
──────────────────────────────────────────────────────────────

개발용 (SQLite - 가장 간단):
  npx prisma migrate dev --name init

프로덕션용 (PostgreSQL):
  1. .env.local 수정:
     DATABASE_URL="postgresql://user:pass@localhost:5432/zzik_db"
  
  2. Prisma 스키마 수정:
     datasource db {
       provider = "postgresql"
       url      = env("DATABASE_URL")
     }
  
  3. 마이그레이션 실행:
     npx prisma migrate deploy


STEP 2: Prisma Client 생성 (1분)
──────────────────────────────────────────────────────────────

  npx prisma generate


STEP 3: DB 브라우저 열기 (선택사항)
──────────────────────────────────────────────────────────────

Prisma Studio (GUI 도구):
  npx prisma studio
  
  → http://localhost:5555 에서 DB 확인 가능


✅ 사용 방법
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. SNS 로그인 처리:

// Edge Runtime (Facebook OAuth 라우트)에서
const userInfo = await facebookOAuth.getUserInfo(token);

// Node.js Runtime (DB 라우트)로 전달
const response = await fetch('/api/auth/social-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'facebook',
    providerAccountId: userInfo.id,
    email: userInfo.email,
    name: userInfo.name,
    image: userInfo.picture?.data?.url,
    accessToken: token,
  }),
});

const { user, account, sessionToken } = await response.json();
// → DB에 저장 완료, 세션 토큰 발급


2. 사용자 정보 조회:

const response = await fetch(\`/api/auth/social-login?userId=\${userId}\`);
const { user, accounts } = await response.json();

console.log(\`User: \${user.name}\`);
console.log(\`Connected accounts: \${accounts.length}\`);
accounts.forEach(acc => {
  console.log(\`- \${acc.provider}: @\${acc.profileUsername}\`);
});


3. 프로그래밍 방식 사용:

import { 
  handleSocialLogin, 
  getUserWithAccounts,
  unlinkAccount,
  updateUserProfile 
} from '@/lib/auth-db';

// 로그인 처리
const result = await handleSocialLogin({
  provider: 'facebook',
  providerAccountId: 'fb_123456',
  email: 'user@example.com',
  name: 'Hong Gildong',
  // ...
});

// 사용자 조회
const user = await getUserWithAccounts(userId);

// 계정 연결 해제
await unlinkAccount(userId, 'facebook');

// 프로필 업데이트
await updateUserProfile(userId, {
  name: 'New Name',
  bio: 'New bio',
});


📝 예시 시나리오
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

시나리오 1: 새로운 사용자
──────────────────────────────────────────────────────────────

1. 사용자가 Facebook으로 로그인
   → users 테이블에 새 User 생성
   → accounts 테이블에 Facebook Account 생성
   
2. DB 상태:
   users:
     - id: user_1
     - email: hong@example.com
     - name: Hong Gildong
   
   accounts:
     - userId: user_1
     - provider: facebook
     - providerAccountId: fb_123


시나리오 2: 계정 추가 연결
──────────────────────────────────────────────────────────────

1. 기존 사용자가 Instagram으로 로그인 (같은 이메일)
   → 기존 User 찾기
   → accounts 테이블에 Instagram Account 추가
   
2. DB 상태:
   users:
     - id: user_1
     - email: hong@example.com
   
   accounts:
     - userId: user_1, provider: facebook
     - userId: user_1, provider: instagram  ← 추가됨!


시나리오 3: 여러 SNS로 로그인 가능
──────────────────────────────────────────────────────────────

사용자는 이제:
- Facebook으로 로그인 → 성공 (user_1)
- Instagram으로 로그인 → 성공 (user_1)
- TikTok으로 로그인 → 성공 (user_1, 새 account 추가)

→ 모두 같은 User(user_1)로 인식됨!


🔧 Prisma 명령어 치트시트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

개발 단계:
  npx prisma migrate dev         # 스키마 변경 후 마이그레이션
  npx prisma generate            # Prisma Client 재생성
  npx prisma studio              # GUI로 DB 확인
  npx prisma db seed             # 시드 데이터 추가

프로덕션 배포:
  npx prisma migrate deploy      # 프로덕션 마이그레이션
  npx prisma generate            # Client 생성

DB 관리:
  npx prisma db push             # 스키마만 푸시 (마이그레이션 파일 없이)
  npx prisma db pull             # 기존 DB에서 스키마 가져오기
  npx prisma migrate reset       # DB 초기화 (주의!)


💡 추가 기능 아이디어
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. **계정 연결 관리 페이지**
   사용자가 연결된 SNS 계정 확인 및 관리
   
2. **활동 로그 분석**
   user_activities 테이블로 사용자 행동 분석
   
3. **SNS 프로필 동기화**
   정기적으로 SNS 프로필 정보 업데이트
   
4. **계정 병합 충돌 해결**
   다른 이메일이지만 같은 사람인 경우 수동 병합


📚 참고 문서
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Prisma 공식 문서: https://www.prisma.io/docs
- NextAuth.js 스키마: https://next-auth.js.org/adapters/models
- Better Auth: https://www.better-auth.com/docs
- OAuth 2.0: https://oauth.net/2/


🎯 다음 단계
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. DB 초기화:
   npx prisma migrate dev --name init

2. Prisma Studio 열기:
   npx prisma studio

3. SNS 로그인 테스트:
   npm run dev
   → Facebook/Instagram/TikTok 로그인 시도
   → Prisma Studio에서 DB 확인

4. API 테스트:
   curl -X POST http://localhost:3000/api/auth/social-login \\
     -H "Content-Type: application/json" \\
     -d '{
       "provider": "facebook",
       "providerAccountId": "test123",
       "email": "test@example.com",
       "name": "Test User"
     }'


🎉 완료! 이제 SNS 로그인이 완벽하게 DB와 통합되었습니다!

`);
