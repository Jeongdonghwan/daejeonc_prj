// 소개 — 사실만 평서문으로 (무엇을·어디서·어떻게 연락). 네이버 플레이스에서 확인한 값(PLACE_FACTS)만 쓴다. 없는 정보는 줄을 내지 않는다.
import type { Metadata } from 'next';
import Link from 'next/link';
import { openPlaces } from '../../lib/data';
import { breadcrumbJsonLd } from '../../lib/jsonld';
import { JsonLd } from '../../components/Common';
import { BRAND, CONTACT, PLACE_FACTS as F, PLACE_URL, UPDATED, tel, shareMeta } from '../../lib/site';

const TITLE = `소개 | ${BRAND}`;
const DESC = '대전에서 건물철거·실내철거·원상복구를 하는 업체입니다. 하는 일, 다니는 지역, 연락 방법을 네이버 플레이스 정보대로 정리했습니다.';
export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: '/about/' },
  ...shareMeta('home', `${BRAND} 대전 철거·원상복구`, { title: TITLE, description: DESC, url: '/about/' }),
};

// 업체 구조화 데이터(HomeAndConstructionBusiness)는 layout 에서 전 페이지에 들어간다
export default function About() {
  return (
    <main>
      <JsonLd data={breadcrumbJsonLd([{ name: '홈', path: '/' }, { name: '소개', path: '/about/' }])} />
      <div className="wrap content page-top">
        <h1 className="page-title">{BRAND} 소개</h1>
        <p className="prose-p">{F.intro.split('\n')[0]}</p>
        <section className="sec">
          <h2 className="area-h">하는 일</h2>
          <p className="prose-p">{F.menu.map((m) => m.name).join(', ')} 작업을 합니다.{F.category && ` 네이버 플레이스 업종은 ${F.category}입니다.`}</p>
        </section>
        <section className="sec">
          <h2 className="area-h">다니는 지역</h2>
          <p className="prose-p">{openPlaces().join(', ')} 지역을 안내합니다. {F.area}. 장소별 안내는 <Link href="/area/">지역 안내</Link>에 있습니다.</p>
        </section>
        <section className="sec">
          <h2 className="area-h">연락 방법</h2>
          <p className="prose-p">전화 <a href={tel}>{CONTACT.phone}</a>로 받습니다.{F.hours && ` 영업시간은 ${F.hours}입니다.`}</p>
          {F.address && <p className="prose-p">주소는 {F.address}입니다.</p>}
          <p className="prose-p">업체 정보는 <a href={PLACE_URL} target="_blank" rel="noopener">네이버 플레이스</a>에서 확인한 내용입니다{F.checked ? ` (${F.checked} 확인)` : ''}.</p>
          <p className="prose-p">이 페이지의 최종 수정일은 <time dateTime={UPDATED}>{UPDATED}</time>입니다.</p>
        </section>
      </div>
    </main>
  );
}
