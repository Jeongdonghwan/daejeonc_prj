// 사이트 설정 — 상호·연락처·도메인은 이 파일만 고치면 전 페이지에 반영된다.
// 근거: 네이버 플레이스 https://m.place.naver.com/place/1297541290 (홈·정보·사진·리뷰 탭, 확인일은 PLACE_FACTS.checked)

// TODO(도메인 확정 후): SITE_URL 환경변수로 넘기거나 기본값 교체. 배포: bash scripts/deploy.sh <단계> <URL>
export const SITE_URL = process.env.SITE_URL || 'https://daejeon-demo.example';
export const PLACE_URL = 'https://m.place.naver.com/place/1297541290';

// ---- 플레이스에서 확인한 사실만 (없는 값은 빈 문자열로 두고 화면에 안 나오게) ----
export const PLACE_FACTS = {
  checked: '2026-10-30',
  name: '대전철거',
  category: '건물·구축물 해체공사',
  phone: '010-4076-1172', // 플레이스 소개글의 상담문의 번호
  placePhone: '0507-1413-1624', // 플레이스 안심번호
  address: '대전 서구 괴정로198번길 64',
  hours: '', // 플레이스에 영업시간 없음
  area: '플레이스에 방문접수·출장이 표시된 업체입니다',
  intro: '대전철거는 건물철거·실내철거·인테리어철거·구조물철거·원상복구를 하는 업체입니다.\n필요할 때 연락 주시면 상담해 드립니다.',
  menu: ['철거', '건물철거', '실내철거', '인테리어철거', '인테리어원상복구', '구조물철거'].map((name) => ({ name, price: '' })) as { name: string; price: string; d?: string }[],
  links: [] as { label: string; url: string }[],
  reviews: { visitor: 75, blog: 624 },
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
