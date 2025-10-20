#!/usr/bin/env tsx
/**
 * RapidAPI 설정 가이드
 * 
 * Instagram & TikTok 우회 API 설정 방법
 * 공식 API 없이 공개 데이터 접근 가능
 * 
 * 소요 시간: 5분
 * 비용: 무료 (월 500 requests)
 */

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║         🚀 RapidAPI 설정 가이드 (Instagram & TikTok)        ║
║                                                              ║
║  ✅ 공식 API 없이 인스타그램/틱톡 데이터 접근                ║
║  ✅ 로그인 불필요, API 키만으로 사용 가능                    ║
║  ✅ 무료 티어: 월 500 requests (테스트 충분)                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

📋 설정 단계 (총 5분)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─ STEP 1: RapidAPI 계정 생성 (2분) ─────────────────────────┐
│                                                              │
│  1. 사이트 접속:                                             │
│     https://rapidapi.com/                                    │
│                                                              │
│  2. "Sign Up" 클릭                                           │
│     - Google 계정으로 간편 가입 추천                         │
│     - 또는 이메일로 가입 가능                                │
│                                                              │
│  3. 무료 Basic Plan 선택                                     │
│     - 월 500 requests 무료                                   │
│     - 신용카드 등록 불필요                                   │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─ STEP 2: Instagram API 구독 (1분) ────────────────────────┐
│                                                              │
│  1. API 페이지 접속:                                         │
│     https://rapidapi.com/Sonjik/api/tokapi-mobile-version   │
│                                                              │
│  2. "Subscribe to Test" 버튼 클릭                            │
│                                                              │
│  3. Basic Plan (FREE) 선택:                                  │
│     ✓ 500 requests/month                                     │
│     ✓ 신용카드 불필요                                        │
│     ✓ 공개 프로필 조회                                       │
│     ✓ 포스트 조회                                            │
│     ✓ 검색 기능                                              │
│                                                              │
│  4. "Subscribe" 클릭하여 구독 완료                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─ STEP 3: TikTok API 구독 (1분) ───────────────────────────┐
│                                                              │
│  1. API 페이지 접속:                                         │
│     https://rapidapi.com/HikerAPI/api/tiktok-api            │
│                                                              │
│  2. "Subscribe to Test" 버튼 클릭                            │
│                                                              │
│  3. Basic Plan (FREE) 선택:                                  │
│     ✓ 500 requests/month                                     │
│     ✓ 신용카드 불필요                                        │
│     ✓ 공개 프로필 조회                                       │
│     ✓ 비디오 조회                                            │
│     ✓ 검색 기능                                              │
│                                                              │
│  4. "Subscribe" 클릭하여 구독 완료                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─ STEP 4: API 키 복사 (1분) ───────────────────────────────┐
│                                                              │
│  1. RapidAPI Dashboard 접속:                                 │
│     https://rapidapi.com/developer/dashboard                 │
│                                                              │
│  2. 왼쪽 메뉴에서 "Default Application" 클릭                 │
│                                                              │
│  3. "Security" 탭에서 API Key 확인:                          │
│     예: abc123def456ghi789jkl012mno345pqr678                 │
│                                                              │
│  4. "Copy" 버튼으로 API Key 복사                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─ STEP 5: .env.local 설정 (1분) ───────────────────────────┐
│                                                              │
│  .env.local 파일을 열고 다음 내용 추가:                      │
│                                                              │
│  # RapidAPI (Instagram & TikTok 우회)                       │
│  RAPIDAPI_KEY=여기에_복사한_API키_붙여넣기                   │
│  RAPIDAPI_INSTAGRAM_HOST=tokapi-mobile-version.p.rapidapi.com│
│  RAPIDAPI_TIKTOK_HOST=tiktok-api23.p.rapidapi.com           │
│                                                              │
└──────────────────────────────────────────────────────────────┘

✅ 설정 완료!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧪 테스트 방법
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

개발 서버 실행:
  npm run dev

브라우저에서 테스트:

1. Instagram 프로필 조회:
   http://localhost:3000/api/social/instagram?username=qetta_t

