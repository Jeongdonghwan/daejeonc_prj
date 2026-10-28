import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/site';
import { OPEN_PAGES, openPlaces, placeEncodedPath, pageEncodedPath, inSitemap } from '../lib/data';

// 빌드 시 out/sitemap.xml — 열린 단계(OPEN_WAVE)의 대표 페이지만 (표기 변형은 canonical 대상이라 제외)
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/area/`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    ...openPlaces().map((k) => ({ url: `${SITE_URL}${placeEncodedPath(k)}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...OPEN_PAGES.filter(inSitemap).map((p) => ({
      url: `${SITE_URL}${pageEncodedPath(p)}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: p.unit === '시구' ? 0.8 : 0.6,
    })),
  ];
}
