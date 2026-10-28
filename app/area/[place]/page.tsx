import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PLACES, openPlaces, placePages, placeEncodedPath, pagePath, pageEncodedPath, inSitemap, Word } from '../../../lib/data';
import { WORDS } from '../../../lib/words';
import { breadcrumbJsonLd, itemListJsonLd } from '../../../lib/jsonld';
import { Actions, IconArrow, JsonLd, SectionHead } from '../../../components/Common';
import { BRAND, shareMeta } from '../../../lib/site';
import { j } from '../../../lib/ko';

export const dynamicParams = false;
export function generateStaticParams() {
  return openPlaces().map((place) => ({ place }));
}
const dec = (s: string) => { try { return decodeURIComponent(s); } catch { return s; } };

export function generateMetadata({ params }: { params: { place: string } }): Metadata {
  const k = dec(params.place);
  const P = PLACES[k];
  if (!P) return {};
  const title = `${k} 철거·원상복구 지역 안내 | ${BRAND}`;
  const description = `${P.admin} 상가철거, 식당철거, 원상복구, 완파, 미용실·학원·공장·폐업 철거 안내 모음. ${k} 건물·상권 사정과 단어별 페이지로 이어집니다.`;
  return { title, description, alternates: { canonical: placeEncodedPath(k) }, ...shareMeta(`area-${k}`, `${k} 철거 안내`, { title, description, url: placeEncodedPath(k) }) };
}

export default function PlaceHub({ params }: { params: { place: string } }) {
  const k = dec(params.place);
  const P = PLACES[k];
  if (!P) notFound();
  const pages = placePages(k);
  const words = Array.from(new Set(pages.map((p) => p.word))) as Word[];
  return (
    <main>
      <JsonLd data={[
        breadcrumbJsonLd([{ name: '홈', path: '/' }, { name: '지역', path: '/area/' }, { name: `${k} 철거 안내`, path: placeEncodedPath(k) }]),
        itemListJsonLd(pages.filter(inSitemap).map((p) => ({ name: p.kw, path: pageEncodedPath(p), image: `/og/${encodeURIComponent(p.slug)}.jpg` }))),
      ]} />
      <div className="wrap content page-top">
        <p className="eyebrow dark">{P.admin}</p>
        <h1 className="page-title">{k} 철거·원상복구 지역 안내</h1>
        <p className="prose-p">{k}에는 {j(P.homes, '이')} 있습니다. {P.note}.</p>
        <Actions />
        <section className="sec">
          <SectionHead no="01" title={`${k} 건물·상권 사정`} />
          <dl className="spec" data-reveal>
            <div><dt>상권</dt><dd>{P.shop}.</dd></div>
            <div><dt>음식점</dt><dd>{P.food}.</dd></div>
            <div><dt>학원</dt><dd>{P.edu}.</dd></div>
            <div><dt>주택</dt><dd>{P.house}.</dd></div>
            <div><dt>임대 공간</dt><dd>{P.office}.</dd></div>
            <div><dt>공장</dt><dd>{P.factory}.</dd></div>
          </dl>
        </section>
        {words.map((w, i) => (
          <section key={w} className="sec">
            <SectionHead no={String(i + 2).padStart(2, '0')} title={`${k} ${w}`} sub={WORDS[w].aim} />
            <ul className="area-list" data-reveal>
              {pages.filter((p) => p.word === w).map((p) => <li key={p.slug}><Link href={pagePath(p)}>{p.kw}</Link></li>)}
            </ul>
          </section>
        ))}
        <p><Link href="/area/" className="more">다른 지역 보기 <IconArrow /></Link></p>
      </div>
    </main>
  );
}
