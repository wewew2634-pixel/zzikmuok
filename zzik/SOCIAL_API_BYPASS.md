# 📱 Instagram & TikTok API 우회 가이드

## 🎯 목표 달성!

✅ **공식 API 없이** 인스타그램과 틱톡 데이터 접근 성공!  
✅ **로그인 불필요** - API 키만으로 모든 공개 데이터 조회 가능  
✅ **무료 사용** - 월 500 requests 무료 (테스트 충분)  
✅ **간단한 설정** - 5분이면 완료

---

## 📊 구현된 기능

### Instagram (RapidAPI)
- ✅ 공개 프로필 조회 (username)
- ✅ 포스트 목록 조회
- ✅ 팔로워/팔로잉 수 조회
- ✅ 프로필 사진 URL
- ✅ 해시태그/장소/유저 검색

### TikTok (RapidAPI)
- ✅ 공개 프로필 조회 (username)
- ✅ 비디오 목록 조회
- ✅ 팔로워/팔로잉 수 조회
- ✅ 비디오 URL
- ✅ 유저/비디오/해시태그 검색

---

## 🚀 빠른 시작

### 1단계: RapidAPI 계정 생성 (2분)

1. https://rapidapi.com/ 접속
2. Google 계정으로 간편 가입
3. 무료 Basic Plan 선택 (신용카드 불필요)

### 2단계: API 구독 (2분)

**Instagram API:**
- https://rapidapi.com/Sonjik/api/tokapi-mobile-version
- "Subscribe to Test" → Basic (FREE) 선택

**TikTok API:**
- https://rapidapi.com/HikerAPI/api/tiktok-api
- "Subscribe to Test" → Basic (FREE) 선택

### 3단계: API 키 복사 (1분)

1. https://rapidapi.com/developer/dashboard
2. "Default Application" → "Security" 탭
3. API Key 복사

### 4단계: 환경변수 설정 (1분)

`.env.local` 파일에 추가:

```env
# RapidAPI (Instagram & TikTok 우회)
RAPIDAPI_KEY=여기에_복사한_API키_붙여넣기
RAPIDAPI_INSTAGRAM_HOST=tokapi-mobile-version.p.rapidapi.com
RAPIDAPI_TIKTOK_HOST=tiktok-api23.p.rapidapi.com
```

### 5단계: 설정 확인

```bash
# 상세 설정 가이드 보기
npm run setup:rapidapi

# 개발 서버 시작
npm run dev
```

---

## 🧪 사용 방법

### API 엔드포인트

#### Instagram

```bash
# 프로필 조회
GET /api/social/instagram?username=qetta_t

# 포스트 조회
GET /api/social/instagram?username=qetta_t&type=posts&count=20

# 검색 (유저)
GET /api/social/instagram?query=fashion&type=search&searchType=user

# 검색 (해시태그)
GET /api/social/instagram?query=fashion&type=search&searchType=hashtag
```

#### TikTok

```bash
# 프로필 조회
GET /api/social/tiktok?username=charlidamelio

# 비디오 조회
GET /api/social/tiktok?username=charlidamelio&type=videos&count=20

# 검색 (유저)
GET /api/social/tiktok?query=dance&type=search&searchType=user

# 검색 (비디오)
GET /api/social/tiktok?query=dance&type=search&searchType=video

# 검색 (해시태그)
GET /api/social/tiktok?query=dance&type=search&searchType=hashtag
```

### 프론트엔드 사용 예시