2. Instagram 포스트 조회:
   http://localhost:3000/api/social/instagram?username=qetta_t&type=posts&count=20

3. TikTok 프로필 조회:
   http://localhost:3000/api/social/tiktok?username=charlidamelio

4. TikTok 비디오 조회:
   http://localhost:3000/api/social/tiktok?username=charlidamelio&type=videos&count=20

5. Instagram 검색:
   http://localhost:3000/api/social/instagram?query=fashion&type=search&searchType=user

6. TikTok 검색:
   http://localhost:3000/api/social/tiktok?query=dance&type=search&searchType=hashtag


📊 API 응답 예시
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Instagram 프로필:
{
  "success": true,
  "type": "profile",
  "username": "qetta_t",
  "data": {
    "user": {
      "id": "123456789",
      "username": "qetta_t",
      "full_name": "Qetta T",
      "profile_pic_url": "https://...",
      "biography": "...",
      "follower_count": 1234,
      "following_count": 567
    }
  }
}

TikTok 프로필:
{
  "success": true,
  "type": "profile",
  "username": "charlidamelio",
  "data": {
    "user": {
      "id": "123456789",
      "unique_id": "charlidamelio",
      "nickname": "charli d'amelio",
      "avatar": "https://...",
      "signature": "...",
      "followerCount": 100000000,
      "followingCount": 1234,
      "videoCount": 5678
    }
  }
}


💡 사용 가능한 기능
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Instagram:
   - 공개 프로필 조회 (username으로)
   - 포스트 목록 조회
   - 해시태그/장소/유저 검색
   - 팔로워/팔로잉 수 조회
   - 프로필 사진 URL 가져오기

✅ TikTok:
   - 공개 프로필 조회 (username으로)
   - 비디오 목록 조회
   - 유저/비디오/해시태그 검색
   - 팔로워/팔로잉 수 조회
   - 비디오 URL 가져오기

⚠️ 제한사항:
   - 비공개 계정은 조회 불가
   - 로그인 필요한 기능 불가 (좋아요, 댓글 등)
   - 무료 플랜: 월 500 requests


🔧 프론트엔드 사용 예시
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Instagram 프로필 조회
async function getInstagramProfile(username: string) {
  const response = await fetch(
    \`/api/social/instagram?username=\${username}\`
  );
  return response.json();
}

// TikTok 비디오 조회
async function getTikTokVideos(username: string, count = 20) {
  const response = await fetch(
    \`/api/social/tiktok?username=\${username}&type=videos&count=\${count}\`
  );
  return response.json();
}


📞 문제 해결
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ "RapidAPI key not configured" 에러:
   → .env.local에 RAPIDAPI_KEY 설정 확인
   → 개발 서버 재시작 (npm run dev)

❌ 403 Forbidden 에러:
   → RapidAPI Dashboard에서 API 구독 확인
   → API Key가 올바른지 확인

❌ 429 Rate Limit 에러:
   → 무료 플랜 한도 초과 (월 500 requests)
   → 다음 달까지 대기 또는 유료 플랜 업그레이드

❌ 특정 username 조회 실패:
   → username 철자 확인
   → 계정이 비공개인지 확인
   → 계정이 존재하는지 확인


🎉 성공! 이제 인스타그램과 틱톡 데이터를 자유롭게 사용할 수 있습니다!

💰 비용 정보:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FREE (Basic):
  - 월 500 requests
  - 신용카드 불필요
  - 테스트 및 소규모 프로젝트에 충분

Pro ($9.99/월):
  - 월 10,000 requests
  - 더 빠른 응답 속도
  - 프리미엄 지원

Ultra ($49.99/월):
  - 월 100,000 requests
  - 최고 속도
  - 24/7 지원


📚 추가 리소스
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- RapidAPI 공식 문서: https://docs.rapidapi.com/
- TokAPI Instagram: https://rapidapi.com/Sonjik/api/tokapi-mobile-version
- TikTok API: https://rapidapi.com/HikerAPI/api/tiktok-api
- Dashboard: https://rapidapi.com/developer/dashboard

`);
