#!/usr/bin/env bash
# 빌드 결과(out/)만 deploy 브랜치로 올린다. 서버는 deploy 브랜치를 받아 nginx로 서빙.
#   bash scripts/deploy.sh <단계 1~2> <https://도메인>   (단계 = 키워드 우선순위)
# 서버 갱신: cd /var/www/<폴더> && git fetch -q origin deploy && git reset -q --hard origin/deploy
set -euo pipefail
WAVE=${1:?단계(1~3)}; URL=${2:?https://도메인}
cd "$(dirname "$0")/.."
python -I scripts/make_og.py  # og 이미지(public/og, git 제외) 없는 것만 생성
rm -rf out
OPEN_WAVE=$WAVE SITE_URL=$URL npx next build
grep -q "$URL" out/sitemap.xml || { echo "sitemap에 도메인이 없음"; exit 1; }
# 열린 페이지가 쓰는 og 이미지만 남긴다 (안 열린 키워드 파일명 노출·용량 방지)
python -I - <<'PY'
import json, os, urllib.parse
from pathlib import Path
out = Path('out')
keep = {'home', 'area'} | {f'area-{d.name}' for d in (out / 'area').iterdir() if d.is_dir()}
keep |= {p['slug'] for p in json.load(open('data/site-pages.json', encoding='utf-8'))['pages'] if (out / p['slug'] / 'index.html').exists()}
n = 0
for f in (out / 'og').glob('*.jpg'):
    if f.stem not in keep:
        f.unlink(); n += 1
print('og 정리: 지운 파일', n)
PY
REMOTE=$(git remote get-url origin)
cd out
git init -q -b deploy && git add -A
git -c user.name="$(git -C .. config user.name)" -c user.email="$(git -C .. config user.email)" commit -q -m "deploy: ${WAVE}단계 $(date +%F)"
git push -q -f "$REMOTE" deploy
rm -rf .git
echo "deploy 브랜치 갱신 완료: ${WAVE}단계, $(find . -name '*.html' | wc -l) html"
