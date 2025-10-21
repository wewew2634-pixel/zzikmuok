# 🚀 ZZMUK 실시간 개발 워크플로우

**요약**: 개발 서버 띄워놓고 → 코드 수정 → Design Loop 자동 체크 → 문제 즉시 수정

---

## 📋 빠른 시작

### 1단계: 터미널 2개 준비

**터미널 1: 개발 서버**
```bash
cd zzik
npm run dev
```

출력 예시:
```
▲ Next.js 15.0.0
- Local:   http://localhost:3000
- Network: http://192.168.1.100:3000
```

**터미널 2: Design Loop 자동 감시**
```bash
cd zzik
npm run design:watch
```

출력 예시:
```
👀 ZZMUK Design Loop Watch 모드
────────────────────────────────────────────────────────
감시 중: src/, tests/
주기: 30초마다 또는 파일 변경 시
종료: Ctrl+C
────────────────────────────────────────────────────────

✅ src/ 감시 시작
✅ tests/ 감시 시작
⏳ 초기 Design Loop 실행 중...
```

### 2단계: 개발 시작!

이제 코드를 수정하면:
1. **파일 저장** → Next.js가 자동 새로고침
2. **5초 후** → Design Loop가 자동으로 체크 시작
3. **결과 확인** → 터미널 2에서 즉시 결과 표시

---

## 🎯 사용 시나리오

### 시나리오 A: 새 컴포넌트 개발

```bash
# 1. 개발 서버 + Watch 모드 시작
Terminal 1: npm run dev
Terminal 2: npm run design:watch

# 2. 컴포넌트 파일 생성
src/components/MatchCard.tsx

# 3. 코드 작성 후 저장
# → Watch가 자동으로 감지하여 체크 시작

# 4. 터미널 2에서 결과 확인
✅ 체크 완료
또는
⚠️  문제 발견됨
  - 접근성: 이미지에 alt 없음
  - DOM depth: 17/15 초과
```

### 시나리오 B: 기존 코드 수정

```bash
# 1. 수정 전 현재 상태 체크
npm run design:check

# 2. 코드 수정
# src/components/Button.tsx 수정

# 3. Watch가 자동 체크
# → 5초 대기 후 자동 실행

# 4. 문제 없으면 계속 개발
# 문제 있으면 바로 수정
```

### 시나리오 C: 특정 페이지만 체크

```bash
# 매칭 페이지만 체크
npm run design:check -- --url=http://localhost:3000/match

# 프로필 페이지만 체크
npm run design:check -- --url=http://localhost:3000/profile
```

---

## ⚡ 명령어 치트시트

### 개발 모드 (관대한 임계값)

```bash
# 빠른 체크
npm run design:check

# 디버그 모드
npm run design:check:debug

# 자동 감시 (30초 주기)
npm run design:watch

# 빠른 감시 (15초 주기)
npm run design:watch:fast
```

### 프로덕션 모드 (엄격한 임계값)

```bash
# PR 전 최종 체크
npm run design:check:prod

# Percy 포함 (PERCY_TOKEN 필요)
PERCY_TOKEN=your_token npm run test:visual
```

### 결과 확인

```bash
# Playwright HTML 리포트
npm run report:show

# Design Loop 통합 리포트 생성
npm run report:html
```

---

## 🔧 환경 설정

### 개발 모드 (.env.development)

```env
# 로컬 개발 서버
TEST_URL=http://localhost:3000

# Dry run (Percy 없이)
DRY_RUN=true

# 관대한 임계값
THRESHOLD_VISUAL_DIFF=0.10      # 10%
THRESHOLD_A11Y_SERIOUS=5        # 5개까지 허용
THRESHOLD_DOM_DEPTH=18          # 18 레벨
```

### 프로덕션 모드 (.env.production)

```env
# 로컬 개발 서버
TEST_URL=http://localhost:3000

# Percy 활성화
DRY_RUN=false
PERCY_TOKEN=${PERCY_TOKEN}

# 엄격한 임계값
THRESHOLD_VISUAL_DIFF=0.05      # 5%
THRESHOLD_A11Y_SERIOUS=0        # 0개 (허용 안함)
THRESHOLD_DOM_DEPTH=15          # 15 레벨
```

---

## 📊 Design Loop가 체크하는 것

### ✅ E2E 테스트 (Playwright)
- 페이지 로드 성공
- 주요 UI 요소 표시
- 버튼/링크 클릭 가능
- 폼 제출 작동

