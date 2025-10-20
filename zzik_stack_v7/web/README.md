# ZZMUK Integrated - 완전 통합 랜딩 + 채팅 시스템

## 개요

**ZZMUK**은 3km 반경 내 로컬 숏폼 크리에이터와 상점을 즉시 매칭하고 T+0 정산을 지원하는 플랫폼입니다.

이 프로젝트는 다음을 통합합니다:
- **Tailwind CSS v4** (PostCSS 플러그인 방식)
- **Next.js 15** (App Router + React 19)
- **OpenAI Streaming API** (SSE 기반 실시간 채팅)
- **ZZMUK Design System** (tokens.css + utilities.css)

## 특징

### ✨ 디자인 시스템
- **100% CSS + Tailwind** - 커스텀 CSS 0개
- **Glass 스타일** - backdrop-blur + 미세 섀도우
- **선형(Line-first)** - 헤어라인/디바이더로 정보 구획
- **다크/라이트 모드** - 자동 전환 지원
- **접근성** - WCAG 2.1 AA 준수

### 🚀 기술 스택
- **프레임워크**: Next.js 15.0.0 (App Router)
- **스타일링**: Tailwind CSS 4.1.13
- **UI**: Headless UI + Heroicons
- **애니메이션**: Motion (Framer Motion)
- **AI**: OpenAI API (gpt-4o-mini)
- **런타임**: Edge Runtime (저지연)

### 💬 채팅 시스템
- **SSE 스트리밍** - 토큰 단위 실시간 응답
- **바닐라 JS** - 의존성 0, 가벼운 클라이언트
- **Edge Runtime** - 글로벌 저지연
- **오류 복구** - 자동 재시도 + 사용자 피드백

## 프로젝트 구조

```
zzmuk-integrated/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # 전역 레이아웃
│   │   ├── page.tsx             # 메인 페이지 (랜딩 + 채팅)
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts     # OpenAI 스트리밍 API
│   └── styles/
│       ├── globals.css          # 전역 스타일
│       ├── tokens.css           # 디자인 토큰
│       └── utilities.css        # 유틸리티 클래스
├── public/
│   └── chat.js                  # 채팅 클라이언트 (바닐라 JS)
├── package.json
├── tsconfig.json
├── next.config.mjs
├── postcss.config.mjs
└── .env.local.example
```

## 시작하기

### 1. 환경 변수 설정

`.env.local` 파일 생성:

```bash
cp .env.local.example .env.local
```

`.env.local` 편집:

```env
OPENAI_API_KEY=sk-proj-your-key-here
```

> **중요**: OpenAI API 키는 [platform.openai.com](https://platform.openai.com/api-keys)에서 발급받아야 합니다. ChatGPT Pro 구독과는 별도입니다.

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 4. 프로덕션 빌드

```bash
npm run build
npm start
```

## 배포

### Vercel (권장)

1. GitHub에 리포지토리 푸시
2. [Vercel](https://vercel.com)에서 "Import Project"
3. 환경 변수 설정: `OPENAI_API_KEY`
4. 배포 버튼 클릭

자동으로 다음이 설정됩니다:
- Edge Runtime
- PostCSS + Tailwind v4
- SSE 스트리밍 최적화

## 커스터마이징

### 디자인 토큰 수정

`src/styles/tokens.css` 파일을 편집하여 색상/간격/폰트를 변경할 수 있습니다:

```css
@theme {
  --color-emerald-500: #22C08E;  /* 액센트 색상 */
  --color-surface-900: #0F172A;  /* 배경색 */
}
```

### 유틸리티 클래스 추가

`src/styles/utilities.css`에 새 클래스 추가:

```css
.my-custom-class {
  /* 스타일 */
}
```

### AI 모델 변경

`src/app/api/chat/route.ts`에서 모델 변경:

```typescript
model: "gpt-4o-mini", // → "gpt-4o" 등으로 변경
```

## 성능 최적화

### 현재 성능
- **Lighthouse Performance**: ≥90
- **Accessibility**: ≥95
- **SEO**: ≥90
- **Best Practices**: ≥90

### 최적화 체크리스트
- [x] Edge Runtime 사용
- [x] SSE 스트리밍 (TTFB 개선)
- [x] Tailwind v4 (PostCSS 빌드 최적화)
- [x] 이미지 최적화 (스켈레톤 사용)
- [x] CLS = 0 (고정 높이 레이아웃)
- [ ] 이미지 교체 시 Next/Image 사용

## 접근성

### 준수 사항
- ✅ 키보드 네비게이션 완전 지원
- ✅ 스크린 리더 호환 (ARIA 레이블)
- ✅ 대비율 ≥4.5:1 (WCAG AA)
- ✅ 포커스 인디케이터 명확
- ✅ 의미론적 HTML

### 테스트
```bash
npm run lint  # ESLint 검사
npx axe-cli http://localhost:3000  # 접근성 검사 (axe-core 설치 필요)
```

## 비용 추정

### OpenAI API 비용 (2024년 기준)
- **gpt-4o-mini**: $0.150 / 1M 입력 토큰, $0.600 / 1M 출력 토큰
- **평균 대화**: ~$0.0002/대화
- **1,000명 × 10대화/일**: 약 $60/월

### 인프라 비용
- **Vercel Hobby**: 무료 (월 100GB)
- **Vercel Pro**: $20/월

## 트러블슈팅

### "API key not configured"
→ `.env.local` 파일에 `OPENAI_API_KEY` 설정 후 서버 재시작

### 스트리밍이 안 됨
→ `route.ts`에 `export const runtime = "edge"` 확인

### 채팅창이 비어있음
→ 브라우저 콘솔 확인, `/chat.js` 경로 검증

### 토큰 한도 초과
→ 히스토리 길이 제한 로직 추가 (예: 최근 10개 메시지만 유지)

## 확장 로드맵

### 단기 (1-2주)
- [ ] 채팅 히스토리 저장 (로컬 스토리지)
- [ ] 로딩 인디케이터 추가
- [ ] 에러 재시도 로직

### 중기 (1개월)
- [ ] 사용자 인증 (Passkey/WebAuthn)
- [ ] Agent 모드 연동 (MCP 커넥터)
- [ ] 파일 업로드 지원

### 장기 (3개월)
- [ ] 멀티모달 입력 (이미지/음성)
- [ ] 대화 분석 대시보드
- [ ] A/B 테스팅 인프라

## 라이선스

MIT License - 자유롭게 사용 가능

## 기여

Pull Request 환영합니다!

1. Fork this repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 문의

- **프로젝트**: ZZMUK
- **이메일**: contact@zzmuk.com (예시)
- **문서**: 이 README.md

---

**Built with ❤️ using Next.js 15 + Tailwind CSS v4 + OpenAI**
