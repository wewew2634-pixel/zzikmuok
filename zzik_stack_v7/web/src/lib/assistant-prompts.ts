/**
 * ZZIK Assistant Prompt Templates
 * ================================
 * 
 * MCP Agent가 사용할 프롬프트 템플릿
 * - 미션 추천 요청
 * - SNS 인사이트 분석
 * - 전략 조언
 */

export interface PromptSuggestion {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: "mission" | "insight" | "strategy" | "general";
  icon: string;
}

export const promptSuggestions: PromptSuggestion[] = [
  {
    id: "suggest-missions",
    title: "미션 추천 요청",
    description: "내 프로필에 맞는 미션을 추천받습니다",
    prompt:
      "내 SNS 계정 정보를 바탕으로 가장 적합한 미션 3개를 추천해주세요. 각 미션의 매칭 이유와 예상 수익도 함께 알려주세요.",
    category: "mission",
    icon: "🎯",
  },
  {
    id: "analyze-reach",
    title: "도달률 분석",
    description: "3km 반경 도달률이 왜 변화했는지 분석합니다",
    prompt:
      "최근 30일간 내 3km 반경 도달률 변화를 분석하고, 개선 방향을 제안해주세요.",
    category: "insight",
    icon: "📊",
  },
  {
    id: "engagement-tips",
    title: "참여율 높이는 법",
    description: "좋아요와 댓글을 늘리는 전략을 제시합니다",
    prompt:
      "내 콘텐츠의 참여율을 높이기 위한 구체적인 실행 방안 5가지를 알려주세요.",
    category: "strategy",
    icon: "💡",
  },
  {
    id: "content-ideas",
    title: "콘텐츠 아이디어",
    description: "내 전문 카테고리에 맞는 콘텐츠를 제안합니다",
    prompt:
      "내가 강점을 가진 카테고리(음식, 카페)에서 다음 주 촬영할 콘텐츠 아이디어 3가지를 추천해주세요.",
    category: "strategy",
    icon: "💭",
  },
  {
    id: "revenue-forecast",
    title: "수익 예측",
    description: "다음 달 예상 수익과 목표 달성 전략을 알려줍니다",
    prompt:
      "이번 달 수익 데이터를 바탕으로 다음 달 예상 수익과 500만원 달성을 위한 로드맵을 제시해주세요.",
    category: "insight",
    icon: "💰",
  },
  {
    id: "competitor-analysis",
    title: "경쟁 분석",
    description: "같은 지역의 크리에이터 트렌드를 분석합니다",
    prompt:
      "강남구 3km 내 비슷한 팔로워 수를 가진 크리에이터들의 평균 성과와 내 위치를 비교 분석해주세요.",
    category: "insight",
    icon: "🔍",
  },
  {
    id: "optimal-posting-time",
    title: "최적 포스팅 시간",
    description: "참여율이 가장 높은 시간대를 분석합니다",
    prompt:
      "내 팔로워들이 가장 활발하게 반응하는 요일과 시간대를 분석하고, 최적의 포스팅 스케줄을 제안해주세요.",
    category: "strategy",
    icon: "⏰",
  },
  {
    id: "mission-negotiation",
    title: "미션 협상 전략",
    description: "더 나은 조건으로 미션을 협상하는 방법을 알려줍니다",
    prompt:
      "내 도달률과 참여율을 근거로 미션 단가를 협상할 때 사용할 수 있는 구체적인 논리와 자료를 정리해주세요.",
    category: "strategy",
    icon: "🤝",
  },
];

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export function getCategorySuggestions(
  category: PromptSuggestion["category"]
): PromptSuggestion[] {
  return promptSuggestions.filter((p) => p.category === category);
}

export function getSuggestionById(id: string): PromptSuggestion | undefined {
  return promptSuggestions.find((p) => p.id === id);
}

// Mock 스트리밍 응답 시뮬레이션
export async function* streamMockResponse(prompt: string): AsyncGenerator<string> {
  const responses: Record<string, string[]> = {
    "미션 추천": [
      "분석 중입니다...\n\n",
      "**추천 미션 #1: 강남 신규 디저트 카페 오픈 홍보**\n",
      "- 예상 수익: ₩350,000\n",
      "- 매칭 이유: 카페 카테고리 강점(평균 조회수 13,800), 3km 도달 3,600명\n",
      "- 촬영 예상 소요: 2시간\n\n",
      "**추천 미션 #2: 역삼동 맛집 신메뉴 리뷰**\n",
      "- 예상 수익: ₩280,000\n",
      "- 매칭 이유: 음식 카테고리 1위(평균 조회수 15,200), 높은 참여율 5.2%\n",
      "- 촬영 예상 소요: 1.5시간\n\n",
      "**추천 미션 #3: 청담동 브런치 스팟 소개**\n",
      "- 예상 수익: ₩320,000\n",
      "- 매칭 이유: 고급 식음료 콘텐츠 강점, 타겟층 일치도 94%\n",
      "- 촬영 예상 소요: 2.5시간\n\n",
      "위 3개 미션을 모두 완료 시 **총 ₩950,000 수익 예상**입니다.",
    ],
    "도달률": [
      "최근 30일 데이터를 분석했습니다.\n\n",
      "**주요 발견사항:**\n",
      "1. 평균 도달률: 2,890명 (전월 대비 +23.5% 증가)\n",
      "2. 최고 도달일: 12/30 (3,600명)\n",
      "3. 최저 도달일: 12/01 (2,100명)\n\n",
      "**증가 요인:**\n",
      "- 음식 카테고리 콘텐츠 비중 증가 (8개 → 전체의 32%)\n",
      "- 해시태그 전략 개선 (#강남맛집 사용 빈도 증가)\n",
      "- 릴스 길이 최적화 (15~30초 구간에서 완주율 70%)\n\n",
      "**개선 제안:**\n",
      "1. 주말 오후 2-4시 포스팅 시 도달률 +18% 향상 가능\n",
      "2. 로케이션 태그 일관성 유지 (강남구 태그 필수)\n",
      "3. 썸네일 첫 3초에 음식 클로즈업 포함 시 조회수 +25%",
    ],
  };

  // 키워드 매칭으로 적절한 응답 선택
  let response = responses["미션 추천"]; // 기본값
  for (const [keyword, text] of Object.entries(responses)) {
    if (prompt.includes(keyword)) {
      response = text;
      break;
    }
  }

  // 문장 단위로 천천히 스트리밍
  for (const chunk of response) {
    yield chunk;
    await new Promise((resolve) => setTimeout(resolve, 30)); // 30ms 딜레이
  }
}
