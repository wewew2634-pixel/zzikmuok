# ZZIK Stack v7 (prod)

경량 아닌 즉시 배포 가능한 풀스택 모노레포 템플릿입니다. Next.js 15 웹 프론트, Node 기반 MCP 서버, 옵션 Python Agents, 그리고 Caddy 리버스 프록시가 포함됩니다. 비용 0 모드(Developer Mode + MCP)와 표준 에이전트 모드를 토글로 지원합니다.

```
zzik_stack_v7/
├── web/                     # Next.js 15 (App Router)
│   ├── Dockerfile           # 프로덕션 이미지
│   ├── public/health.txt    # 헬스체크 엔드포인트
│   └── app/(marketing)/…    # 랜딩/온보딩/미션 UX
├── mcp/                     # MCP 서버 (Node JSON-RPC)
│   ├── Dockerfile
│   ├── server.mjs           # fs/http/sqlite 툴 + 보안 가드
│   └── CORS.mjs             # CORS & Basic Auth 헬퍼
├── agents/                  # 선택: LangGraph/CrewAI 에이전트
│   ├── Dockerfile
│   ├── workflow.py
│   └── requirements.txt
├── ops/                     # 운영 및 배포 스크립트
│   ├── docker-compose.prod.yml
│   ├── Caddyfile            # TLS/리버스 프록시/보안 헤더
│   ├── env.example          # 공통 환경 변수 샘플
│   ├── Makefile             # 배포 단축키
│   └── scripts/
└── .github/workflows/deploy.yml
```

## 0. 배포 모드 선택

- **비용 0 모드(권장)**: ChatGPT Developer Mode + MCP만 사용하여 LLM API 비용 없이 운영합니다. `AGENT_MODE=disabled` 유지.
- **표준 모드(선택)**: `AGENT_MODE=once` 등으로 전환하고 `OPENAI_API_KEY`를 입력하면 Agents 컨테이너가 OpenAI/Anthropic 호출을 수행합니다.

## 1. 환경 변수

`ops/env.example`을 복사하여 `.env.prod`를 만들고 아래 필드를 채웁니다.

```ini
DOMAIN_APP=app.zzik.example
DOMAIN_MCP=mcp.zzik.example
TZ=Asia/Seoul

NEXT_PUBLIC_APP_NAME=ZZIK
NEXT_TELEMETRY_DISABLED=1

MCP_PORT=8080
MCP_ROOT=/data
ALLOW_HOSTS=api.zzik.example,docs.zzik.example
ALLOW_ORIGIN=https://${DOMAIN_APP}
BASIC_AUTH_USER=zzik
BASIC_AUTH_PASS=<강한비밀번호>
MAX_TEXT=200000
MCP_SERVICE_URL=https://${DOMAIN_MCP}
MCP_BASIC_AUTH=zzik:<강한비밀번호>
MCP_TIMEOUT=8000

# Optional Agents
OPENAI_API_KEY=
AGENT_MODE=disabled
```

프로덕션 서버에서 `ops/.env.prod`로 보관하고 `docker-compose.prod.yml`이 참조합니다.

## 2. Docker 빌드

### 웹 (Next.js)

- Node 20 이미지를 사용합니다.
- 빌더 단계에서 `npm run build` 실행 후 러너에서 `next start`.
- 비 루트 사용자 `nextjs`로 실행하고 `public/health.txt`로 헬스체크.

### MCP 서버

- Node 20 + sqlite3.
- `/data` 볼륨을 마운트하여 툴의 파일 시스템 접근을 제한합니다.
- Basic Auth + 호스트 화이트리스트 + 텍스트 크기 제한을 적용합니다.

### Agents (선택)

- Python 3.11 slim.
- LangGraph/LangChain/OpenAI SDK가 포함되며, 환경변수 토글로 비활성화 가능.

## 3. 리버스 프록시 (Caddy)

- 자동 TLS와 보안 헤더(HSTS, CSP, X-Frame-Options 등)를 제공합니다.
- `DOMAIN_APP`은 Next.js, `DOMAIN_MCP`는 MCP 서버로 라우트합니다.
- MCP 오리진은 웹 앱 도메인만 허용하며 Basic Auth를 강제합니다.

## 4. Compose 배포

```bash
cd ops
cp env.example .env.prod  # 값 입력
sudo docker compose -f docker-compose.prod.yml up -d --build
```

헬스체크

```bash
curl -I https://app.zzik.example
curl -u zzik:<비밀번호> -s https://mcp.zzik.example \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize"}'
```

## 5. GitHub Actions (선택)

`.github/workflows/deploy.yml`은 SSH를 통해 원격 서버에 `git pull` 후 Compose 재배포를 자동화합니다. `SSH_HOST`, `SSH_USER`, `SSH_KEY` 시크릿을 등록하세요.

## 6. 롤백

```bash
cd ops
docker compose -f docker-compose.prod.yml ps
# 필요 시
# git checkout <이전태그>
# docker compose -f docker-compose.prod.yml up -d --build
```

또는 `ops/Makefile` 단축 명령을 활용합니다.

## 7. 품질 게이트

- 대비 ≥ 4.5:1, CTA 대비 ≥ 7:1
- primary CTA 1개, secondary 최대 1개/섹션
- CLS 0.00 유지, prefers-reduced-motion 대응
- 무한로딩 차단: 에러 경계 + 타임아웃(fetch → `tfetch`) + LoadGuard 컴포넌트
- 스킵 링크 및 접근성 복합 상태 메시지 적용

---

5분 배포 체크리스트:

1. 서버에 레포지토리 클론 후 `ops/.env.prod` 작성
2. `docker compose -f ops/docker-compose.prod.yml up -d --build`
3. MCP `initialize` 호출 성공 및 ChatGPT Developer Mode 커넥터 등록
