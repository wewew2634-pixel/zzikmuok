#!/bin/bash
# run_text_audit.sh - 텍스트 감사 전체 파이프라인 실행
#
# 실행 순서:
#   1) extract_texts.sh   - 사용자 노출 텍스트 추출
#   2) scan_banned.sh     - 금지어 스캔
#   3) check_lengths.sh   - 길이 규칙 점검
#   4) scan_replacements.sh - 권장어 치환 제안
#
# 결과물:
#   audit/user_texts.csv       - 사용자 노출 후보 텍스트 목록
#   audit/banned_words.csv     - 금지어 사용 위치
#   audit/length_violations.csv - 길이 규칙 위반 목록
#   audit/replacements.csv     - 자동 치환 제안

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=========================================="
echo "📋 ZZMUK 텍스트 감사 v0.3"
echo "=========================================="
echo ""

# 레포 루트로 이동
cd "$REPO_ROOT"

# ripgrep 설치 확인
if ! command -v rg &> /dev/null; then
  echo "❌ Error: ripgrep(rg)이 설치되어 있지 않습니다."
  echo ""
  echo "설치 방법:"
  echo "  macOS:   brew install ripgrep"
  echo "  Ubuntu:  sudo apt-get install ripgrep"
  echo "  Arch:    sudo pacman -S ripgrep"
  echo ""
  exit 1
fi

# Python3 설치 확인
if ! command -v python3 &> /dev/null; then
  echo "❌ Error: python3이 설치되어 있지 않습니다."
  exit 1
fi

echo "✓ 환경 체크 완료 (rg, python3)"
echo ""

# 이전 결과물 정리
if [ -d "audit" ]; then
  echo "🗑️  이전 감사 결과 정리 중..."
  rm -rf audit tmp
fi

# 1) 텍스트 추출
echo ""
bash "$SCRIPT_DIR/extract_texts.sh"

# 2) 금지어 스캔
echo ""
bash "$SCRIPT_DIR/scan_banned.sh"

# 3) 길이 규칙 점검
echo ""
bash "$SCRIPT_DIR/check_lengths.sh"

# 4) 치환 제안
echo ""
bash "$SCRIPT_DIR/scan_replacements.sh"

# 종합 통계
echo ""
echo "=========================================="
echo "📊 감사 완료 - 종합 통계"
echo "=========================================="

TEXTS=$(tail -n +2 audit/user_texts.csv 2>/dev/null | wc -l | tr -d ' ')
BANNED=$(tail -n +2 audit/banned_words.csv 2>/dev/null | wc -l | tr -d ' ')
LENGTHS=$(tail -n +2 audit/length_violations.csv 2>/dev/null | wc -l | tr -d ' ')
REPLACE=$(tail -n +2 audit/replacements.csv 2>/dev/null | wc -l | tr -d ' ')

echo "📝 추출된 텍스트:     $TEXTS 개"
echo "🚫 금지어 발견:       $BANNED 개"
echo "📏 길이 규칙 위반:    $LENGTHS 개"
echo "💡 치환 제안:         $REPLACE 개"
echo ""
echo "📂 결과 파일:"
echo "   - audit/user_texts.csv"
echo "   - audit/banned_words.csv"
echo "   - audit/length_violations.csv"
echo "   - audit/replacements.csv"
echo ""

# 문제 있을 경우 경고
ISSUES=$((BANNED + LENGTHS))
if [ "$ISSUES" -gt "0" ]; then
  echo "⚠️  총 $ISSUES 개의 문제가 발견되었습니다."
  echo "   팀원과 함께 audit/ 폴더의 CSV 파일을 확인해주세요."
else
  echo "✅ 모든 규칙을 통과했습니다!"
fi

echo "=========================================="
