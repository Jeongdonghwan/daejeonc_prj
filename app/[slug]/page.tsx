import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OPEN_PAGES, PLACES, getPage, pagePath, pageEncodedPath, canonicalPath, placePath, placeEncodedPath, related } from '../../lib/data';
import { composeRay } from '../../lib/ray';
import { breadcrumbJsonLd, faqJsonLd, itemListJsonLd, serviceJsonLd } from '../../lib/jsonld';
import { BRAND, shareMeta } from '../../lib/site';
import { Actions, IconArrow, JsonLd, PlaceLink } from '../../components/Common';

export const dynamicParams = false;

// 순차 오픈: lib/site.ts 의 OPEN_WAVE 이하 페이지만 생성
export function generateStaticParams() {
  return OPEN_PAGES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getPage(params.slug);
  if (!p) return {};
  const c = composeRay(p);
  const url = canonicalPath(p);
  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: url },
    ...shareMeta(p.slug, `${p.kw} - ${BRAND}`, { title: c.title, description: c.description, url }),
  };
}

export default function KeywordPage({ params }: { params: { slug: string } }) {
  const p = getPage(params.slug);
  if (!p) notFound();
  const c = composeRay(p);
  const P = PLACES[p.place];
  const rel = related(p, 5);
  const path = pageEncodedPath(p);
  const relAll = [...rel.sameMod, ...rel.samePlace, ...rel.sameWord];
  const relList = relAll.map((x) => ({ name: x.kw, path: pageEncodedPath(x), image: `/og/${encodeURIComponent(x.slug)}.jpg` }));

  return (
    <main>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: '홈', path: '/' },
            { name: '지역', path: '/area/' },
            { name: `${P.name} 철거 안내`, path: placeEncodedPath(p.place) },
            { name: p.kw, path },
          ]),
          serviceJsonLd({ name: p.kw, type: p.word, description: c.description, path, area: P.admin, image: `/img/${c.hero.img}.jpg` }),
          faqJsonLd(c.faq),
          itemListJsonLd(relList.length ? relList : [{ name: `${P.name} 철거 안내`, path: placeEncodedPath(p.place) }]),
        ]}
      />

      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-text">
            <nav className="crumbs" aria-label="경로">
              <Link href="/">홈</Link><span>/</span><Link href="/area/">지역</Link><span>/</span><Link href={placePath(p.place)}>{P.name}</Link>
            </nav>
            <p className="eyebrow">{c.cat}</p>
            <h1><span>{p.kw}</span>{' '}<span className="hero-sub">{c.h1sub}</span></h1>
            <p className="hero-lead">{c.lead}</p>
            <Actions />
          </div>
          <figure className="hero-photo mask">
            <img src={`/img/${c.hero.img}.webp`} alt={c.hero.alt} />
            <figcaption><b>{BRAND}</b>{c.hero.cap}</figcaption>
          </figure>
        </div>
      </section>
      <div className="hazard" aria-hidden="true" />

      <div className="wrap">
        <section className="answer" data-reveal>
          <h2>{p.kw} 핵심 요약</h2>
          <p>{c.summaryText}</p>
          <dl>{c.facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        </section>
      </div>

      <div className="wrap content">
        <article className="ray">
          {c.sections.map((x, i) => (
            <section key={i} data-reveal>
              <h2><span>{String(i + 1).padStart(2, '0')}</span>{x.h}</h2>
              <p>{x.p}</p>
            </section>
          ))}
        </article>

        <div className="shots ray-shots">
          {c.photos.items.map(({ p: k, alt, caption }, i) => (
            <figure key={k.img} data-reveal style={{ transitionDelay: `${i * 80}ms` }}>
              <img src={`/img/${k.img}.webp`} alt={alt} loading="lazy" />
              <figcaption><b>{BRAND}</b>{caption}</figcaption>
            </figure>
          ))}
        </div>
        <p className="case-note" data-reveal><PlaceLink label="플레이스 사진 전체 보기" /></p>
      </div>

      <section className="cta-band" data-reveal>
        <div className="wrap cta-band-in">
          <p>{c.cta}</p>
          <Actions place={false} />
        </div>
      </section>

      <div className="wrap content">
        <section className="sec" id="faq">
          <h2 className="ray-h">{p.kw} 자주 묻는 질문</h2>
          <div className="faq">
            {c.faq.map((f) => <details key={f.q} data-reveal><summary>{f.q}<i /></summary><p>{f.a}</p></details>)}
          </div>
        </section>

        <section className="sec">
          <h2 className="ray-h">{p.kw} 관련 안내</h2>
          <div className="related">
            {rel.samePlace.length > 0 && <div><h3>{P.name}, 다른 철거도</h3><ul>{rel.samePlace.map((x) => <li key={x.slug}><Link href={pagePath(x)}>{x.kw}<IconArrow /></Link></li>)}</ul></div>}
            {rel.sameWord.length > 0 && <div><h3>같은 {p.word}, 다른 동네에서는</h3><ul>{rel.sameWord.map((x) => <li key={x.slug}><Link href={pagePath(x)}>{x.kw}<IconArrow /></Link></li>)}</ul></div>}
            <div><h3>{P.name} {p.word} 더 보기</h3><ul>
              {rel.sameMod.map((x) => <li key={x.slug}><Link href={pagePath(x)}>{x.kw}<IconArrow /></Link></li>)}
              <li><Link href={placePath(p.place)}>{P.name} 철거 전체<IconArrow /></Link></li>
            </ul></div>
          </div>
        </section>
      </div>

      <section className="closing">
        <div className="wrap" data-reveal>
          <h2>{c.closing.heading}</h2>
          <p>{c.closing.text}</p>
          <Actions />
        </div>
      </section>
    </main>
  );
}
