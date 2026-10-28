import type { Metadata } from 'next';
import Link from 'next/link';
import { OPEN_PAGES, PLACES, PHOTOS, openPlaces, placePages, placePath, pagePath, pageEncodedPath, inSitemap, Word } from '../lib/data';
import { WORDS } from '../lib/words';
import { BRAND, CONTACT, PLACE_FACTS, shareMeta } from '../lib/site';
import { faqJsonLd, itemListJsonLd } from '../lib/jsonld';
import { Actions, IconArrow, JsonLd, PhoneBlock, PlaceLink, SectionHead, Ticker } from '../components/Common';

const HOME_TITLE = `${BRAND} | 대전 철거·상가철거·원상복구`;
const HOME_DESC = `${BRAND} — 대전 상가·식당·미용실·학원·공장·폐업 철거와 원상복구, 완파. 현장을 보고 범위를 정한 뒤 견적을 드립니다. 중구·서구·유성구 지역별 안내.`;
export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESC,
  alternates: { canonical: '/', types: { 'application/rss+xml': '/rss.xml' } },
  ...shareMeta('home', `${BRAND} 대전 철거·원상복구`, { title: HOME_TITLE, description: HOME_DESC, url: '/' }),
};

const WORD_ORDER: Word[] = ['상가철거', '식당철거', '원상복구', '완파', '미용실철거', '학원철거', '공장철거', '폐업철거', '철거'];

// 메인 FAQ — 철거 일반 제도(정확한 것만) + 플레이스 정보
const FAQ = [
  { q: '내부 인테리어 철거도 구청 신고가 필요한가요?', a: '주요구조부를 건드리지 않는 내부 철거는 보통 해체 허가·신고 대상이 아닙니다. 건물을 통째로 허무는 완파는 건축물관리법에 따라 규모에 맞춰 해체 신고 또는 허가를 먼저 받습니다.' },
  { q: '원상복구는 어디까지 해야 하나요?', a: '임대 계약서 특약과 입점 당시 상태가 기준입니다. 범위가 애매하면 철거 전에 건물주와 맞춰 두는 편이 다툼이 없습니다.' },
  { q: '석면 조사는 언제 하나요?', a: '일정 규모 이상의 건축물을 해체할 때 필요합니다. 석면이 확인되면 등록된 석면해체·제거업자가 먼저 제거합니다.' },
  { q: '폐기물은 어떻게 처리하나요?', a: '목재·석고·금속·혼합 폐기물을 나눠 담아 허가받은 처리업체로 보냅니다.' },
  { q: '견적은 어떻게 받나요?', a: `${CONTACT.phone}로 전화하시거나 네이버 플레이스로 문의해 주세요. 현장 주소와 사진이 있으면 상담이 빨라집니다.` },
];

