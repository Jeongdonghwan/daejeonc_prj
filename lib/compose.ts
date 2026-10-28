// 본문 조합기 — 키워드 페이지 하나의 모든 문장을 만든다.
// 원칙: 업체 사실은 네이버 플레이스(lib/site.ts PLACE_FACTS)에 있는 것만. 경력·건수·만족도 같은 숫자는 만들지 않는다.
// 장소 문장은 data/places.json(scripts/places_src.py)의 일반적으로 알려진 사실, 단어 문장은 lib/words.ts.
// 같은 문장 반복을 줄이려고 거의 모든 줄에 장소명(nm)·키워드·단어를 넣고, 후보 문장은 슬러그 해시로 고른다.
import { Page, Place, Photo, PLACES, seedOf, rotate, photosFor } from './data';
import { WORDS, MOD, Item, Law, WordData } from './words';
import { BRAND, CONTACT, PLACE_FACTS } from './site';
import { j } from './ko';

const pick = <T,>(arr: T[], seed: string, salt: string): T => arr[seedOf(`${seed}::${salt}`) % arr.length];
const end = (s: string) => (/[.?!]$/.test(s) ? s : `${s}.`);
const fill = (s: string, nm: string) => s.replace(/\{nm\}/g, nm);

export interface Composed {
  title: string; description: string; eyebrow: string; lead: string;
  answer: string; summary: [string, string][];
  hero: { img: string; alt: string; cap: string };
  intro: string[];
  region: { heading: string; paras: string[]; spots: string[]; nearby: string[] };
  view: { heading: string; paras: string[]; table: [string, string][] };
  checks: { heading: string; sub: string; items: string[]; photo: { img: string; alt: string; cap: string } };
  scope: { heading: string; text: string; list: Item[] };
  laws: { heading: string; sub: string; list: Law[] };
  mod: { heading: string; lead: string; items: string[] };
  photos: { heading: string; sub: string; items: { p: Photo; alt: string; caption: string }[] };
  steps: { title: string; text: string }[]; stepsHeading: string;
  tell: { heading: string; items: string[]; text: string };
  info: [string, string][];
  faq: { q: string; a: string }[];
  closing: { heading: string; text: string };
  ticker: string[]; cta: string;
}

// 단어 × 장소 관점 — 장소의 해당 facet 사실을 단어 관점으로 풀어 쓴다
function viewFor(p: Page, P: Place, w: WordData, nm: string, s: string) {
  const fact = P[w.facet];
  const spot = rotate(P.spots, s, 'vs')[0];
  const isHouse = w.facet === 'house';
  const heading = pick([
    `${nm} ${w.short}, 현장이 이렇게 다릅니다`,
    `${nm}에서 ${j(w.short, '을')} 할 때 보는 것`,
    `${p.label} ${w.short} 현장 사정`,
  ], s, 'vh');
  const para1 = `${nm}의 ${w.facet === 'shop' ? '상권' : w.facet === 'food' ? '음식점' : w.facet === 'edu' ? '학원' : w.facet === 'factory' ? '공장' : isHouse ? '건물' : '임대 공간'} 사정을 보면, ${end(fact)}`;
  const angle: Record<string, string[]> = {
    shop: [`그래서 ${nm} ${w.obj} 철거는 같은 건물 다른 점포가 영업하는 중에 진행되는 일이 많아, 공용부 보양과 작업 시간 협의가 견적만큼 중요합니다.`,
      `${spot} 주변처럼 점포가 촘촘한 곳은 반출 동선이 좁아 폐기물을 나눠 싣는 횟수가 늘어나니, ${nm} 현장은 차량 대는 위치부터 확인합니다.`],
    food: [`${nm} 식당은 주방 후드·덕트가 건물 밖이나 옥상까지 이어진 경우가 있어, 덕트 경로를 먼저 따라가 보고 철거 범위를 정합니다.`,
      `${spot} 주변 음식점처럼 큰 주방 설비를 쓴 곳은 설비 반출만으로 하루가 걸리기도 해, ${nm} 현장도 설비 처분 계획을 먼저 여쭙니다.`],
    edu: [`${nm} 학원 건물은 한 층에 학원 여러 곳이 수업을 하는 경우가 많아, 칸막이를 뜯는 소음 작업 시간을 관리 측과 먼저 맞춥니다.`,
      `학원이 층별로 들어선 ${nm} 빌딩은 엘리베이터 하나로 책걸상과 칸막이 자재를 내려야 해, 반출 순서와 시간을 미리 정합니다.`],
    factory: [`${nm} 공장철거 문의는 설비 무게와 반입로가 먼저입니다. 중량물이 있으면 지게차·크레인 같은 장비 일정을 같이 잡습니다.`,
      `공장은 임대인지 자가인지에 따라 범위가 달라 ${nm} 현장도 설비만 빼는지, 칸막이·바닥 정리까지 하는지, 건물까지 허무는지를 먼저 나눕니다.`],
    house: [`${nm}에서 오래된 주택을 허무는 일은 골목 폭과 옆집과의 거리가 공법을 정합니다. 장비가 못 들어가는 구간은 손으로 해체합니다.`,
      `${nm} 노후 건물은 슬레이트 지붕이나 오래된 마감재가 남아 있는 경우가 있어, 해체 전에 석면 조사 대상인지부터 확인합니다.`],
    office: [`${nm}처럼 임차인이 자주 바뀌는 곳은 이전 임차인의 시설을 인수해 쓴 공간이 많아, 원상복구 범위를 건물주와 먼저 맞춰야 다툼이 없습니다.`,
      `${spot} 주변 건물도 임대 만료일에 맞춰 다음 임차인이 바로 들어오는 경우가 많아, ${nm} 원상복구 일정은 만료일에서 거꾸로 계산합니다.`],
  };
  const para2 = pick(angle[w.facet], s, 'va');
  const table: [string, string][] = [
    ['현장', `${P.admin} ${w.obj}`],
    ['먼저 볼 곳', `${w.scope[0].name} · ${w.scope[1].name} · ${w.scope[2].name}`],
    ['함께 챙길 절차', w.laws.map((l) => l.t).join(' · ')],
    ['일정 기준', pick([`${nm} 임대 만료일·다음 공사 착공일`, `${nm} 건물 관리 측 작업 가능 시간`, `${nm} 현장 반출 동선과 차량 위치`], s, 'vt')],
  ];
  return { heading, paras: [para1, para2], table };
}

