import { SITE_URL, SITE_NAME, BRAND, CONTACT, PLACE_FACTS, PLACE_URL } from './site';

// 업체 — 플레이스에서 확인한 값만 넣는다(주소가 없으면 address 생략)
export const businessJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'HomeAndConstructionBusiness',
  '@id': `${SITE_URL}/#business`,
  name: BRAND,
  url: `${SITE_URL}/`,
  image: `${SITE_URL}/og/home.jpg`,
  telephone: CONTACT.phone,
  ...(PLACE_FACTS.address ? { address: { '@type': 'PostalAddress', addressCountry: 'KR', streetAddress: PLACE_FACTS.address } } : {}),
  sameAs: [PLACE_URL, ...PLACE_FACTS.links.map((l) => l.url)],
  areaServed: { '@type': 'City', name: '대전광역시' },
  knowsAbout: ['철거', '상가철거', '식당철거', '원상복구', '완파', '미용실철거', '학원철거', '공장철거', '폐업철거'],
});

export const webSiteJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  inLanguage: 'ko',
  publisher: { '@id': `${SITE_URL}/#business` },
});

export const breadcrumbJsonLd = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: `${SITE_URL}${it.path}` })),
});

export const faqJsonLd = (faqs: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

export const serviceJsonLd = (o: { name: string; type: string; description: string; path: string; area: string; image: string }) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: o.name,
  serviceType: o.type,
  description: o.description,
  url: `${SITE_URL}${o.path}`,
  image: `${SITE_URL}${o.image}`,
  areaServed: { '@type': 'Place', name: o.area },
  provider: { '@id': `${SITE_URL}/#business` },
});

// 관련 페이지·허브 목록(캐러셀). path 는 인코딩된 경로
export const itemListJsonLd = (items: { name: string; path: string; image?: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}${it.path}`, name: it.name, ...(it.image ? { image: `${SITE_URL}${it.image}` } : {}) })),
});
