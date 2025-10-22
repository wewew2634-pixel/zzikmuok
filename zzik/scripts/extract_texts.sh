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

# 1A. 따옴표 문자열 추출
echo "  🔍 따옴표 문자열 추출 중..."
rg -n --no-heading "${INCLUDE_ARGS[@]}" "${EXCLUDE_ARGS[@]}" -e '["\`'\''][^"\`'\''\n]{2,}["\`'\'']' . \
  | python3 scripts/text-audit/extract_quoted.py > tmp/quoted.csv

# 1B. JSX 텍스트 노드
echo "  🔍 JSX 텍스트 노드 추출 중..."
rg -n --no-heading "${INCLUDE_ARGS[@]}" "${EXCLUDE_ARGS[@]}" -e '>[^<>\n]{2,}<' . \
  | python3 scripts/text-audit/extract_jsx.py > tmp/jsx.csv

# 1C. 합치고 중복 제거
echo "  📊 중복 제거 및 정렬 중..."
python3 scripts/text-audit/merge_texts.py > audit/user_texts.csv

# 결과 통계
TOTAL=$(tail -n +2 audit/user_texts.csv 2>/dev/null | wc -l | tr -d ' ')
echo "✅ 완료: $TOTAL 개의 사용자 노출 텍스트 추출됨"
echo "   📄 audit/user_texts.csv"