export function compose(p: Page): Composed {
  const P = PLACES[p.place];
  const w = WORDS[p.word];
  const s = p.slug;
  const lb = p.label;      // 키워드에 쓰인 지역 표기 그대로
  const nm = P.name;       // 장소 이름 (사실 문장용)
  const kw = p.kw;
  const F = PLACE_FACTS;
  const spots = rotate(P.spots, s, 'spot').slice(0, 4);
  const nearby = rotate(P.near, s, 'near').slice(0, 4);

  // ---- 메타 ----
  const title = pick([
    `${kw} | ${nm} ${w.obj} ${w.short} - ${BRAND}`,
    `${kw} - 범위·절차부터 정리 ${BRAND}`,
    `${kw} | 현장 확인 후 견적 ${BRAND}`,
  ], s, 'title').slice(0, 60);
  const descBody = `${P.admin} ${w.short}. ${w.aim.split(' — ')[0].slice(0, 70)}.`;
  const description = `${descBody} ${BRAND} ${CONTACT.phone}`.slice(0, 158);

  const eyebrow = `${P.admin} · ${w.short}`;
  const lead = pick([
    `${nm} ${w.obj} ${w.short}. ${w.scope[0].name}부터 ${w.scope[w.scope.length - 1].name}까지, 현장을 보고 범위를 정한 뒤 진행합니다.`,
    `${j(w.aim.split(' — ')[0], '을')} ${nm} 현장 조건에 맞춰 순서대로 합니다.`,
  ], s, 'lead');

  // ---- 답 먼저 ----
  const answer = `${kw}: ${end(w.aim)} ${nm}에서는 ${w.laws[0].t}${w.laws[1] ? `·${w.laws[1].t}` : ''}부터 확인하고, ${BRAND}은 현장을 본 뒤 범위별 견적을 드립니다.`;
  const summary: [string, string][] = [
    ['현장', `${P.admin}`],
    ['범위', `${w.scope.slice(0, 3).map((x) => x.name).join(' · ')} 등`],
    ['절차', w.laws.map((l) => l.t).slice(0, 2).join(' · ')],
    ['문의', `${CONTACT.phone}${F.hours ? ` · ${F.hours}` : ''}`],
  ];

  // ---- 도입 ----
  const intro = [fill(pick(w.first, s, 'first'), nm), pick([
    `${P.kind === '시구' ? '' : `${P.gu} `}${j(nm, '은')} ${end(P.note)} ${kw} 현장도 이 건물 사정에 맞춰 범위를 잡습니다.`,
    `${j(nm, '은')} ${P.homes}이 함께 있는 곳입니다. ${kw} 문의도 건물 종류에 따라 볼 곳이 달라, 첫 통화에서 건물과 층수를 먼저 여쭙니다.`,
  ], s, 'intro2')];

  // ---- 지역 ----
  const region = {
    heading: pick([`${nm}, 이런 건물이 많습니다`, `${nm} 건물과 상권 사정`, `${lb} 현장 특징`], s, 'rh'),
    paras: [
      `${nm}에는 ${j(P.homes, '이')} 있습니다. ${end(P.note)}`,
      `${w.short} 관점에서 보면 ${end(P[w.facet === 'house' ? 'house' : w.facet === 'factory' ? 'factory' : 'shop'])} ${w.facet === 'office' ? end(P.office) : w.facet === 'edu' ? end(P.edu) : w.facet === 'food' ? end(P.food) : ''}`.trim(),
      pick([
        `${nearby.length ? `${j(nm, '과')} 가까운 ${nearby.slice(0, 3).join('·')} 쪽 ${w.short} 현장도 같은 방식으로 봅니다. ` : ''}${spots[0]} 주변처럼 차량 대기가 어려운 곳은 반출 시간을 따로 정합니다.`,
        `${F.address ? `${BRAND}은 ${F.address}에 있어 ` : ''}${nm} 현장 확인 일정을 통화로 바로 잡습니다. ${spots.slice(0, 2).join('·')} 주변 건물도 같은 기준으로 봅니다.`,
      ], s, 'rp3'),
    ],
    spots,
    nearby,
  };

  const view = viewFor(p, P, w, nm, s);

  // ---- 견적 전 확인 ----
  const pics = photosFor(p, 6);
  const sp = rotate(pics, s, 'sp')[0];
  const checks = {
    heading: pick([`${lb} ${w.short} 견적 전에 확인할 것`, `${nm} ${w.obj}, 이런 경우라면 미리 말씀해 주세요`, `${nm} ${w.short} 체크리스트`], s, 'ch'),
    sub: pick([`해당하는 항목이 있으면 ${nm} 현장 확인 때 같이 봅니다. ${kw} 견적이 달라지는 항목입니다.`, `${kw} 상담 전에 아래 가운데 해당하는 것을 골라 두시면 통화가 짧아집니다.`], s, 'chs'),
    items: rotate(w.checks, s, 'chk').slice(0, 5),
    photo: { img: sp.img, alt: `${kw} 관련 ${BRAND} ${sp.scene}`, cap: `${sp.scene} · ${BRAND} 플레이스 사진` },
  };

  // ---- 범위 ----
  const scope = {
    heading: `${nm} ${w.short} — 하는 일`,
    text: pick([
      `${kw} 현장에서 맡는 작업입니다. ${nm} 현장에 따라 필요한 것만 골라 견적을 냅니다.`,
      `${lb} 상담 때 아래 가운데 어떤 작업이 필요한지 현장을 보고 설명드립니다.`,
      `${nm} 현장은 한 가지 작업으로 끝나지 않을 때가 많아, 필요한 작업을 묶어 견적을 드립니다.`,
    ], s, 'sc'),
    list: rotate(w.scope, s, 'scope'),
  };

  // ---- 제도 ----
  const laws = {
    heading: pick([`${kw} 전에 챙길 제도와 서류`, `${nm} ${w.short}, 절차부터`, `${w.short}에 따라오는 신고·확인`], s, 'lh'),
    sub: `${kw} 현장에 일반적으로 해당하는 내용입니다. 실제 대상 여부는 ${P.gu ? `${P.gu.split('·')[0]}청` : '관할 구청'} 등 관할 기관 기준을 따릅니다.`,
    list: w.laws,
  };

  // ---- 수식어 관점 ----
  const M = MOD[p.mod] || MOD[''];
  const mod = { heading: M.head(kw), lead: M.lead(kw, `${nm} ${w.obj}`), items: M.items(w) };

  // ---- 사진 ----
  const picked = photosFor(p, 3);
  const capTail = [`${nm} 현장도 같은 순서로 작업합니다.`, `${lb} 상담 때 이 사진처럼 과정을 보여 드립니다.`, `${nm} ${w.obj}에서도 거치는 단계입니다.`];
  const photos = {
    heading: pick([`${BRAND} 현장 사진`, `사진으로 보는 ${w.short} 작업`, `${BRAND} 작업 기록`], s, 'ph'),
    sub: `${BRAND}이 네이버 플레이스에 올린 업체 사진입니다. 방문자 리뷰 사진은 쓰지 않았습니다.`,
    items: picked.map((c, i) => ({ p: c, alt: `${kw} - ${BRAND} ${c.scene}`, caption: `${c.scene}. ${capTail[(seedOf(s) + i) % capTail.length]}` })),
  };
  const heroP = rotate(photosFor(p, 4), s, 'hero')[0];
  const hero = { img: heroP.img, alt: `${kw} - ${BRAND} ${heroP.scene}`, cap: heroP.scene };

  // ---- 진행 순서 ----
  const tails = [
    [`${nm} 주소와 함께 말씀해 주세요.`, `${lb} 현장 사진이 있으면 더 정확합니다.`],
    [`${nm} ${w.obj} 구조에 맞춰 정합니다.`, '정한 내용은 견적서에 적습니다.'],
    [`${lb} 현장 상태를 사진으로 남깁니다.`, '추가 작업이 생기면 먼저 상의합니다.'],
    [`${nm} 현장 조건에 맞춰 진행합니다.`, '안내한 범위대로 진행합니다.'],
    [`${nm} 현장 마무리를 확인합니다.`, `${lb} 작업 내역을 정리해 드립니다.`],
  ];
  const steps = w.steps.map((st, i) => ({ title: st.title, text: `${st.text} ${pick(tails[i], s, `st${i}`)}` }));

  // ---- 상담 전 정리 ----
  const tell = {
    heading: pick([`${nm}에서 연락 주실 때 알려 주시면 좋은 것`, `${lb} ${w.short} 상담 전 정리할 다섯 가지`], s, 'tell'),
    items: w.tell,
    text: `위 내용과 ${nm} 현장 주소, 사진을 함께 알려 주시면 ${kw} 현장 확인 때 필요한 것을 미리 챙겨 갈 수 있습니다.`,
  };

  // ---- 안내 표 ----
  const info: [string, string][] = [
    ['지역', P.admin],
    ['주변', spots.join(' · ')],
    ['건물 유형', P.homes],
    ['상호', BRAND],
    ['전화', CONTACT.phone],
    ...(F.address ? [['업체 주소', F.address] as [string, string]] : []),
  ];

  // ---- FAQ ----
  const common = [
    { q: `${nm}까지 현장 확인을 오나요?`, a: `${F.area ? `${end(F.area)} ` : ''}${nm} 현장 확인 일정은 통화로 정합니다. 현장을 보고 범위별 견적을 드립니다.` },
    { q: `${w.short} 견적은 어떻게 받나요?`, a: `${CONTACT.phone}로 전화하시거나 네이버 플레이스로 문의해 주세요. ${nm} 현장 주소와 사진이 있으면 상담이 빨라집니다.` },
    { q: `${lb} ${w.short} 작업 기간은 얼마나 걸리나요?`, a: `면적, 철거 범위, 반출 동선, 건물 작업 시간 제한에 따라 다릅니다. ${nm} 현장을 본 뒤 일정을 함께 안내합니다.` },
  ];
  const faqTail = [`${nm} 현장도 같은 기준으로 봅니다.`, `${kw} 상담 때 함께 설명드립니다.`, `${lb} 현장이라면 현장 확인 때 정합니다.`];
  const own = w.faq.map((f, i) => ({ q: i === 0 ? `${lb} ${f.q}` : f.q, a: `${f.a} ${faqTail[(seedOf(s) + i) % faqTail.length]}` }));
  const faq = [...rotate(own, s, 'faq1').slice(0, 3), ...rotate(common, s, 'faq2').slice(0, 2)];

  // ---- 마무리 ----
  const closing = pick([
    { heading: `${nm} 현장 주소와 범위만 알려 주세요`, text: `현장을 확인하고 범위별로 견적을 드립니다. ${CONTACT.phone}` },
    { heading: `${lb} ${w.short}, 범위부터 정확히`, text: `뜯을 것과 남길 것을 먼저 정하고 시작합니다. ${CONTACT.phone}` },
    { heading: `${nm} 현장 사진을 먼저 보내 주세요`, text: `사진을 보면 통화 때 바로 이어서 설명드릴 수 있습니다. ${CONTACT.phone}` },
  ], s, 'close');

  const ticker = [nm, ...spots, ...nearby, ...w.scope.slice(0, 3).map((x) => x.name)].slice(0, 10);
  const cta = fill(pick(w.cta, s, 'cta'), nm);

  return {
    title, description, eyebrow, lead, answer, summary, hero, intro, region, view, checks, scope, laws, mod, photos,
    steps, stepsHeading: `${lb} ${w.short} 진행 순서`, tell, info, faq, closing, ticker, cta,
  };
}
