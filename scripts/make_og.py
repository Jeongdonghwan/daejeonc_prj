"""페이지별 og 이미지(1200x630 JPEG) → public/og/<key>.jpg  (home, area, cases, area-<시구>, <키워드 슬러그>)
   python -I scripts/make_og.py           # 없는 것만 생성
   python -I scripts/make_og.py --force   # 전부 다시
배경 = 네이버 플레이스 업체 사진(public/img/*.jpg, data/photos.json) 어둡게, 글자 = 굵은 한글 키워드.
네이버는 og 이미지를 가운데 정사각형으로 잘라 보여 주므로 글자는 가운데 630px 안쪽에 둔다.
"""
import json, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageEnhance

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'og'
W, H = 1200, 630
SAFE_L, SAFE_W = 300, 600  # 가운데 정사각형(285~915) 안쪽
SITE = (ROOT / 'lib' / 'site.ts').read_text(encoding='utf-8')
import re
BRAND = re.search(r"name: '([^']*)'", SITE).group(1)  # lib/site.ts PLACE_FACTS
PHONE = re.search(r"phone: '([^']*)'", SITE).group(1)
NAVY, ACCENT = (26, 29, 32), (255, 106, 77)  # 흑연 / 적색(밝게)
BOLD, REG = r'C:\Windows\Fonts\malgunbd.ttf', r'C:\Windows\Fonts\malgun.ttf'


def fnv(s):  # lib/data.ts hash 와 같은 FNV-1a
    h = 2166136261
    for ch in s:
        h = ((h ^ ord(ch)) * 16777619) & 0xFFFFFFFF
    return h


def base(path):
    im = Image.open(path).convert('RGB')
    s = max(W / im.width, H / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    l, t = (im.width - W) // 2, (im.height - H) // 2
    im = ImageEnhance.Brightness(im.crop((l, t, l + W, t + H))).enhance(0.38)
    return Image.blend(im, Image.new('RGB', (W, H), NAVY), 0.35)


def wrap(d, text, font, maxw):
    lines, cur = [], ''
    for w in text.split():
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=font) <= maxw:
            cur = t
        else:
            lines.append(cur); cur = w
    return lines + [cur] if cur else lines


def render(bases, key, title, sub):
    im = bases[fnv(key) % len(bases)].copy()
    d = ImageDraw.Draw(im)
    size = 76
    while True:
        f = ImageFont.truetype(BOLD, size)
        lines = wrap(d, title, f, SAFE_W)
        if (len(lines) <= 3 and all(d.textlength(x, font=f) <= SAFE_W for x in lines)) or size <= 40:
            break
        size -= 4
    y = 300 - len(lines) * size * 0.62
    d.rectangle((SAFE_L, y - 34, SAFE_L + 70, y - 26), fill=ACCENT)
    for ln in lines:
        d.text((SAFE_L, y), ln, font=f, fill='white'); y += size * 1.2
    d.text((SAFE_L, y + 14), sub, font=ImageFont.truetype(REG, 28), fill=(214, 226, 236))
    d.text((SAFE_L, 540), f'{BRAND}  ·  {PHONE}', font=ImageFont.truetype(BOLD, 28), fill=ACCENT)
    im.save(OUT / f'{key}.jpg', 'JPEG', quality=80, optimize=True, progressive=True)


def main():
    force = '--force' in sys.argv
    OUT.mkdir(parents=True, exist_ok=True)
    pages = json.loads((ROOT / 'data' / 'site-pages.json').read_text(encoding='utf-8'))['pages']
    places = list(json.loads((ROOT / 'data' / 'places.json').read_text(encoding='utf-8'))['places'])
    sub = {'철거': '내부 철거 · 부분 철거 · 폐기물 반출', '상가철거': '간판 · 천장 · 가벽 · 바닥 철거', '식당철거': '후드·덕트 · 가스 · 주방 설비',
           '원상복구': '계약서 범위대로 되돌리기', '완파': '해체 신고·허가 · 석면 · 멸실', '미용실철거': '샴푸대 · 경대 · 배관 마감',
           '학원철거': '강의실 칸막이 · 방음 가벽', '공장철거': '설비 해체 · 고철 분리 반출', '폐업철거': '집기 정리 · 철거 · 원상복구'}
    jobs = [('home', f'대전 철거·원상복구 {BRAND}', '상가 · 식당 · 미용실 · 학원 · 공장 · 폐업'),
            ('area', '대전 지역별 철거·원상복구', '중구 · 서구 · 유성구 · 둔산 · 도안 · 노은')] +            [(f'area-{c}', f'{c} 철거·원상복구 안내', '상가 · 식당 · 미용실 · 학원 · 공장 · 완파') for c in places] +            [(p['slug'], p['kw'], sub[p['word']]) for p in pages]
    jobs = [j for j in jobs if force or not (OUT / f'{j[0]}.jpg').exists()]
    ph = json.loads((ROOT / 'data' / 'photos.json').read_text(encoding='utf-8'))['photos']
    tags = {c['img']: c['tags'] for c in ph}
    imgs = {p.stem: base(p) for p in sorted((ROOT / 'public' / 'img').glob('*.jpg')) if p.stem in tags} if jobs else {}
    word_of = {p['slug']: p['word'] for p in pages}
    pool = lambda key: [im for k, im in imgs.items() if word_of.get(key, '') in tags[k]] or list(imgs.values())
    for i, (key, title, sub) in enumerate(jobs, 1):
        render(pool(key), key, title, sub)
        if i % 200 == 0:
            print(i, '/', len(jobs))
    print('생성', len(jobs), '/ 전체', len(pages) + 2 + len(places))


if __name__ == '__main__':
    assert fnv('a') == 0xE40C292C  # FNV-1a 기준값
    main()
