# 🎯 ZZIK v7 통합 계획서

**프로젝트**: ZZIK (구 ZZMUK) - 로컬 크리에이터 매칭 플랫폼  
**버전**: v7 - "찍먹(가볍게 시작)" 에디션  
**목표**: 노이즈 최소 크리에이터 DB + MCP + LangGraph/CrewAI 에이전트 통합  
**날짜**: 2025-10-18

---

## 🧬 핵심 이해: ZZIK = ZZMUK (같은 서비스)

**ZZIK**은 로컬 크리에이터와 상점을 3km 반경 내에서 즉시 매칭하는 플랫폼입니다.

### 기존 ZZMUK 기반
- ✅ Next.js 15 + React 19 + Tailwind v4
- ✅ OpenAI 채팅 시스템 (SSE 스트리밍)
- ✅ SNS 로그인 (Facebook/Instagram/TikTok)
- ✅ Prisma DB (User/Account/Session)
- ✅ Stripe 결제 + SendGrid 이메일
- ✅ Linear 2025 디자인 시스템

### v7 추가 레이어 (오버레이 방식)
```
/home/user/webapp/zzik/
├── src/                    # 기존 Next.js 앱
│   ├── app/                # App Router (랜딩 + 채팅)
│   ├── components/         # React 컴포넌트
│   ├── lib/                # API 클라이언트
│   └── styles/             # Tailwind v4 토큰
├── mcp/                    # 🆕 MCP 서버 (fs/http/sqlite)
├── agents/                 # 🆕 LangGraph + CrewAI 파이프라인
│   ├── workflows/          # 상태 머신 정의
│   ├── prompts/            # 에이전트 프롬프트
│   └── validation/         # 품질 검증 로직
├── data/                   # 🆕 데이터 레이어
│   ├── geojson/            # 행정구역 GeoJSON
│   ├── commercial/         # 상권 데이터
│   ├── golden_set/         # 골든셋 (300 샘플)
│   └── checkpoints/        # LangGraph 체크포인트
├── ops/                    # 🆕 운영 레이어
│   ├── runbooks/           # 운영 가이드
│   └── scripts/            # 자동화 스크립트
└── prisma/                 # 기존 DB (확장)
```

---

## 🎯 v7 목표 (12주 → 찍먹 버전: 4주)

### 성공 지표
- **정확도**: Location F1 ≥ 0.92, Category mAP ≥ 0.85, Spam AUROC ≥ 0.95
- **유지율**: 3개월 Cohort ≥ 90% / 불만족률 ≤ 10%
- **처리시간**: 신규 크리에이터 분석 < 10분(수집 포함)
- **비용**: GPT API 비용 $0 (ChatGPT Pro/Dev Mode만 사용)

### 설계 원칙
1. **Evidence-first**: 수집(증거)과 판정을 엄격 분리
2. **Abstain & HITL**: 불확실(임계 미달)은 보류→휴먼 검수
3. **버저닝**: 증거/판정/프롬프트/그래프/임계 모두 버전 관리
4. **READ 우선**: WRITE/Exec는 diff 미리보기→승인 후

---

## 📦 4주 찍먹(MVP) 로드맵

### Week 1: MCP + 데이터 기반 구축
**목표**: ChatGPT Dev Mode 연결 + 기본 데이터 적재

#### Day 1-2: MCP 서버 구축
- [ ] `mcp/server.js` - JSON-RPC 2.0 서버 (fs/http/sqlite)
- [ ] `fs_read(path)` - 파일 읽기 (루트 밖 차단)
- [ ] `http_get(url)` - HTTP 요청 (화이트리스트)
- [ ] `sqlite_query(db, sql)` - SQLite 쿼리 (READ only)
- [ ] ngrok/cloudflared로 Dev Mode 커넥터 등록

#### Day 3-4: 데이터 적재
- [ ] `data/geojson/` - 서울시 행정구역 (시/구/동) GeoJSON
- [ ] `data/commercial/` - 주요 상권 데이터 (강남/홍대/이태원 등)
- [ ] `data/checkpoints/db.sqlite` - LangGraph 체크포인트 DB 초기화
- [ ] 좌표→행정구역 판별 함수 테스트

#### Day 5: 통합 테스트
- [ ] ChatGPT Dev Mode → MCP 호출 → 파일/HTTP/DB 접근 확인
- [ ] 에러 핸들링 (루트 밖 접근, HTTP 타임아웃 등)

---

### Week 2: LangGraph 파이프라인 구축
**목표**: 수집→분석→검증→승인 워크플로 e2e

#### Day 1-2: LangGraph 상태 머신
- [ ] `agents/workflows/creator_verification.py`
  - HARVEST → LOC_ANALYZE → CAT_ANALYZE → SPAM_ANALYZE → VALIDATE
  - 각 노드마다 체크포인트 저장 (재시작 지원)