### ♿ 접근성 (Axe)
- WCAG 2.1 AA 준수
- alt 텍스트 존재
- 색상 대비율
- 키보드 네비게이션
- ARIA 속성

### 🎨 시각 회귀 (Percy - 프로덕션만)
- 이전 버전과 시각적 비교
- 의도하지 않은 UI 변경 감지
- 3개 뷰포트 (모바일, 태블릿, 데스크톱)

### ⚡ 성능
- DOM depth (복잡도)
- 페이지 로드 시간
- API 응답 시간 (별도 load:test)

---

## 🐛 문제 해결

### Watch가 파일 변경을 감지 안 함

```bash
# Node.js 버전 확인 (>=18 필요)
node --version

# Watch 재시작
Ctrl+C
npm run design:watch
```

### 체크가 너무 자주 실행됨

```bash
# 주기를 늘림 (60초)
node scripts/design-watch.mjs --interval=60

# 또는 수동 모드로 변경
npm run design:check  # 필요할 때만 실행
```

### Playwright 브라우저 없음

```bash
# Chromium 설치
npx playwright install chromium

# 모든 브라우저 설치
npx playwright install
```

### 테스트 결과가 이상함

```bash
# 디버그 모드로 실행
npm run design:check:debug

# 또는 UI 모드로 직접 확인
npm run test:e2e:ui
```

---

## 💡 실전 팁

### Tip 1: 변경사항 많을 때

```bash
# Watch 일시 정지하고 여러 파일 수정
Ctrl+C (Watch 종료)

# 수정 완료 후 한 번만 체크
npm run design:check

# 다시 Watch 시작
npm run design:watch
```

### Tip 2: 특정 테스트만 실행

```bash
# 홈페이지만
npx playwright test tests/e2e/01-homepage.spec.ts

# 매칭 플로우만
npx playwright test tests/e2e/02-matching-flow.spec.ts
```

### Tip 3: 결과 저장

```bash
# 날짜별로 저장
npm run design:check > logs/check-$(date +%Y%m%d-%H%M%S).log

# JSON 형식으로
npm run design:check --reporter=json > results.json
```

### Tip 4: VS Code 통합

`.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Design Loop Watch",
      "type": "shell",
      "command": "npm run design:watch",
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Design Loop Check",
      "type": "shell",
      "command": "npm run design:check",
      "problemMatcher": []
    }
  ]
}
```

사용: `Ctrl+Shift+P` → `Tasks: Run Task` → `Design Loop Watch`

---

## 🎯 워크플로우 예시

### 일반적인 개발 사이클

```
1. 개발 서버 시작
   └─ npm run dev

2. Watch 모드 시작
   └─ npm run design:watch

3. 코드 작성
   └─ src/components/NewComponent.tsx

4. 파일 저장
   └─ Ctrl+S

5. 자동 체크 시작 (5초 후)
   └─ 파일 변경 감지...
   └─ Design Loop 실행 중...

6. 결과 확인
   └─ ✅ 통과 → 계속 개발
   └─ ❌ 문제 → 즉시 수정

7. 반복
```

### PR 제출 전 체크

```bash
# 1. Watch 종료
Ctrl+C

# 2. 최종 엄격 체크
npm run design:check:prod

# 3. 통과하면 커밋
git add .
git commit -m "feat: new component"

# 4. PR 생성
git push
```

---

## 📞 도움말

### 명령어 헬프

```bash
# Design Check 옵션
node scripts/design-check.mjs --help

# 또는 소스 코드 확인
cat scripts/design-check.mjs
```

### 로그 확인

```bash
# Playwright 로그
cat playwright-report/results.json

# Design Loop 로그
cat test-results/*.log
```

### 커뮤니티

- Playwright 문서: https://playwright.dev
- Axe 문서: https://github.com/dequelabs/axe-core
- Percy 문서: https://docs.percy.io

---

## ✅ 체크리스트

개발 시작 전:
- [ ] `npm run dev` 실행 중
- [ ] `npm run design:watch` 실행 중
- [ ] 브라우저에서 http://localhost:3000 확인

코드 수정 중:
- [ ] 파일 저장할 때마다 Watch 로그 확인
- [ ] 문제 발견 시 즉시 수정
- [ ] 접근성 위반 0개 유지

PR 제출 전:
- [ ] `npm run design:check:prod` 통과
- [ ] 시각 회귀 확인 (Percy)
- [ ] Playwright 리포트 검토
- [ ] 접근성 점수 >95%

---

**행복한 개발 되세요!** 🚀

질문이나 문제가 있으면 언제든지 물어보세요!
