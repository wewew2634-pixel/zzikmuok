# 🚀 ZZMUK Integrated - 빠른 시작 가이드

## 1분 안에 실행하기

### 필수 준비물
- Node.js 18.17+ 설치 확인: `node --version`
- OpenAI API 키 ([발급 링크](https://platform.openai.com/api-keys))

---

## Step 1: 환경 변수 설정 (30초)

```bash
# .env.local 파일 생성
echo "OPENAI_API_KEY=sk-proj-your-key-here" > .env.local
```

> **중요**: `sk-proj-your-key-here`를 실제 OpenAI API 키로 교체하세요.

---

## Step 2: 의존성 설치 (15초)

```bash
npm install
```

---

## Step 3: 개발 서버 실행 (5초)

```bash
npm run dev
```

---

## Step 4: 브라우저 열기 (5초)

http://localhost:3000 접속

---

## ✅ 성공 확인

다음이 보이면 성공입니다:
1. **랜딩 페이지**: Hero 섹션, Features, Showcase, CTA
2. **채팅 섹션**: "안녕하세요! ZZMUK 챗봇입니다" 메시지
3. **스트리밍 응답**: 메시지 입력 후 토큰 단위 응답

---

## 🐛 문제 해결

### "API key not configured"
→ `.env.local` 파일 확인 후 서버 재시작

### "Module not found"
→ `npm install` 다시 실행

### 채팅 응답 없음
→ 브라우저 콘솔(F12) 확인 후 에러 메시지 확인

---

## 📦 프로덕션 빌드

```bash
# 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

---

## 🌐 Vercel 배포 (1분)

1. GitHub에 푸시
2. [Vercel](https://vercel.com) 로그인
3. "Import Project" 클릭
4. 환경 변수 추가: `OPENAI_API_KEY`
5. Deploy 클릭

---

## 📚 추가 문서

- **전체 문서**: [README.md](./README.md)
- **체크리스트**: [CHECKLIST.md](./CHECKLIST.md)
- **개선 사항**: [IMPROVEMENTS.md](./IMPROVEMENTS.md)

---

**Happy Coding! 🎉**
