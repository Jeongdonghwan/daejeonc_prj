# 네이버 플레이스 탭별 본문·이미지·graphql 응답 수집 (기본 UA, 우회 없음).  python -I scripts/fetch_place.py source/place
import json, sys
from playwright.sync_api import sync_playwright
OUT = sys.argv[1]
base = 'https://m.place.naver.com/place/1297541290/'
res, gql = {}, []


def on_resp(r):
    if 'graphql' in r.url or 'api' in r.url:
        try:
            gql.append({'url': r.url, 'body': r.json()})
        except Exception:
            pass


with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 420, 'height': 900})
    pg.on('response', on_resp)
    for tab in ['home', 'information', 'photo', 'review/visitor']:
        r = pg.goto(base + tab, wait_until='networkidle', timeout=45000)
        st = r.status if r else None
        print(tab, st, flush=True)
        if st == 429:
            break
        pg.wait_for_timeout(1500)
        if tab == 'photo':
            for label in ['업체', '업체사진']:
                loc = pg.get_by_text(label, exact=True)
                if loc.count():
                    try:
                        loc.first.click(); pg.wait_for_timeout(2000); print('clicked', label)
                    except Exception as e:
                        print('click fail', e)
                    break
        for _ in range(8):
            pg.mouse.wheel(0, 2500); pg.wait_for_timeout(600)
        # '더보기'·'펼쳐보기' 류는 소개글 펼침용으로만 한 번
        if tab in ('home', 'information'):
            for t in ['더보기', '펼쳐보기']:
                loc = pg.get_by_text(t, exact=True)
                for i in range(min(loc.count(), 3)):
                    try:
                        loc.nth(i).click(timeout=2000); pg.wait_for_timeout(500)
                    except Exception:
                        pass
        res[tab] = dict(status=st, url=pg.url, text=pg.inner_text('body'),
                        imgs=pg.eval_on_selector_all('img', 'els => els.map(e => [e.src, e.alt, e.naturalWidth, e.naturalHeight])'),
                        links=pg.eval_on_selector_all('a', 'els => els.map(e => [e.href, e.innerText.slice(0,60)])'))
        pg.screenshot(path=f"{OUT}/{tab.replace('/', '_')}.png", full_page=True)
    b.close()
json.dump(res, open(f'{OUT}/place.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump(gql, open(f'{OUT}/gql.json', 'w', encoding='utf-8'), ensure_ascii=False)
print('done', {k: len(v['text']) for k, v in res.items()}, 'gql', len(gql))
