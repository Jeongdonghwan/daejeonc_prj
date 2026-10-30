import type { Metadata } from 'next';
import Link from 'next/link';
import { OPEN_PAGES, PLACES, openPlaces, placePages, placePath, placeEncodedPath, pagePath, pageEncodedPath, inSitemap } from '../../lib/data';
import { breadcrumbJsonLd, itemListJsonLd } from '../../lib/jsonld';
import { IconArrow, JsonLd } from '../../components/Common';
import { BRAND, shareMeta } from '../../lib/site';

const TITLE = `대전 지역별 철거·원상복구 안내 | ${BRAND}`;
const DESC = '대전 중구·서구·유성구와 둔산·도안·노은·봉명·관저·은행·대흥·탄방·월평·갈마·죽동·대덕연구단지의 상가·식당·미용실·학원·공장·폐업 철거, 원상복구, 완파 안내 모음.';
export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: '/area/' },
  ...shareMeta('area', '대전 지역별 철거·원상복구 안내', { title: TITLE, description: DESC, url: '/area/' }),
};

// 열린 모든 키워드 페이지로 가는 크롤 경로 (장소별)
export default function AreaIndex() {
  const places = openPlaces();
  return (
    <main>
      <JsonLd data={[
        breadcrumbJsonLd([{ name: '홈', path: '/' }, { name: '지역', path: '/area/' }]),
        itemListJsonLd([
          ...places.map((k) => ({ name: `${k} 철거 안내`, path: placeEncodedPath(k), image: `/og/${encodeURIComponent(`area-${k}`)}.jpg` })),
          ...OPEN_PAGES.filter(inSitemap).map((p) => ({ name: p.kw, path: pageEncodedPath(p) })),
        ]),
      ]} />
      <div className="wrap content page-top">
        <p className="eyebrow dark">지역</p>
        <h1 className="page-title">대전 지역별 철거·원상복구 안내</h1>
        <p className="prose-p">{BRAND}가 다니는 대전 지역 안내 페이지입니다. 지금 {OPEN_PAGES.length.toLocaleString()}개가 열려 있습니다.</p>
        <section className="sec">
          <h2 className="area-h">장소</h2>
          <div className="cities">
            {places.map((k) => (
              <Link key={k} href={placePath(k)} className="city-row">
                <div><b>{k}</b><span>{PLACES[k].admin}</span></div>
                <em>{placePages(k).length}</em>
              </Link>
            ))}
          </div>
        </section>
        {places.map((k) => (
          <section key={k} className="sec">
            <h2 className="area-h"><Link href={placePath(k)}>{k} <IconArrow /></Link></h2>
            <ul className="area-list">
              {placePages(k).map((p) => <li key={p.slug}><Link href={pagePath(p)}>{p.kw}</Link></li>)}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
