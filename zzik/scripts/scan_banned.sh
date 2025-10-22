#!/bin/bash
# scan_banned.sh - 금지어 스캔 리포트
# 결과: audit/banned_words.csv (file,line,word,context)

set -e

# 레포 루트에서 실행되었는지 확인
if [ ! -f "package.json" ]; then
  echo "❌ Error: 레포 루트에서 실행해주세요 (package.json이 없습니다)"
  exit 1
fi

echo "🚫 금지어 스캔 시작..."

# 디렉토리 생성
mkdir -p audit

# 공통 설정 (배열 사용)
INCLUDE_ARGS=(
  -g '*.ts'
  -g '*.tsx'
  -g '*.js'
  -g '*.jsx'
  -g '*.vue'
  -g '*.svelte'
  -g '*.json'
  -g '*.yml'
  -g '*.yaml'
)
EXCLUDE_ARGS=(
  -g '!node_modules'
  -g '!dist'
  -g '!build'
  -g '!.next'
  -g '!.expo'
  -g '!.turbo'
  -g '!.git'
)

# 금지어 목록 (사용자 노출 금지)
BANNED='지오펜스|쿠폰|레코멘더|업리프트|밴딧|H3|ANN|INP|LCP|CLS|oEmbed|세그먼트|타겟팅|타깃팅'

echo "  🔍 금지어 패턴: $BANNED"

rg -n -i --no-heading -P "${INCLUDE_ARGS[@]}" "${EXCLUDE_ARGS[@]}" -e "$BANNED" . \
| python3 - <<'PY' > audit/banned_words.csv
import re, sys, csv
w = csv.writer(sys.stdout); w.writerow(["file","line","word","context"])
pat = re.compile(r'(지오펜스|쿠폰|레코멘더|업리프트|밴딧|H3|ANN|INP|LCP|CLS|oEmbed|세그먼트|타겟팅|타깃팅)', re.I)
for line in sys.stdin:
    try:
        parts = line.rstrip("\n").split(":", 2)
        if len(parts) < 3:
            continue
        path, lineno, ctx = parts
        m = pat.search(ctx)
        if m:
            w.writerow([path, lineno, m.group(1), ctx.strip()])
    except Exception:
        pass
PY

# 결과 통계
TOTAL=$(tail -n +2 audit/banned_words.csv 2>/dev/null | wc -l | tr -d ' ')
if [ "$TOTAL" -eq "0" ]; then
  echo "✅ 완료: 금지어 미발견 (깨끗합니다!)"
else
  echo "⚠️  완료: $TOTAL 개의 금지어 발견됨"
  echo "   📄 audit/banned_words.csv"
fi