export default function Home() {
  const places = openPlaces();
  // 메인 캐러셀: 장소별 대표(수식어 없는) 페이지 (최대 30)
  const hubs = OPEN_PAGES.filter((p) => inSitemap(p) && p.mod === '').slice(0, 30);
  const tickerNames = places.map((k) => PLACES[k].name);
  const wordLink = (w: Word) => OPEN_PAGES.find((p) => inSitemap(p) && p.word === w && p.place === '대전' && p.mod === '') || OPEN_PAGES.find((p) => p.word === w);
  const heroImg = PHOTOS[0];
  const F = PLACE_FACTS;

  return (
    <main>
      <JsonLd data={[faqJsonLd(FAQ), itemListJsonLd(hubs.map((p) => ({ name: p.kw, path: pageEncodedPath(p), image: `/og/${encodeURIComponent(p.slug)}.jpg` })))]} />
      <section className="hero hero-home">
        <div className="wrap hero-grid">
          <div className="hero-text">
            <p className="eyebrow">{F.category || '철거'} · 대전광역시{F.hours ? ` · ${F.hours}` : ''}</p>
            <h1><span><i>대전 철거·원상복구</i></span><span><i>{BRAND}</i></span></h1>
            <p className="hero-lead">상가 · 식당 · 미용실 · 학원 · 공장 · 폐업 철거, 원상복구, 완파. 뜯을 것과 남길 것을 현장에서 먼저 정하고 시작합니다.</p>
            <Actions />
            <dl className="facts">
              <div><dt>PHONE</dt><dd>{CONTACT.phone}</dd></div>
              {F.reviews.visitor > 0 && <div><dt>방문자 리뷰</dt><dd><b data-count={F.reviews.visitor}>{F.reviews.visitor}</b></dd></div>}
              {F.reviews.blog > 0 && <div><dt>블로그 리뷰</dt><dd><b data-count={F.reviews.blog}>{F.reviews.blog}</b></dd></div>}
              <div><dt>지역 페이지</dt><dd><b data-count={places.length}>{places.length}</b></dd></div>
            </dl>
          </div>
          <figure className="hero-photo mask">
            <img src={`/img/${heroImg.img}.webp`} alt={`${BRAND} 대전 철거 ${heroImg.scene}`} width={heroImg.w} height={heroImg.h} />
            <figcaption><b>{BRAND}</b>{heroImg.scene}</figcaption>
          </figure>
        </div>
      </section>
      <div className="hazard" aria-hidden="true" />

      <Ticker items={tickerNames} />

      <div className="wrap content">
        <section className="sec">
          <SectionHead no="01" title="철거 종류별 안내" sub="현장마다 뜯는 대상과 먼저 끊을 설비, 따라오는 절차가 다릅니다." />
          <ol className="works">
            {WORD_ORDER.map((w, i) => {
              const lk = wordLink(w);
              return (
                <li key={w} data-reveal style={{ transitionDelay: `${(i % 2) * 80}ms` }}>
                  <span className="works-no">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{w}</h3>
                    <p>{WORDS[w].aim}</p>
                    {lk && <Link href={pagePath(lk)} className="more">{lk.kw} <IconArrow /></Link>}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </div>

      {F.menu.length > 0 && (
        <section className="band">
          <div className="wrap">
            <SectionHead no="02" title="플레이스에 올린 서비스" sub="네이버 플레이스 메뉴(서비스) 항목 그대로입니다. 실제 비용은 현장 확인 뒤 정해집니다." />
            <ol className="tools reveal-group">{F.menu.map((m) => <li key={m.name}><div><h3>{m.name}{m.price ? ` · ${m.price}` : ''}</h3>{m.d && <p>{m.d}</p>}</div></li>)}</ol>
          </div>
        </section>
      )}

      <div className="wrap content">
        <section className="sec">
          <SectionHead no="03" title={`${BRAND} 현장 사진`} sub="네이버 플레이스에 업체가 올린 사진입니다. 방문자 리뷰 사진은 쓰지 않았습니다." />
          <div className="rail-nav">
            <button type="button" data-scroll="-1" data-target="case-rail" aria-label="이전 사진">←</button>
            <button type="button" data-scroll="1" data-target="case-rail" aria-label="다음 사진">→</button>
          </div>
          <div className="rail" id="case-rail">
            {PHOTOS.map((k, i) => (
              <figure key={k.img} data-reveal style={{ transitionDelay: `${(i % 4) * 70}ms` }}>
                <div className="ph"><img src={`/img/${k.img}.webp`} alt={`${BRAND} 대전 철거 사진 - ${k.scene}`} loading="lazy" /></div>
                <figcaption><b>{k.tags[0]}</b>{k.scene}</figcaption>
              </figure>
            ))}
          </div>
          <p data-reveal><PlaceLink label="플레이스에서 사진 전체 보기" /></p>
        </section>
      </div>

      <section className="cta-band" data-reveal>
        <div className="wrap cta-band-in">
          <p>임대 만료일, 다음 공사 착공일.<br />날짜에 맞춰 범위를 나누고 비웁니다.</p>
          <Actions place={false} />
        </div>
      </section>

      <div className="wrap content">
        {F.intro && (
          <section className="sec mist">
            <SectionHead no="04" title="업체 소개" sub="네이버 플레이스 소개 글입니다." />
            <div className="cols">
              <div className="prose" data-reveal>{F.intro.split('\n').filter(Boolean).map((t, i) => <p key={i} className={i === 0 ? 'first' : ''}>{t}</p>)}</div>
              <dl className="info" data-reveal>
                <div><dt>상호</dt><dd>{BRAND}</dd></div>
                {F.category && <div><dt>업종</dt><dd>{F.category}</dd></div>}
                {F.address && <div><dt>주소</dt><dd>{F.address}</dd></div>}
                {F.hours && <div><dt>영업시간</dt><dd>{F.hours}</dd></div>}
                <div><dt>전화</dt><dd>{CONTACT.phone}</dd></div>
                {F.links.map((l) => <div key={l.url}><dt>{l.label}</dt><dd><a href={l.url} target="_blank" rel="noopener">{l.url.replace(/^https?:\/\//, '')}</a></dd></div>)}
              </dl>
            </div>
          </section>
        )}

        <section className="sec">
          <SectionHead no="05" title="대전 지역 안내" sub="지역을 고르면 그 동네 건물·상권 사정과 철거 종류별 안내로 이어집니다." />
          <div className="cities">
            {places.map((k) => (
              <Link key={k} href={placePath(k)} className="city-row" data-reveal>
                <div><b>{k}</b><span>{PLACES[k].admin}</span></div>
                <em>{placePages(k).length}</em>
              </Link>
            ))}
          </div>
          <ul className="linklist" style={{ marginTop: 28 }}>
            {hubs.slice(0, 12).map((p) => <li key={p.slug}><Link href={pagePath(p)}>{p.kw}<IconArrow /></Link></li>)}
          </ul>
          <p data-reveal><Link href="/area/" className="more">전체 지역 페이지 <IconArrow /></Link></p>
        </section>

        <section className="sec mist">
          <SectionHead no="06" title="자주 묻는 질문" />
          <div className="faq">{FAQ.map((f) => <details key={f.q} data-reveal><summary>{f.q}<i /></summary><p>{f.a}</p></details>)}</div>
        </section>
      </div>

      <section className="closing">
        <div className="wrap" data-reveal>
          <h2>현장 주소와 범위만 알려 주세요</h2>
          <p>뜯을 것과 남길 것, 일정, 폐기물까지 현장에서 정리해 견적을 드립니다.</p>
          <div className="actions"><PhoneBlock label="전화상담 " /><PlaceLink /></div>
        </div>
      </section>
    </main>
  );
}
