// 데이터 로더 — data/site-pages.json(키워드 페이지), places.json(대전 장소), photos.json(플레이스 업체 사진). 빌드 전용.
import pagesData from '../data/site-pages.json';
import placesData from '../data/places.json';
import photosData from '../data/photos.json';
import { OPEN_WAVE, MERGE_VARIANTS } from './site';

export type Word = '철거' | '상가철거' | '식당철거' | '원상복구' | '완파' | '미용실철거' | '학원철거' | '공장철거' | '폐업철거';
export interface Page {
  n: number; kw: string; slug: string; label: string; place: string; unit: string;
  word: Word; mod: string; prio: number; wave: number; variantOf?: string;
}
export interface Place {
  key: string; name: string; kind: '시구' | '생활권'; gu: string; admin: string; near: string[];
  homes: string; note: string; spots: string[];
  shop: string; food: string; edu: string; factory: string; house: string; office: string;
}
export interface Photo { img: string; scene: string; tags: string[]; w: number; h: number }

export const ALL_PAGES = pagesData.pages as Page[];
export const OPEN_PAGES = ALL_PAGES.filter((p) => p.wave <= OPEN_WAVE);
const openSet = new Set(OPEN_PAGES.map((p) => p.slug));
export const isOpen = (slug: string) => openSet.has(slug);

export const PLACES = placesData.places as Record<string, Place>;
export const PLACE_ORDER = Object.keys(PLACES);
export const PHOTOS = photosData.photos as Photo[];

export const pagePath = (p: Page) => `/${p.slug}/`;
export const pageEncodedPath = (p: Page) => `/${encodeURIComponent(p.slug)}/`;
export const placePath = (k: string) => `/area/${k}/`;
export const placeEncodedPath = (k: string) => `/area/${encodeURIComponent(k)}/`;

// canonical: 스위치가 켜져 있고 대표 페이지가 열려 있으면 대표 페이지로
export const canonicalPath = (p: Page) =>
  MERGE_VARIANTS && p.variantOf && openSet.has(p.variantOf) ? `/${encodeURIComponent(p.variantOf)}/` : pageEncodedPath(p);
export const inSitemap = (p: Page) => canonicalPath(p) === pageEncodedPath(p);

export function getPage(slug: string): Page | undefined {
  let key = slug;
  try { key = decodeURIComponent(slug); } catch {}
  return OPEN_PAGES.find((p) => p.slug === key);
}

export const openPlaces = () => PLACE_ORDER.filter((k) => OPEN_PAGES.some((p) => p.place === k));
export const placePages = (k: string) => OPEN_PAGES.filter((p) => p.place === k);

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h;
};
export const seedOf = hash;
export const rotate = <T,>(arr: T[], seed: string, salt = ''): T[] => {
  if (!arr.length) return arr;
  const k = hash(`${seed}::${salt}`) % arr.length;
  return [...arr.slice(k), ...arr.slice(0, k)];
};

// 관련 페이지 — 열린 대표 페이지만. 같은 장소 다른 단어 / 같은 단어 이웃 장소 / 같은 장소·단어 다른 수식어
export function related(p: Page) {
  const pool = OPEN_PAGES.filter((x) => x.slug !== p.slug && inSitemap(x));
  const P = PLACES[p.place];
  const samePlace = rotate(pool.filter((x) => x.place === p.place && x.word !== p.word && x.mod === ''), p.slug, 'sp').slice(0, 8);
  const sameWord = rotate(pool.filter((x) => x.word === p.word && x.place !== p.place && x.mod === p.mod && P.near.includes(x.place)), p.slug, 'sw')
    .concat(rotate(pool.filter((x) => x.word === p.word && x.place !== p.place && x.mod === p.mod && !P.near.includes(x.place)), p.slug, 'sw2'))
    .slice(0, 8);
  const sameMod = pool.filter((x) => x.place === p.place && x.word === p.word);
  return { samePlace, sameWord, sameMod };
}

// 사진 배정 — 단어에 맞는 태그 사진을 앞에, 슬러그 해시로 돌린다
export function photosFor(p: Page, n = 3): Photo[] {
  const fit = rotate(PHOTOS.filter((c) => c.tags.includes(p.word)), p.slug, 'ph');
  const rest = rotate(PHOTOS.filter((c) => !c.tags.includes(p.word)), p.slug, 'ph2');
  return [...fit, ...rest].slice(0, n);
}