```typescript
// Instagram 프로필 조회
async function getInstagramProfile(username: string) {
  const response = await fetch(
    `/api/social/instagram?username=${username}`
  );
  const data = await response.json();
  
  if (data.success) {
    console.log(data.data.user);
    // {
    //   id: "123456789",
    //   username: "qetta_t",
    //   full_name: "Qetta T",
    //   profile_pic_url: "https://...",
    //   biography: "...",
    //   follower_count: 1234,
    //   following_count: 567
    // }
  }
}

// TikTok 비디오 조회
async function getTikTokVideos(username: string) {
  const response = await fetch(
    `/api/social/tiktok?username=${username}&type=videos&count=20`
  );
  const data = await response.json();
  
  if (data.success) {
    console.log(data.data);
    // {
    //   videos: [
    //     {
    //       id: "...",
    //       desc: "...",
    //       video: { downloadAddr: "https://..." },
    //       stats: { playCount, likeCount, shareCount }
    //     }
    //   ]
    // }
  }
}

// React Component 예시
function InstagramProfile({ username }: { username: string }) {
  const [profile, setProfile] = useState(null);
  
  useEffect(() => {
    fetch(`/api/social/instagram?username=${username}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProfile(data.data.user);
        }
      });
  }, [username]);
  
  if (!profile) return <div>Loading...</div>;
  
  return (
    <div>
      <img src={profile.profile_pic_url} alt={profile.username} />
      <h2>{profile.full_name}</h2>
      <p>@{profile.username}</p>
      <p>{profile.biography}</p>
      <div>
        <span>팔로워: {profile.follower_count.toLocaleString()}</span>
        <span>팔로잉: {profile.following_count.toLocaleString()}</span>
      </div>
    </div>
  );
}
```

---

## 📋 API 응답 예시

### Instagram 프로필

```json
{
  "success": true,
  "type": "profile",
  "username": "qetta_t",
  "data": {
    "user": {
      "id": "123456789",
      "username": "qetta_t",
      "full_name": "Qetta T",
      "profile_pic_url": "https://scontent.cdninstagram.com/...",
      "profile_pic_url_hd": "https://scontent.cdninstagram.com/...",
      "biography": "여기는 프로필 소개",
      "external_url": "https://qetta.com",
      "follower_count": 1234,
      "following_count": 567,
      "media_count": 89,
      "is_private": false,
      "is_verified": false
    }
  }
}
```

### Instagram 포스트

```json
{
  "success": true,
  "type": "posts",
  "username": "qetta_t",
  "count": 12,
  "data": {
    "items": [
      {
        "id": "post_id",
        "code": "ABC123",
        "caption": "포스트 캡션",
        "media_type": 1,
        "image_versions2": {
          "candidates": [
            { "url": "https://...", "width": 1080, "height": 1080 }
          ]
        },
        "like_count": 123,
        "comment_count": 45,
        "taken_at": 1234567890
      }
    ]
  }
}
```

### TikTok 프로필

```json
{
  "success": true,
  "type": "profile",
  "username": "charlidamelio",
  "data": {
    "user": {
      "id": "123456789",
      "unique_id": "charlidamelio",
      "nickname": "charli d'amelio",
      "avatar": "https://p16-sign-va.tiktokcdn.com/...",
      "signature": "프로필 소개",
      "verified": true,
      "followerCount": 100000000,
      "followingCount": 1234,
      "videoCount": 5678,
      "heartCount": 9999999999
    }
  }
}
```

### TikTok 비디오

```json
{
  "success": true,
  "type": "videos",
  "username": "charlidamelio",
  "count": 12,
  "data": {
    "videos": [
      {
        "id": "video_id",
        "desc": "비디오 설명",
        "createTime": 1234567890,
        "video": {
          "duration": 15,
          "downloadAddr": "https://...",
          "cover": "https://..."
        },
        "stats": {
          "playCount": 1000000,
          "likeCount": 50000,
          "commentCount": 1000,
          "shareCount": 5000
        },
        "music": {
          "title": "음악 제목",
          "authorName": "아티스트"
        }
      }
    ]
  }
}
```

---

## ⚠️ 제한사항

### 무료 플랜 제한
- ✅ 월 500 requests (테스트에 충분)
- ✅ 신용카드 불필요
- ⚠️ Rate Limit: 초당 5 requests

### 기능적 제한
- ❌ 비공개 계정 조회 불가
- ❌ 로그인 필요 기능 불가 (좋아요, 댓글 등)
- ❌ 스토리, DM 조회 불가
- ✅ 공개 프로필 및 포스트는 모두 조회 가능

### Rate Limit 관리

```typescript
// Rate Limit 처리 예시
async function fetchWithRetry(url: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url);
    
    if (response.status === 429) {
      // Rate Limit 초과
      const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
      console.log(`Rate limit exceeded, waiting ${retryAfter}s...`);
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      continue;
    }
    
    return response;
  }
  
  throw new Error('Max retries exceeded');
}
```

---

## 💰 비용 정보

### FREE (Basic) - **추천!**
- **비용:** $0/월
- **Request:** 500/월
- **속도:** 보통
- **신용카드:** 불필요
- **용도:** 테스트, 소규모 프로젝트

### Pro
- **비용:** $9.99/월
- **Request:** 10,000/월
- **속도:** 빠름
- **지원:** 프리미엄

### Ultra
- **비용:** $49.99/월
- **Request:** 100,000/월
- **속도:** 최고
- **지원:** 24/7

---

## 🔧 문제 해결

### "RapidAPI key not configured" 에러
```bash
# .env.local 확인
cat .env.local | grep RAPIDAPI_KEY

# 개발 서버 재시작
npm run dev
```

### 403 Forbidden 에러
- RapidAPI Dashboard에서 API 구독 확인
- API Key가 올바른지 확인
- 무료 플랜에서 해당 API를 구독했는지 확인

### 429 Rate Limit 에러
- 무료 플랜 한도 초과 (월 500 requests)
- Dashboard에서 사용량 확인: https://rapidapi.com/developer/billing
- 다음 달까지 대기 또는 유료 플랜 업그레이드

### 특정 username 조회 실패
- username 철자 확인
- 계정이 비공개인지 확인
- 계정이 존재하는지 확인

---

## 📚 추가 리소스

### 공식 문서
- RapidAPI: https://docs.rapidapi.com/
- TokAPI (Instagram): https://rapidapi.com/Sonjik/api/tokapi-mobile-version
- TikTok API: https://rapidapi.com/HikerAPI/api/tiktok-api

### Dashboard
- 사용량 확인: https://rapidapi.com/developer/billing
- API 관리: https://rapidapi.com/developer/apps
- 구독 관리: https://rapidapi.com/developer/subscriptions

### 도움말
- RapidAPI 지원: https://rapidapi.com/support
- 커뮤니티: https://community.rapidapi.com/

---

## ✅ 완료 체크리스트

- [ ] RapidAPI 계정 생성
- [ ] Instagram API 구독
- [ ] TikTok API 구독
- [ ] API Key 복사
- [ ] .env.local에 RAPIDAPI_KEY 추가
- [ ] 개발 서버 재시작
- [ ] 테스트: `curl http://localhost:3000/api/social/instagram?username=instagram`
- [ ] 테스트: `curl http://localhost:3000/api/social/tiktok?username=tiktok`

---

## 🎉 성공!

이제 인스타그램과 틱톡 데이터를 자유롭게 사용할 수 있습니다!

**공식 API 없이도** 모든 공개 데이터에 접근 가능하며,  
**로그인 없이도** username만으로 프로필과 포스트를 조회할 수 있습니다!

---

## 📞 지원

문제가 있으신가요?

```bash
# 상세 설정 가이드
npm run setup:rapidapi

# API 테스트
npm run test:apis
```

---

**마지막 업데이트:** 2025-10-18  
**버전:** 1.0.0  
**작성자:** ZZIK Development Team