- [ ] `agents/workflows/state.py` - Pydantic 상태 모델
  - Location, Category, SpamScore, Decision 스키마

#### Day 3-4: 에이전트 프롬프트
- [ ] `agents/prompts/harvester.txt` - "판정 금지, 증거만 수집"
- [ ] `agents/prompts/location_agent.txt` - "adm2 다수결, conf≥0.85"
- [ ] `agents/prompts/category_agent.txt` - "이미지×텍스트 합치만 확정"
- [ ] `agents/prompts/spam_agent.txt` - "수치 판정, LLM은 설명만"
- [ ] `agents/prompts/validation_agent.txt` - "모순/임계 점검"

#### Day 5: 데모 30 샘플
- [ ] 가짜 크리에이터 30명 JSON 생성
- [ ] 파이프라인 실행 → 승인/보류 결과 확인
- [ ] 로그/근거/신뢰도 라벨 검증

---

### Week 3: 품질 시스템 + HITL
**목표**: 골든셋 100 + 품질 게이트 + 휴먼 큐

#### Day 1-2: 골든셋 생성
- [ ] `data/golden_set/v1.json` - 100 샘플 (상권 균형)
  - 강남(20) / 홍대(20) / 이태원(15) / 기타(45)
  - 카테고리 균형: 음식(40) / 뷰티(25) / 패션(20) / 기타(15)
- [ ] 라벨링 매뉴얼 작성
- [ ] GT 라벨: adm2, categories[], is_spam

#### Day 3-4: 품질 게이트
- [ ] `agents/validation/metrics.py`
  - Location F1 계산 (confusion matrix)
  - Category mAP (multi-label precision/recall)
  - Spam AUROC (ROC curve)
- [ ] 자동 회귀 테스트 (골든셋 100)
- [ ] 임계: Loc F1≥0.90, Cat mAP≥0.83, Spam AUROC≥0.93

#### Day 5: HITL 큐
- [ ] `data/checkpoints/hitl_queue.json` - 보류 큐
- [ ] 보류 사유: 임계 미달 / 모순 / 중요 상권
- [ ] 체크리스트: 플래그별 관찰 포인트 (24h SLA)

---

### Week 4: 웹 UI + 운영 리포트
**목표**: Linear 톤 유지 + 운영 대시보드 추가

#### Day 1-2: 운영 리포트 (정적)
- [ ] `src/app/dashboard/page.tsx` - 운영 대시보드
  - KPI 카드: Loc F1 / Cat mAP / Spam AUROC
  - 추세 그래프: 주간 정확도 변화
  - 보류율 / 오류율 / 처리 시간
- [ ] 상권별 / 카테고리별 분해 (정적 테이블)

#### Day 3-4: 품질 리포트 템플릿
- [ ] `ops/runbooks/quality_report_template.md`
  - 골든셋 결과 요약
  - 실패 케이스 분석
  - 임계 조정 권고
- [ ] 드리프트 알람 룰 설계 (불일치율↑ / abstain율↑)

#### Day 5: 배포 + 문서
- [ ] README 업데이트 (v7 레이어 설명)
- [ ] Git 커밋 + PR 생성
- [ ] 로컬 테스트: `npm run dev` + MCP 서버 동시 실행

---

## 🛠️ 기술 스택 확장

### 기존 (ZZMUK)
- Next.js 15, React 19, Tailwind v4
- OpenAI API, Prisma, Stripe, SendGrid

### 추가 (v7)
- **MCP 서버**: Node.js (단일 파일)
- **Agents**: Python 3.11, LangGraph, CrewAI
- **데이터**: GeoJSON, SQLite, JSON
- **품질**: Pandas, Scikit-learn, Matplotlib

---

## 📊 데이터 흐름 (찍먹 버전)

```
사용자 (ChatGPT Pro) 
  ↓
  "이 크리에이터 검증해줘: @qetta_t"
  ↓
ChatGPT Dev Mode → MCP 도구 호출
  ↓
  fs_read("data/commercial/gangnam.json")  # 상권 데이터
  http_get("instagram.com/qetta_t")        # SNS 프로필
  sqlite_query("SELECT * FROM checkpoints") # 이전 상태
  ↓
Agents 파이프라인 (Python)
  ↓
  HARVEST: 증거 수집 (위치/카테고리/활동) → 체크포인트 저장
  LOC_ANALYZE: 좌표→adm2, 다수결, conf≥0.85?
  CAT_ANALYZE: 이미지×텍스트 합치, agreement==true?
  SPAM_ANALYZE: 참여율/급등도 계산, is_spam==false?
  VALIDATE: 모순/임계 점검 → 승인 or 보류
  ↓
결과 (JSON)
  {
    "approved": true,
    "confidence": 0.91,
    "location": {"adm2": "강남구", "conf": 0.88},
    "category": {"labels": ["음식": 0.92], "agreement": true},
    "spam_score": {"is_spam": false, "prob": 0.08},
    "reasoning": "다수결 일치, 이미지×텍스트 합치, 정상 활동 패턴"
  }
  ↓
웹 UI (Next.js)
  ↓
  대시보드: KPI/추세/보류율 표시 (정적)
  승인된 크리에이터 → DB 저장 → 매칭 가능
```

