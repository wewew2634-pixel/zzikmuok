#!/bin/bash
# scan_replacements.sh - 권장어 치환 제안 (자동 매핑 리포트)
# 결과: audit/replacements.csv (file,line,bad,good,context)

set -e

# 레포 루트에서 실행되었는지 확인
if [ ! -f "package.json" ]; then
  echo "❌ Error: 레포 루트에서 실행해주세요 (package.json이 없습니다)"
  exit 1
fi

echo "🔄 권장어 치환 제안 생성 중..."

# 디렉토리 생성
mkdir -p audit

python3 - <<'PY' > audit/replacements.csv
import re, csv, sys, glob, os
bad2good = {
    "지오펜스":"동네 반경 알림",
    "쿠폰":"체험권",
    "레코멘더":"내 근처 지금",
    "세그먼트":"그룹",
    "타겟팅":"맞춤 보내기",
    "타깃팅":"맞춤 보내기"
}
files = []
for pat in ["**/*.ts","**/*.tsx","**/*.js","**/*.jsx","**/*.vue","**/*.svelte","**/*.json","**/*.yml","**/*.yaml"]:
    files.extend(glob.glob(pat, recursive=True))
excl = ("/node_modules/","/dist/","/build/","/.next/","/.expo/","/.turbo/","/.git/")
w = csv.writer(open("audit/replacements.csv","w",newline=''))
w.writerow(["file","line","bad","good","context"])
for f in files:
    if any(x in f for x in excl):
        continue
    try:
        for i, line in enumerate(open(f, encoding="utf-8", errors="ignore"), start=1):
            for bad, good in bad2good.items():
                if re.search(rf'\b{re.escape(bad)}\b', line, flags=re.I):
                    w.writerow([f, i, bad, good, line.strip()])
    except Exception:
        pass
PY

# 결과 통계
TOTAL=$(tail -n +2 audit/replacements.csv 2>/dev/null | wc -l | tr -d ' ')
if [ "$TOTAL" -eq "0" ]; then
  echo "✅ 완료: 치환 제안 없음 (모든 용어가 권장어입니다!)"
else
  echo "💡 완료: $TOTAL 개의 치환 제안 생성됨"
  echo "   📄 audit/replacements.csv"
fi
