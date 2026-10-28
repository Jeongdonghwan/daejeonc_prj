// 사이트 설정 — 상호·연락처·도메인은 이 파일만 고치면 전 페이지에 반영된다.
// 근거: 네이버 플레이스 https://m.place.naver.com/place/1297541290 (홈·정보·사진·리뷰 탭, 확인일은 PLACE_FACTS.checked)

// TODO(도메인 확정 후): SITE_URL 환경변수로 넘기거나 기본값 교체. 배포: bash scripts/deploy.sh <단계> <URL>
export const SITE_URL = process.env.SITE_URL || 'https://daejeon-demo.example';
export const PLACE_URL = 'https://m.place.naver.com/place/1297541290';

// ---- 플레이스에서 확인한 사실만 (없는 값은 빈 문자열로 두고 화면에 안 나오게) ----
export const PLACE_FACTS = {
  checked: '',
  name: '',
  category: '',
  phone: '',
  placePhone: '',
  address: '',
  hours: '',
  area: '',
  intro: '',
  menu: [] as { name: string; price: string; d?: string }[],
  links: [] as { label: string; url: string }[],
  reviews: { visitor: 0, blog: 0 },
};

export const BRAND = PLACE_FACTS.name || '대전 철거';
export const SITE_NAME = `${BRAND} | 대전 철거·원상복구`;

export const CONTACT = { phone: PLACE_FACTS.phone, hours: PLACE_FACTS.hours };

// 순차 오픈: 이 단계 이하의 페이지만 빌드·사이트맵·내부링크에 포함된다. 단계 = 키워드 엑셀 우선순위
//   OPEN_WAVE=1 npx next build  (1 = 대전 대표 18 / 2 = 전체 999)
export const OPEN_WAVE = Number(process.env.OPEN_WAVE || 2);

// 표기만 다른 키워드(대전/대전시/대전광역시, 유성/유성구/대전 유성구/대전 유성, 둔산/둔산동, 도안/도안신도시)는 대표 페이지로 canonical + 사이트맵 제외
export const MERGE_VARIANTS = true;

export const tel = `tel:${CONTACT.phone.replace(/[^0-9]/g, '')}`;
export const absUrl = (path: string) => `${SITE_URL}${path}`;

// og·트위터 카드: public/og/<key>.jpg (scripts/make_og.py 로 생성)
export const shareMeta = (key: string, alt: string, o: { title?: string; description?: string; url?: string } = {}) => {
  const images = [{ url: `${SITE_URL}/og/${encodeURIComponent(key)}.jpg`, width: 1200, height: 630, alt }];
  return {
    openGraph: { type: 'website' as const, siteName: SITE_NAME, locale: 'ko_KR', ...o, images },
    twitter: { card: 'summary_large_image' as const, title: o.title, description: o.description, images },
  };
};