---

## 🔐 보안 원칙 (찍먹 버전)

### MCP 서버
- ✅ 루트 밖 파일 접근 차단 (`safePath()`)
- ✅ HTTP 화이트리스트 (instagram.com, kakao.com만)
- ✅ 응답 크기 제한 (MAX_TEXT: 10MB)
- ✅ WRITE는 승인 모달 (찍먹 버전은 READ only)

### Agents
- ✅ 프롬프트 injection 방지 (템플릿 고정)
- ✅ 체크포인트 암호화 (선택사항)
- ✅ 로그: Request-Id, 호출/결정/근거 기록

---

## 💰 비용 (찍먹 버전)

### 개발 비용
- **시간**: 4주 (1인 풀타임 가정)
- **비용**: $0 (오픈소스 + ChatGPT Pro 기존 구독)

### 운영 비용 (월)
- **Vercel**: $0 (Hobby)
- **ChatGPT Pro**: $20 (기존 구독)
- **MCP 서버**: $0 (로컬 or 무료 호스팅)
- **DB**: $0 (SQLite)
- **합계**: **$20/월** (추가 비용 없음)

---

## 📈 마일스톤

### Sprint 1 (Week 1) ✅ 목표
- [ ] MCP 서버 동작 (ChatGPT Dev Mode 연결)
- [ ] GeoJSON 행정구역 데이터 적재
- [ ] 상권 데이터 (강남/홍대/이태원) 준비

### Sprint 2 (Week 2) ✅ 목표
- [ ] LangGraph 파이프라인 e2e 데모 (30 샘플)
- [ ] 5개 에이전트 프롬프트 완성
- [ ] 체크포인트 저장/복원 동작 확인

### Sprint 3 (Week 3) ✅ 목표
- [ ] 골든셋 100 완성
- [ ] 품질 게이트 통과 (Loc F1≥0.90)
- [ ] HITL 큐 동작 확인

### Sprint 4 (Week 4) ✅ 목표
- [ ] 운영 대시보드 정적 버전 완성
- [ ] 문서 업데이트 (README + RUNBOOKS)
- [ ] Git 커밋 + PR 생성

---

## 🚀 즉시 시작 (오늘)

### Step 1: MCP 서버 골격 생성
```bash
cd /home/user/webapp/zzik/mcp
npm init -y
npm install express body-parser sqlite3
```

### Step 2: 데이터 디렉토리 준비
```bash
cd /home/user/webapp/zzik/data
# GeoJSON 다운로드 (서울시 행정구역)
# 상권 데이터 수집 (Kakao Local API 등)
```

### Step 3: Agents 환경 설정
```bash
cd /home/user/webapp/zzik/agents
python3 -m venv .venv
source .venv/bin/activate
pip install langgraph crewai pydantic pandas scikit-learn
```

### Step 4: 첫 테스트
```bash
# MCP 서버 시작
cd /home/user/webapp/zzik/mcp && node server.js

# Agents 데모
cd /home/user/webapp/zzik/agents && python -c "from workflows import demo; demo()"
```

---

## 📚 핵심 문서

### 기존 (ZZMUK)
- `README.md` - 메인 문서
- `API_INTEGRATION_GUIDE.md` - API 사용법
- `SNS_로그인_DB_전략.md` - DB 설계

### 추가 (v7)
- `ZZIK_V7_INTEGRATION_PLAN.md` - 이 문서
- `mcp/README.md` - MCP 서버 명세
- `agents/README.md` - 에이전트 가이드
- `ops/runbooks/` - 운영 가이드

---

## 🎉 최종 목표

**4주 후 달성 상태**:
- ✅ ChatGPT Dev Mode → MCP → Agents 파이프라인 동작
- ✅ 골든셋 100 기준 품질 게이트 통과 (Loc F1≥0.90)
- ✅ 운영 대시보드 (정적) 배포
- ✅ HITL 큐 동작 (보류율 < 15%)
- ✅ 문서화 완료 (README + 3개 RUNBOOKS)

**"찍먹"에서 "정식 론칭"으로 가는 길**:
- Week 5-8: 골든셋 300 확장 + 품질 게이트 강화 (F1≥0.92)
- Week 9-12: 드리프트 알람 + 자동화 + 프로덕션 배포

---

**🚀 지금 바로 시작합니다!**
