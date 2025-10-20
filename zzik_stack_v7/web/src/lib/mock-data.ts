/**
 * ZZIK Mock Data - 크리에이터 매칭 시뮬레이션
 * ================================================
 * 
 * 서비스 목표 반영:
 * 1. "3km 반경 2,100명" → reach_3km 필드
 * 2. 신뢰도 점수 → confidence_score (0.85~0.98)
 * 3. 카테고리 태그 → categories[]
 * 4. 예상 방문객 → expected_visitors
 */

export interface CreatorLocation {
  adm1: string; // 시/도
  adm2: string; // 구
  adm3?: string; // 동
  latitude: number;
  longitude: number;
}

export interface Creator {
  id: string;
  username: string;
  display_name: string;
  profile_image: string;
  bio: string;
  
  // SNS 지표
  platform: "instagram" | "tiktok";
  follower_count: number;
  following_count: number;
  post_count: number;
  
  // ZZIK 핵심 차별화 데이터
  location: CreatorLocation;
  reach_3km: number; // 3km 반경 내 도달 인원
  expected_visitors: number; // 예상 방문객 (reach의 5%)
  confidence_score: number; // 위치 신뢰도 (0~1)
  
  // 카테고리
  categories: string[]; // ["카페", "디저트", "브런치"]
  
  // 성과 지표
  engagement_rate: number; // 참여율 (%)
  avg_likes: number;
  avg_comments: number;
  avg_views: number; // 평균 조회수
  
  // 가격
  price_per_post: number; // 1회 포스팅 단가 (원)
  
  // 활동 상태
  is_active: boolean;
  last_post_date: string; // ISO 8601
  avg_response_hours?: number; // 평균 응답 시간 (시간)
  
  // 최근 콘텐츠
  recent_content: Array<{
    thumbnail_url: string;
    views: number;
    likes: number;
  }>;
}

/**
 * Mock 크리에이터 데이터 (강남구 기준)
 */
