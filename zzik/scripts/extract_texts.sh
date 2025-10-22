#!/bin/bash
# extract_texts.sh - 사용자 노출 텍스트 추출 (문자열 + JSX)
# 결과: audit/user_texts.csv (file,line,type,text,length)

set -e

# 레포 루트에서 실행되었는지 확인
if [ ! -f "package.json" ]; then
  echo "❌ Error: 레포 루트에서 실행해주세요 (package.json이 없습니다)"
  exit 1
fi

echo "📝 사용자 노출 텍스트 추출 시작..."

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

# 1A. 따옴표 문자열(싱글/더블/백틱)만 추출
echo "  🔍 따옴표 문자열 추출 중..."
rg -n --no-heading "${INCLUDE_ARGS[@]}" "${EXCLUDE_ARGS[@]}" -e '"[^"]{2,}"' . \
| python3 - <<'PY' > tmp/quoted_double.csv
import sys, csv, re
w = csv.writer(sys.stdout)
for line in sys.stdin:
    try:
        parts = line.strip().split(":", 2)
        if len(parts) < 3: continue
        path, lineno, rest = parts
        # 더블 쿼트 문자열 추출
        matches = re.findall(r'"([^"]{2,})"', rest)
        for s in matches:
            # 코드 키/경로처럼 보이는 건 걸러냄
            if re.fullmatch(r"[A-Za-z0-9_.:/\\-]{2,}", s): continue
            if len(s.strip()) < 2: continue
            w.writerow([path, lineno, "quoted", s, len(s)])
    except Exception:
        pass
PY

# 싱글 쿼트 문자열 추출
rg -n --no-heading "${INCLUDE_ARGS[@]}" "${EXCLUDE_ARGS[@]}" -e "'[^']{2,}'" . \
| python3 - <<'PY' > tmp/quoted_single.csv
import sys, csv, re
w = csv.writer(sys.stdout)
for line in sys.stdin:
    try:
        parts = line.strip().split(":", 2)
        if len(parts) < 3: continue
        path, lineno, rest = parts
        matches = re.findall(r"'([^']{2,})'", rest)
        for s in matches:
            if re.fullmatch(r"[A-Za-z0-9_.:/\\-]{2,}", s): continue
            if len(s.strip()) < 2: continue
            w.writerow([path, lineno, "quoted", s, len(s)])
    except Exception:
        pass
PY

# 백틱 문자열 추출
rg -n --no-heading "${INCLUDE_ARGS[@]}" "${EXCLUDE_ARGS[@]}" -e '`[^`]{2,}`' . \
| python3 - <<'PY' > tmp/quoted_backtick.csv
import sys, csv, re
w = csv.writer(sys.stdout)
for line in sys.stdin:
    try:
        parts = line.strip().split(":", 2)
        if len(parts) < 3: continue
        path, lineno, rest = parts
        matches = re.findall(r'`([^`]{2,})`', rest)
        for s in matches:
            if re.fullmatch(r"[A-Za-z0-9_.:/\\-]{2,}", s): continue
            if len(s.strip()) < 2: continue
            w.writerow([path, lineno, "quoted", s, len(s)])
    except Exception:
        pass
PY

# 1B. JSX 텍스트 노드: >텍스트< 패턴
echo "  🔍 JSX 텍스트 노드 추출 중..."
rg -n --no-heading "${INCLUDE_ARGS[@]}" "${EXCLUDE_ARGS[@]}" -e '>[^<>]{2,}<' . \
| python3 - <<'PY' > tmp/jsx.csv
import sys, csv, re
w = csv.writer(sys.stdout)
for line in sys.stdin:
    try:
        parts = line.strip().split(":", 2)
        if len(parts) < 3: continue
        path, lineno, rest = parts
        # JSX 텍스트 패턴: >텍스트<
        matches = re.findall(r'>([^<>\n]{2,})<', rest)
        for s in matches:
            s = s.strip()
            # 템플릿 자리표시자/변수만 있는 경우 제외
            if re.fullmatch(r"[{][^}]+[}]", s): continue
            if re.fullmatch(r"[A-Za-z0-9_.:/\\-]{2,}", s): continue
            if len(s) < 2: continue
            w.writerow([path, lineno, "jsx", s, len(s)])
    except Exception:
        pass
PY

# 1C. 합치고 중복 제거
echo "  📊 중복 제거 및 정렬 중..."
python3 - <<'PY' > audit/user_texts.csv
import csv, sys, os
rows = []
seen = set()
for f in ("tmp/quoted_double.csv", "tmp/quoted_single.csv", "tmp/quoted_backtick.csv", "tmp/jsx.csv"):
    if not os.path.exists(f):
        continue
    try:
        with open(f, newline='', encoding='utf-8') as r:
            for row in csv.reader(r):
                if len(row) < 5: continue
                key = tuple(row[:4]) # file,line,type,text
                if key in seen:
                    continue
                seen.add(key)
                rows.append(row)
    except Exception:
        pass
# 길이 기준선: 공백 포함 2자 이상
rows.sort(key=lambda x:(x[0], int(x[1]), x[2]))
w = csv.writer(sys.stdout)
w.writerow(["file","line","type","text","length"])
w.writerows(rows)
PY

# 결과 통계
TOTAL=$(tail -n +2 audit/user_texts.csv 2>/dev/null | wc -l | tr -d ' ')
echo "✅ 완료: $TOTAL 개의 사용자 노출 텍스트 추출됨"
echo "   📄 audit/user_texts.csv"
