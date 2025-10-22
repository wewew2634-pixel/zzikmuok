# ZZMUK (쩍목) - 로컬 숏폼 즉시 매칭 플랫폼

## 🎯 개요

**ZZMUK**은 3km 반경 내 로컬 숏폼 크리에이터와 상점을 즉시 매칭하고 **T+0 정산**을 지원하는 O2O 인플루언서 마케팅 플랫폼입니다.

### 핵심 차별화
- **3km 반경** - PostGIS 기반 지리적 매칭
- **T+0 정산** - Stripe Connect 즉시 정산
- **Design Loop** - Percy + Axe + Playwright 자동 품질 검증
- **4-Agent 시스템** - Tech, Revenue, Biz, Optimize 병렬 실행

---

## 🏗️ 프로젝트 구조

```
zzik/
├── src/               # Next.js App Router
│   ├── app/          # 페이지 & API 라우트
│   ├── components/   # React 컴포넌트
│   ├── lib/          # 비즈니스 로직
│   └── styles/       # 디자인 시스템
├── scripts/          # 자동화 스크립트
│   ├── extract_texts.sh        # 텍스트 감사 (UX 용어 검증)
│   ├── design-watch.mjs        # 실시간 Design Loop
│   └── setup-*.ts              # API 연동 설정
├── tests/            # E2E + 접근성 + 시각적 회귀 테스트
├── docs/             # 프로젝트 문서
│   ├── api/          # API 연동 가이드
│   ├── setup/        # 환경 설정
│   ├── design/       # 디자인 시스템
│   └── archived/     # 보관된 문서
├── .env.development  # 개발 환경 (관대한 임계값)
├── .env.production   # 프로덕션 환경 (엄격한 품질 게이트)
└── REALTIME_WORKFLOW.md  # 실시간 개발 워크플로우 가이드
```

---

## 🚀 빠른 시작

### 1. 환경 설정

```bash
# 환경 변수 복사
cp .env.local.example .env.local

# 필수 API 키 설정
# - OPENAI_API_KEY
# - DATABASE_URL (PostgreSQL + PostGIS)
# - STRIPE_SECRET_KEY
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저: http://localhost:3000

---

## 🎨 디자인 시스템

### 스타일 가이드
- **100% Tailwind CSS** - 커스텀 CSS 0개
- **Glass UI** - backdrop-blur + 미세 섀도우
- **Line-first** - 헤어라인으로 정보 구획
- **다크/라이트 모드** - CSS Variables 기반

### 접근성 (WCAG 2.1 AA)
- ✅ 키보드 네비게이션
- ✅ 스크린 리더 호환
- ✅ 대비율 ≥4.5:1
- ✅ 의미론적 HTML

상세: [`docs/design/`](./docs/design/)

---

## 🤖 자동화 스크립트

### 텍스트 감사 (UX 용어 검증)

사용자 노출 텍스트에서 금지어/길이 규칙 검증:

```bash
cd zzik
bash scripts/run_text_audit.sh
```

**출력물:**
- `audit/user_texts.csv` - 추출된 텍스트 목록 (953개)
- `audit/banned_words.csv` - 금지어 발견 위치
- `audit/length_violations.csv` - 길이 규칙 위반
- `audit/replacements.csv` - 권장어 치환 제안

**금지어 규칙:**
- 지오펜스 → 동네 반경 알림
- 쿠폰 → 체험권
- 레코멘더 → 내 근처 지금

**길이 규칙:**
- 알림: ≤20자
- 버튼: ≤3어절

### Design Loop (실시간 품질 검증)

파일 변경 시 자동으로 E2E + 접근성 + 시각적 회귀 테스트 실행:

```bash
npm run design:watch
```

**품질 게이트:**
- Accessibility: >95% (Axe)
- Visual Diff: <5% (Percy)
- E2E Pass Rate: 100% (Playwright)

상세: [`REALTIME_WORKFLOW.md`](./REALTIME_WORKFLOW.md)

---

## 📊 기술 스택

### 프론트엔드
- **Next.js 15** (App Router + React 19)
- **Tailwind CSS v4** (PostCSS)
- **Motion** (애니메이션)
- **Headless UI** (접근 가능한 컴포넌트)

### 백엔드
- **PostgreSQL + PostGIS** (지리적 쿼리)
- **Prisma** (ORM)
- **Stripe Connect** (T+0 정산)
- **OpenAI API** (AI 챗봇)

### 인프라
- **Vercel** (Edge Runtime)
- **GitHub Actions** (CI/CD)
- **Percy** (시각적 회귀 테스트)

---

## 🧪 테스트

### E2E 테스트

```bash
npm run test:e2e
```

### 접근성 검사

```bash
npm run test:a11y
```

### 시각적 회귀 테스트

```bash
PERCY_TOKEN=xxx npm run test:percy
```

### 전체 Design Loop

```bash
npm run design:check
```

---

## 📖 문서

### API 연동
- [API 연동 가이드](./docs/api/API_INTEGRATION_GUIDE.md)
- [API 연동 완료 보고서](./docs/api/API_INTEGRATION_COMPLETE.md)

### 환경 설정
- [환경 변수 설정 가이드](./docs/setup/ENV_SETUP_GUIDE.md)
- [빠른 시작](./docs/setup/QUICKSTART.md)

### 디자인 시스템
- [Tailwind 전략](./docs/design/TAILWIND_PURE_STRATEGY.md)
- [색상 시스템](./docs/design/COLOR_SYSTEM_FIX.md)
- [로고 분석](./docs/design/LOGO_ANALYSIS.md)
- [Linear 2025 디자인](./docs/design/LINEAR_2025_DESIGN_ANALYSIS.md)

### 보관된 문서
기술 결정 기록 및 마이그레이션 가이드: [`docs/archived/`](./docs/archived/)

---

## 🎯 성능 목표

### Lighthouse 스코어
- Performance: ≥90
- Accessibility: ≥95
- SEO: ≥90
- Best Practices: ≥90

### Core Web Vitals
- **LCP** (Largest Contentful Paint): <2.5s
- **INP** (Interaction to Next Paint): <200ms
- **CLS** (Cumulative Layout Shift): <0.1

### 매칭 엔진
- **P95 응답 시간**: <200ms (PostGIS 공간 인덱스)
- **동시 사용자**: 10,000명

---

## 🔧 개발 워크플로우

### 1. 기능 개발

```bash
# 브랜치 생성
git checkout -b feature/your-feature

# 파일 변경 시 자동 검증
npm run design:watch

# 수동 검증
npm run design:check
```

### 2. 커밋 & 푸시

```bash
git add .
git commit -m "feat: add feature"
git push origin feature/your-feature
```

### 3. Pull Request

GitHub Actions가 자동으로:
- E2E 테스트 실행
- 접근성 검사
- 시각적 회귀 테스트
- 빌드 검증

---

## 💰 비용 추정 (2024년 기준)

### API 비용
- **OpenAI (gpt-4o-mini)**: $0.0002/대화 → $60/월 (1,000명 × 10대화/일)
- **Stripe Connect**: 1.5% + ₩30/거래

### 인프라 비용
- **Vercel Pro**: $20/월
- **PostgreSQL (Supabase)**: $25/월
- **Percy**: $149/월

**총계**: ~$254/월

---

## 📝 라이선스

MIT License

---

## 🤝 기여

Pull Request 환영합니다!

1. Fork this repository
2. Create feature branch
3. Commit your changes
4. Push to branch
5. Open Pull Request

---

**Built with ❤️ using Next.js 15 + Tailwind CSS v4 + PostGIS + Stripe**