export const mockCreators: Creator[] = [
  {
    id: "c1",
    username: "@seoul_cafe_lover",
    display_name: "서울카페러버",
    profile_image: "https://api.dicebear.com/7.x/avataaars/svg?seed=cafe1",
    bio: "강남 카페 투어 | 매일 새로운 카페 발견 ☕️",
    
    platform: "instagram",
    follower_count: 8500,
    following_count: 450,
    post_count: 320,
    
    location: {
      adm1: "서울특별시",
      adm2: "강남구",
      adm3: "논현동",
      latitude: 37.5111,
      longitude: 127.0222,
    },
    reach_3km: 2100,
    expected_visitors: 105,
    confidence_score: 0.94,
    
    categories: ["카페", "디저트", "브런치"],
    
    engagement_rate: 4.2,
    avg_likes: 357,
    avg_comments: 28,
    avg_views: 8500,
    
    price_per_post: 150000,
    
    is_active: true,
    last_post_date: "2025-10-17T10:30:00Z",
    avg_response_hours: 2,

    recent_content: [
      { thumbnail_url: "https://api.dicebear.com/7.x/shapes/svg?seed=content1", views: 8900, likes: 375 },
      { thumbnail_url: "https://api.dicebear.com/7.x/shapes/svg?seed=content2", views: 8300, likes: 350 },
      { thumbnail_url: "https://api.dicebear.com/7.x/shapes/svg?seed=content3", views: 8100, likes: 342 },
    ],
  },
  {
    id: "c2",
    username: "@gangnam_foodie",
    display_name: "강남맛집탐방",
    profile_image: "https://api.dicebear.com/7.x/avataaars/svg?seed=food1",
    bio: "강남 맛집 전문 | 협찬 문의 DM 📩",
    
    platform: "instagram",
    follower_count: 12300,
    following_count: 380,
    post_count: 450,
    
    location: {
      adm1: "서울특별시",
      adm2: "강남구",
      adm3: "역삼동",
      latitude: 37.5010,
      longitude: 127.0374,
    },
    reach_3km: 3200,
    expected_visitors: 160,
    confidence_score: 0.91,
    
    categories: ["음식점", "카페", "술집"],
    
    engagement_rate: 5.8,
    avg_likes: 713,
    avg_comments: 42,
    avg_views: 10000,
    
    price_per_post: 200000,
    
    is_active: true,
    last_post_date: "2025-10-18T08:15:00Z",
    avg_response_hours: 3,

    recent_content: [
      { thumbnail_url: "https://api.dicebear.com/7.x/shapes/svg?seed=c1", views: 10000, likes: 400 },
      { thumbnail_url: "https://api.dicebear.com/7.x/shapes/svg?seed=c2", views: 9500, likes: 380 },
      { thumbnail_url: "https://api.dicebear.com/7.x/shapes/svg?seed=c3", views: 9000, likes: 360 },
    ],
  },
  {
    id: "c3",
    username: "@dessert_seoul",
    display_name: "서울디저트",
    profile_image: "https://api.dicebear.com/7.x/avataaars/svg?seed=dessert1",
    bio: "달달한 서울 디저트 투어 🍰 | 주 3회 업로드",
    
    platform: "tiktok",
    follower_count: 6700,
    following_count: 120,
    post_count: 180,
    
    location: {
      adm1: "서울특별시",
      adm2: "강남구",
      adm3: "신사동",
      latitude: 37.5240,
      longitude: 127.0202,
    },
    reach_3km: 1850,
    expected_visitors: 93,
    confidence_score: 0.88,
    
    categories: ["디저트", "카페", "베이커리"],
    
    engagement_rate: 3.5,
    avg_likes: 234,
    avg_comments: 15,
    avg_views: 10000,
    
    price_per_post: 120000,
    
    is_active: true,
    last_post_date: "2025-10-16T14:20:00Z",
    avg_response_hours: 3,

    recent_content: [
      { thumbnail_url: "https://api.dicebear.com/7.x/shapes/svg?seed=c1", views: 10000, likes: 400 },
      { thumbnail_url: "https://api.dicebear.com/7.x/shapes/svg?seed=c2", views: 9500, likes: 380 },
      { thumbnail_url: "https://api.dicebear.com/7.x/shapes/svg?seed=c3", views: 9000, likes: 360 },
    ],
  },
  {
    id: "c4",
    username: "@apgujeong_life",
    display_name: "압구정라이프",
    profile_image: "https://api.dicebear.com/7.x/avataaars/svg?seed=life1",
    bio: "압구정 로컬 라이프 | 맛집 & 카페 & 핫플 🌟",
    
    platform: "instagram",
    follower_count: 9800,
    following_count: 520,
    post_count: 410,
    
    location: {
      adm1: "서울특별시",
      adm2: "강남구",
      adm3: "압구정동",
      latitude: 37.5270,
      longitude: 127.0286,
    },
    reach_3km: 2500,
    expected_visitors: 125,
    confidence_score: 0.96,
    
    categories: ["카페", "음식점", "라이프스타일"],
    
    engagement_rate: 4.7,
    avg_likes: 460,
    avg_comments: 35,
    avg_views: 10000,
    
    price_per_post: 180000,
    
    is_active: true,
    last_post_date: "2025-10-17T16:45:00Z",
    avg_response_hours: 3,

    recent_content: [
      { thumbnail_url: "https://api.dicebear.com/7.x/shapes/svg?seed=c1", views: 10000, likes: 400 },
      { thumbnail_url: "https://api.dicebear.com/7.x/shapes/svg?seed=c2", views: 9500, likes: 380 },
      { thumbnail_url: "https://api.dicebear.com/7.x/shapes/svg?seed=c3", views: 9000, likes: 360 },
    ],
  },
  {
    id: "c5",
    username: "@brunch_lover_kr",
    display_name: "브런치러버",
    profile_image: "https://api.dicebear.com/7.x/avataaars/svg?seed=brunch1",
    bio: "주말 브런치 맛집 추천 🥞 | 강남/서초 중심",
    
    platform: "instagram",
    follower_count: 7200,
    following_count: 290,
    post_count: 250,
    
    location: {
      adm1: "서울특별시",
      adm2: "강남구",
      adm3: "청담동",
      latitude: 37.5195,
      longitude: 127.0470,
    },
    reach_3km: 1920,
    expected_visitors: 96,
    confidence_score: 0.89,
    
    categories: ["브런치", "카페", "베이커리"],
    
    engagement_rate: 4.0,
    avg_likes: 288,
    avg_comments: 20,
    avg_views: 10000,
    
    price_per_post: 140000,
    
    is_active: true,
    last_post_date: "2025-10-18T09:30:00Z",
    avg_response_hours: 3,

    recent_content: [
      { thumbnail_url: "https://api.dicebear.com/7.x/shapes/svg?seed=c1", views: 10000, likes: 400 },
      { thumbnail_url: "https://api.dicebear.com/7.x/shapes/svg?seed=c2", views: 9500, likes: 380 },
      { thumbnail_url: "https://api.dicebear.com/7.x/shapes/svg?seed=c3", views: 9000, likes: 360 },
    ],
  },
];

/**
 * 카테고리 필터 옵션
 */
export const categoryOptions = [
  { value: "all", label: "전체", icon: "🏪" },
  { value: "카페", label: "카페", icon: "☕" },
  { value: "음식점", label: "음식점", icon: "🍽️" },
  { value: "디저트", label: "디저트", icon: "🍰" },
  { value: "브런치", label: "브런치", icon: "🥞" },
  { value: "술집", label: "술집", icon: "🍺" },
  { value: "베이커리", label: "베이커리", icon: "🥖" },
];

/**
 * 거리 필터 옵션 (km)
 */
export const distanceOptions = [
  { value: 1, label: "1km 이내" },
  { value: 2, label: "2km 이내" },
  { value: 3, label: "3km 이내" },
  { value: 5, label: "5km 이내" },
];

/**
 * 팔로워 범위 옵션
 */
export const followerRanges = [
  { min: 0, max: 5000, label: "5천 미만" },
  { min: 5000, max: 10000, label: "5천~1만" },
  { min: 10000, max: 50000, label: "1만~5만" },
  { min: 50000, max: Infinity, label: "5만 이상" },
];

/**
 * 신뢰도 점수 라벨
 */
export function getConfidenceLabel(score: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (score >= 0.95) {
    return {
      label: "매우 높음",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    };
  } else if (score >= 0.90) {
    return {
      label: "높음",
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    };
  } else if (score >= 0.85) {
    return {
      label: "보통",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
    };
  } else {
    return {
      label: "낮음",
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
    };
  }
}

/**
 * 숫자 포맷팅 (한글)
 */
export function formatNumber(num: number): string {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}만`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}천`;
  }
  return num.toString();
}

/**
 * 가격 포맷팅
 */
export function formatPrice(price: number): string {
  return `${(price / 10000).toFixed(0)}만원`;
}
