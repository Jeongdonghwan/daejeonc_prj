// 키워드 페이지 본문 — 레이 모범 구조(2026-11-24, programmatic-seo composer-patterns §5-1·5-2)
// 분류 줄 → h1(키워드 + 수식어) → 설명 → 핵심 요약(결론 + 정보 4칸) → 번호 절 6개(한 문단) → FAQ → 관련 링크.
// 문장 재료는 lib/compose.ts·words.ts 가 쓰는 것(플레이스 사실·places.json·제도 원칙)만 다시 엮는다. 새 사실 없음.
import { Page, PLACES, seedOf } from './data';
import { compose } from './compose';
import { WORDS } from './words';
import { BRAND, CONTACT, PLACE_FACTS } from './site';
import { j } from './ko';

// FNV 아랫비트는 슬러그 끝 글자에 따라 짝수·홀수가 같이 움직여(수식어만 다른 페이지가 같은 쪽을 고름) 윗비트로 고른다
const hi = (k: string) => seedOf(k) >>> 15;
const pick = <T,>(arr: T[], seed: string, salt: string): T => arr[hi(`${seed}::${salt}`) % arr.length];
const shuffle = <T,>(arr: T[], seed: string, salt: string) => arr.map((x, i) => [hi(`${i}::${salt}::${seed}`), x] as [number, T]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
const end = (s: string) => (/[.?!]$/.test(s) ? s : `${s}.`);
// 문장을 차례로 넣되 max 를 넘기는 문장은 건너뛴다 → 문단 길이를 230~270자 안에
const para = (sents: string[], max = 268) => {
  let out = '';
  for (const t of sents) { if (!t) continue; const n = out ? `${out} ${t}` : t; if (n.length <= max) out = n; }
  return out.replace(/\s+/g, ' ');
};
const josaOf = (w: string, t: string) => j(w, t).slice(w.length);
const MOD_CAT: Record<string, string> = { '': '범위·일정', 업체: '견적 비교', 잘하는곳: '작업 과정', 전문: '설비·절차', 추천: '맡기기 전 확인' };

// h1 수식어: "키워드 수식어"가 40자를 넘지 않는 벌을 해시 순서로 고르고, 다 넘으면 구 단위로 자른다 (title 앞부분 = h1)
const fitSub = (kw: string, arr: string[], seed: string) => {
  const k = hi(`${seed}::h1sub`) % arr.length;
  const order = [...arr.slice(k), ...arr.slice(0, k)];
  const ok = order.find((x) => kw.length + 1 + x.length <= 40);
  if (ok) return ok;
  const words = order[0].split(' ');
  while (words.length > 1 && kw.length + 1 + words.join(' ').length > 40) words.pop();
  return words.join(' ').replace(/[,·]$/, '');
};

// title 전체 40자 이하(네이버 권장): 상호를 붙여 40자를 넘으면 상호를 뺀다. 앞부분은 항상 h1 과 같다
const titleOf = (kw: string, sub: string) => (`${kw} ${sub} | ${BRAND}`.length <= 40 ? `${kw} ${sub} | ${BRAND}` : `${kw} ${sub}`);

export function composeRay(p: Page) {
  const c = compose(p);
  const P = PLACES[p.place];
  const w = WORDS[p.word];
  const s = p.slug;
  const kw = p.kw;
  const nm = P.name;
  const lb = p.label;
  const sp0 = c.region.spots.filter((x) => !x.includes(lb) && !x.includes(nm));
  const sp = sp0.length ? sp0 : c.region.spots;
  const last = w.scope[w.scope.length - 1].name;
  const mi = c.mod.items;

  const h1sub = fitSub(kw, {
    '': [`${sp[0]} 주변 ${w.obj} 범위·일정 정리`, `${w.scope[0].name}부터 ${last}까지`, `${w.laws[0].t}까지 한 번에 확인`],
    업체: [`견적서에서 볼 ${mi.length}가지`, `${sp[0]} 주변 ${w.obj} 견적 비교`, `${w.scope[0].name} 범위부터 비교`],
    잘하는곳: [`${w.scope[1].name} 순서와 마감 보기`, `${sp[0]} 주변 현장 과정 비교`, `보양부터 청소까지 과정 보기`],
    전문: [`${w.laws[0].t}·${w.laws[1].t} 알고 맡기기`, `${w.obj} 설비와 절차`, `${sp[0]} 주변 ${w.obj} 현장 기준`],
    추천: [`맡기기 전 직접 확인할 ${mi.length}가지`, `${sp[0]} 주변 현장 견적 확인`, `${w.tell[0]}부터 묻는 견적`],
  }[p.mod] || [`${sp[0]} 주변 ${w.obj} 범위·일정 정리`], s);

  const cat = `${P.admin.split(' ').slice(0, 2).join(' ')} · ${w.short} · ${MOD_CAT[p.mod] ?? '범위·일정'}`;

  // ---- 핵심 요약 ----
  const summary = para([
    `${kw}${josaOf(kw, '은')} ${w.aim.split(' — ')[0]}입니다.`,
    `${nm}에서는 ${w.laws[0].t}${w.laws[1] ? `·${w.laws[1].t}` : ''}부터 확인하고, ${BRAND}는 현장을 본 뒤 범위별 견적을 드립니다.`,
    pick([`${nm}에는 ${j(P.homes, '이')} 있어 ${w.tell[0]}부터 여쭙니다.`, end(P.note)], s, 'sum2'),
    pick([`${nm} 현장 상담은 ${CONTACT.phone}로 받습니다.`, `${lb} 문의는 ${CONTACT.phone} 전화로 현장 확인 날짜부터 잡습니다.`], s, 'sum3'),
  ], 330);
  const facts = c.summary;

  // ---- 번호 절 6개 ----
  const steps = w.steps;
  const chk = shuffle(w.checks, s, 'ck');
  const modProse = mi.map((x) => end(x.replace(/\s—\s/, ' — ')));
  const secs: { sub: string[]; p: string }[] = [
    { sub: [`${nm} 현장 사정`, c.view.heading.replace(`${nm} `, '').replace(`${lb} `, ''), `${nm} 건물에서 먼저 볼 것`],
      p: para([...c.view.paras, `${nm}에는 ${j(P.homes, '이')} 있습니다.`, end(P.note)]) },
    { sub: [c.mod.heading.replace(`${kw} `, '').replace(`${kw}, `, '').replace(/^이라면 /, ''), `${MOD_CAT[p.mod] ?? '범위·일정'}, ${sp[0]} 주변 현장 기준`, `${w.short} 맡기기 전에`],
      p: para([
        c.mod.lead.replace(/아래를/, '다음을'),
        ...shuffle(modProse, s, 'm1').slice(0, 1),
        `${nm} 현장에서는 ${shuffle(w.scope, s, 'sc').slice(0, 3).map((x) => x.name).join('·')} 가운데 필요한 것만 골라 견적을 냅니다.`,
        `${nm} 현장은 ${c.view.table[3][1].replace(`${nm} `, '')}${josaOf(c.view.table[3][1], '을')} 일정 기준으로 잡습니다.`,
        ...shuffle(modProse, s, 'm1').slice(1, 2),
      ]) },
    { sub: [`${w.short} 진행 순서`, `${steps[0].title}에서 ${steps[steps.length - 1].title}까지`, `${nm} 현장 작업 순서`],
      p: para([
        `${nm} ${j(w.short, '은')} ${steps.map((x) => x.title).join(' → ')} 순서로 진행합니다.`,
        steps[hi(`${s}::st`) % steps.length].text,
        ...shuffle(c.steps, s, 'tl').slice(0, 3).map((x) => x.text.split(/(?<=\.)\s+/).slice(1).join(' ')),
        `${sp.slice(0, 2).join('·')} 주변처럼 차를 대기 어려운 곳은 반출 시간을 따로 정합니다.`,
      ]) },
    { sub: [`${w.short} 전에 챙길 제도`, '신고와 확인 절차', `${nm} 현장 절차`],
      p: para([
        pick([`${nm} 현장에 일반적으로 해당하는 내용이고, 실제 대상 여부는 관할 기관 기준을 따릅니다.`, `${lb} 현장도 작업 전에 다음 절차부터 확인합니다.`], s, 'r0'),
        ...shuffle(w.laws, s, 'r1').slice(0, 1).map((l) => `${l.t} — ${l.d}`),
        `${nm}처럼 ${j(P.homes.split(',')[0].trim(), '이')} 있는 곳은 ‘${chk[0]}’ 같은 사정이 있는지 먼저 봅니다.`,
        `${sp.slice(0, 3).join('·')} 주변 건물도 같은 기준으로 봅니다.`,
        `${nm} 현장에서 함께 챙길 절차는 ${w.laws.map((l) => l.t).join('·')}입니다.`,
      ], 290) },
    { sub: [`${nm} 상담 전 준비할 것`, '연락 주실 때 알려 주시면 좋은 것', '견적 전에 미리 말씀해 주실 것'],
      p: para([
        `${c.tell.items.join(', ')}${josaOf(c.tell.items[3], '을')} 알려 주시면 ${nm} 현장 확인 때 필요한 것을 미리 챙겨 갈 수 있습니다.`,
        `${chk[1].replace(/이다$/, '이라').replace(/다$/, '다')}면 첫 통화에서 먼저 말씀해 주세요.`,
        `‘${chk[2]}’에 해당해도 ${lb} 견적이 달라집니다.`,
        pick([`${nm} 현장 주소와 사진이 있으면 통화가 짧아집니다.`, `${lb} 현장 사진을 먼저 보내 주시면 통화 때 바로 이어서 설명드립니다.`], s, 't9'),
      ]) },
    { sub: [`${BRAND}가 일하는 방식`, `${nm} 출장과 일정`, `${BRAND} 작업 원칙`],
      p: para([
        c.intro[0],
        c.region.paras[2],
        `${end(PLACE_FACTS.area)} ${nm} 현장 확인 날짜는 통화로 잡습니다.`,
      ]) },
  ];
  const KW_AT = new Set([0, 1, 2, 5]); // 6개 중 4개 h2 에 키워드 전체
  const sections = secs.map((x, i) => {
    const sub = pick(x.sub, s, `h${i}`);
    return { h: KW_AT.has(i) ? `${kw}${i % 2 ? ' — ' : ': '}${sub}` : sub, p: x.p };
  });

  // FAQ: 단어 고유 2 + 공통 2 (같은 문장 비율을 낮추려고 5개 → 4개)
  const faq = [...c.faq.slice(0, 2), ...c.faq.slice(3, 5)];

  // description 45~80자: 키워드 — 하는 일 2~3개 + 장소 사실 + 전화 (80자 넘으면 문장 단위로 줄임)
  const t = shuffle(w.scope, s, 'dt').map((x) => x.name);
  const fact = pick([`${sp[0]} 주변 ${w.obj} 현장 확인`, `${nm} ${w.obj} 현장 견적`], s, 'df');
  const description = [
    `${kw} — ${t[0]}, ${j(t[1], '과')} ${t[2]}까지 범위대로. ${fact} ${CONTACT.phone}`,
    `${kw} — ${j(t[0], '과')} ${t[1]}까지 범위대로. ${fact} ${CONTACT.phone}`,
    `${kw} — ${j(t[0], '과')} ${t[1]}까지 범위대로. 현장 견적 ${CONTACT.phone}`,
    `${kw} — ${t[0]}부터 범위대로. 현장 견적 ${CONTACT.phone}`,
  ].find((x) => x.length <= 80)!;

  return { ...c, title: titleOf(kw, h1sub), h1sub, cat, summaryText: summary, facts, sections, faq, description };
}
