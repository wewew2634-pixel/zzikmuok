#!/bin/bash
# check_lengths.sh - 길이 규칙 점검 (알림 ≤20자 / 버튼 ≤3어절)
# 결과: audit/length_violations.csv (rule,file,line,text,len,words)

set -e

# 레포 루트에서 실행되었는지 확인
if [ ! -f "package.json" ]; then
  echo "❌ Error: 레포 루트에서 실행해주세요 (package.json이 없습니다)"
  exit 1
fi

echo "📏 길이 규칙 점검 시작..."

# 디렉토리 생성
mkdir -p audit tmp

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

# 알림/토스트/스낵바/노티 문맥의 문자열만 골라 길이 체크
echo "  🔍 알림 텍스트 추출 중 (≤20자 규칙)..."
rg -n --no-heading "${INCLUDE_ARGS[@]}" "${EXCLUDE_ARGS[@]}" -e '(toast|alert|snackbar|notification|알림|토스트|스낵바)' . \
| python3 - <<'PY' > tmp/notify.csv
import sys, csv, re
w = csv.writer(sys.stdout)
for line in sys.stdin:
    try:
        parts = line.strip().split(":", 2)
        if len(parts) < 3: continue
        path, lineno, rest = parts
        # 알림 관련 라인에서 문자열 추출
        strings = []
        strings.extend(re.findall(r'"([^"]{2,})"', rest))
        strings.extend(re.findall(r"'([^']{2,})'", rest))
        strings.extend(re.findall(r'`([^`]{2,})`', rest))
        for s in strings:
            w.writerow([path, lineno, "notify", s])
    except Exception:
        pass
PY

# 버튼/라벨/플레이스홀더 등 라벨성 텍스트 추출 후 어절 수 검사
echo "  🔍 버튼 텍스트 추출 중 (≤3어절 규칙)..."
rg -n --no-heading "${INCLUDE_ARGS[@]}" "${EXCLUDE_ARGS[@]}" -e '(aria-label|placeholder|title|alt|label|button|btn|children)\s*=' . \
| python3 - <<'PY' > tmp/buttons.csv
import re, sys, csv
w = csv.writer(sys.stdout)
for line in sys.stdin:
    try:
        parts = line.strip().split(":", 2)
        if len(parts) < 3: continue
        path, lineno, rest = parts
        # 속성 값 추출 (더블/싱글/백틱 쿼트)
        strings = []
        strings.extend(re.findall(r'=\s*"([^"]{2,})"', rest))
        strings.extend(re.findall(r"=\s*'([^']{2,})'", rest))
        strings.extend(re.findall(r'=\s*`([^`]{2,})`', rest))
        for s in strings:
            w.writerow([path, lineno, "button", s])
    except Exception:
        pass
PY

# 규칙 위반만 모아 CSV 출력
echo "  📊 규칙 위반 집계 중..."
python3 - <<'PY' > audit/length_violations.csv
import csv, os
def words_ko(s):
    # 공백 분리(한국어 기준 간단화)
    return [t for t in s.strip().split() if t]

rows=[]

# 알림: 20자 초과
if os.path.exists("tmp/notify.csv"):
    with open("tmp/notify.csv", newline='') as r:
        for row_data in csv.reader(r):
            if len(row_data) < 4:
                continue
            path, line, typ, text = row_data
            L = len(text)
            if L > 20:
                rows.append(["알림≤20자", path, line, text, L, len(words_ko(text))])

# 버튼: 3어절 초과
if os.path.exists("tmp/buttons.csv"):
    with open("tmp/buttons.csv", newline='') as r:
        for row_data in csv.reader(r):
            if len(row_data) < 4:
                continue
            path, line, typ, text = row_data
            W = len(words_ko(text))
            if W > 3:
                rows.append(["버튼≤3어절", path, line, text, len(text), W])

# 헤더+정렬
rows.sort(key=lambda x:(x[0], x[1], int(x[2])))
w=csv.writer(open("audit/length_violations.csv","w",newline=''))
w.writerow(["rule","file","line","text","len","words"])
w.writerows(rows)
PY

# 결과 통계
TOTAL=$(tail -n +2 audit/length_violations.csv 2>/dev/null | wc -l | tr -d ' ')
if [ "$TOTAL" -eq "0" ]; then
  echo "✅ 완료: 길이 규칙 위반 없음 (깨끗합니다!)"
else
  echo "⚠️  완료: $TOTAL 개의 길이 규칙 위반 발견됨"
  echo "   📄 audit/length_violations.csv"
fi
