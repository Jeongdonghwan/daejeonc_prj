// 키워드 페이지(레이 구조) 점검: OPEN_WAVE=6 npx tsx scripts/ray_check.ts
// h1(키워드+수식어) 중복, 절 문단 길이, 본문 길이, 조사 오류, 같은 문장 비율(같은 주제 = 같은 단어·수식어 / 같은 장소)
import { OPEN_PAGES, PLACES, inSitemap, seedOf, Page } from '../lib/data';
import { composeRay } from '../lib/ray';
import { BRAND } from '../lib/site';
import { josa } from '../lib/ko';

const pages = OPEN_PAGES;
type R = ReturnType<typeof composeRay>;
const cache = new Map<string, { c: R; text: string; set: Set<string> }>();
const get = (p: Page) => {
  if (!cache.has(p.slug)) {
    const c = composeRay(p);
    const text = [c.lead, c.summaryText, ...c.sections.map((x) => x.p), ...c.faq.map((f) => f.a)].join(' ');
    cache.set(p.slug, { c, text, set: new Set(text.split(/(?<=[.?!])\s+/).map((x) => x.trim()).filter((x) => x.length > 12)) });
  }
  return cache.get(p.slug)!;
};
const share = (a: Page, b: Page) => { const A = get(a).set, B = get(b).set; let n = 0; A.forEach((x) => { if (B.has(x)) n++; }); return n / Math.min(A.size, B.size); };

const h1 = new Map<string, number>(); const lens: number[] = []; const plens: number[] = []; let josaBad = 0; let raw = 0;
const nouns = (p: Page) => [PLACES[p.place].name, p.label, BRAND, p.word];
for (const p of pages) {
  const g = get(p); const c = g.c;
  const h = `${p.kw} ${c.h1sub}`; h1.set(h, (h1.get(h) || 0) + 1);
  lens.push(g.text.replace(/\s/g, '').length);
  c.sections.forEach((x) => plens.push(x.p.length));
  const all = [c.h1sub, c.summaryText, ...c.sections.flatMap((x) => [x.h, x.p])].join(' ');
  if (/undefined|NaN|\{|\}|\s\s|\.\.|을를|를을|은는|는은/.test(all)) { raw++; if (raw < 4) console.log('이상 문자열:', p.kw, all.match(/.{0,20}(undefined|NaN|\{|\}|\s\s|\.\.|을를|를을|은는|는은).{0,20}/)?.[0]); }
  for (const n of nouns(p)) for (const t of ['은', '는', '이', '가', '을', '를', '과', '와']) {
    const re = new RegExp(`${n}${t}(?=\\s)`, 'g');
    if (re.test(all) && josa(n, t) !== t) { josaBad++; if (josaBad < 4) console.log('조사:', p.kw, n + t); }
  }
}
const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const pct = (x: number) => `${Math.round(x * 100)}%`;
const rnd = (seed: string, n: number) => seedOf(seed) % n;
const canon = pages.filter(inSitemap);
const group = (key: (x: Page) => string) => { const m = new Map<string, Page[]>(); for (const x of canon) { const k = key(x); if (!m.has(k)) m.set(k, []); m.get(k)!.push(x); } return [...m.values()].filter((v) => v.length > 1); };
const within = (gs: Page[][], n: number) => Array.from({ length: n }, (_, i) => { const g = gs[rnd(`g${i}`, gs.length)]; return [g[rnd(`x${i}`, g.length)], g[rnd(`y${i}`, g.length)]] as [Page, Page]; }).filter(([a, b]) => a !== b);
const sample = (pairs: [Page, Page][]) => { const v = pairs.map(([a, b]) => share(a, b)); const mx = Math.max(...v); const at = pairs[v.indexOf(mx)]; return `평균 ${pct(avg(v))} · 최대 ${pct(mx)} (${at[0].kw} / ${at[1].kw}, ${v.length}쌍)`; };

console.log(`열린 페이지 ${pages.length} (대표 ${canon.length})`);
console.log(`h1 중복 ${[...h1.values()].filter((v) => v > 1).length} · 이상 문자열 페이지 ${raw} · 조사 오류 ${josaBad}`);
console.log(`본문(설명+요약+절+FAQ답, 공백 제외) 평균 ${Math.round(avg(lens))} · 최소 ${Math.min(...lens)} · 최대 ${Math.max(...lens)}`);
console.log(`절 문단 길이 평균 ${Math.round(avg(plens))} · 최소 ${Math.min(...plens)} · 최대 ${Math.max(...plens)}`);
console.log('같은 문장 — 같은 주제(단어·수식어 같고 장소 다름):', sample(within(group((x) => `${x.word}|${x.mod}`), 600)));
console.log('같은 문장 — 같은 장소(단어·수식어 다름):', sample(within(group((x) => x.place), 600)));
const ex = pages[seedOf('ex') % pages.length]; const c = get(ex).c;
console.log(`\n[예] ${ex.kw} / ${c.h1sub}\n분류: ${c.cat}\n요약: ${c.summaryText}\n${c.sections.map((x) => `## ${x.h}\n${x.p} (${x.p.length})`).join('\n')}`);
const short = pages.flatMap((p) => get(p).c.sections.map((x, i) => [i, x.p.length, p.kw] as const)).filter((x) => x[1] < 215);
console.log(`\n215자 미만 절 ${short.length}개`, short.slice(0, 5));
// description 45~80자·중복, 키워드 든 h2 개수(요약·절·FAQ·관련 안내)
const dl = pages.map((p) => get(p).c.description.length); const dset = new Set(pages.map((p) => get(p).c.description));
const kwH2 = pages.map((p) => 3 + get(p).c.sections.filter((x) => x.h.includes(p.kw)).length);
console.log(`description 길이 ${Math.min(...dl)}~${Math.max(...dl)}자 · 45~80 밖 ${dl.filter((x) => x < 45 || x > 80).length} · 중복 ${pages.length - dset.size} · 키워드 든 h2 최소 ${Math.min(...kwH2)}개`);
console.log('예 description:', get(pages[0]).c.description, '/', get(pages[700]).c.description);
// title = "{키워드} {h1 수식어} | 상호", 40자를 넘으면 상호 뺌: 중복 0, 앞부분 == h1 글자, 전체 40자 이하
const tl = pages.map((p) => get(p).c.title); const head = pages.map((p) => `${p.kw} ${get(p).c.h1sub}`);
const withBrand = tl.filter((x) => x.endsWith(` | ${BRAND}`)).length;
console.log(`title 전체 ${tl.length} · 상호 붙음 ${withBrand} · 상호 뺌 ${tl.length - withBrand} · 최장 ${Math.max(...tl.map((x) => x.length))}자 · 40자 초과 ${tl.filter((x) => x.length > 40).length} · 중복 ${tl.length - new Set(tl).size} · h1 불일치 ${tl.filter((x, i) => x !== head[i] && x !== `${head[i]} | ${BRAND}`).length}`);
