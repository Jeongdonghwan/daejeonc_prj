import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OPEN_PAGES, PLACES, getPage, pagePath, pageEncodedPath, canonicalPath, placePath, placeEncodedPath, related } from '../../lib/data';
import { compose } from '../../lib/compose';
import { breadcrumbJsonLd, faqJsonLd, itemListJsonLd, serviceJsonLd } from '../../lib/jsonld';
import { BRAND, shareMeta } from '../../lib/site';
import { Actions, IconArrow, JsonLd, PlaceLink, SectionHead, Ticker } from '../../components/Common';

export const dynamicParams = false;

// 순차 오픈: lib/site.ts 의 OPEN_WAVE 이하 페이지만 생성
export function generateStaticParams() {
  return OPEN_PAGES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getPage(params.slug);
  if (!p) return {};
  const c = compose(p);
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
  const c = compose(p);
  const P = PLACES[p.place];
  const rel = related(p);
  const path = pageEncodedPath(p);
  const relAll = [...rel.sameMod, ...rel.samePlace, ...rel.sameWord];
  const relList = relAll.map((x) => ({ name: x.kw, path: pageEncodedPath(x), image: `/og/${encodeURIComponent(x.slug)}.jpg` }));
  const words = p.kw.split(' ');
  const h1a = words.slice(0, Math.ceil(words.length / 2)).join(' ');
  const h1b = words.slice(Math.ceil(words.length / 2)).join(' ');

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
            <p className="eyebrow">{c.eyebrow}</p>
            <h1><span><i>{h1a}</i></span>{h1b && <span><i>{h1b}</i></span>}</h1>
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
        <section className="answer" aria-label="요약" data-reveal>
          <p>{c.answer}</p>
          <dl>{c.summary.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        </section>
      </div>

      <Ticker items={c.ticker} />

      <div className="wrap content">
        <section className="sec">
          <SectionHead no="01" title={c.region.heading} />
          <div className="cols">
            <div className="prose" data-reveal>
              {c.intro.map((t, i) => <p key={i} className={i === 0 ? 'first' : ''}>{t}</p>)}
              {c.region.paras.map((t, i) => <p key={`r${i}`}>{t}</p>)}
            </div>
            <aside className="memo" data-reveal>
              <h3>{P.name} 주변</h3>
              <ol>{c.region.spots.map((h) => <li key={h}>{h}</li>)}</ol>
              {c.region.nearby.length > 0 && <><h3>이웃 지역</h3><p>{c.region.nearby.join(' · ')}</p></>}
            </aside>
          </div>
        </section>

        <section className="sec mist">
          <SectionHead no="02" title={c.view.heading} />
          <div className="prose" data-reveal>{c.view.paras.map((t, i) => <p key={i}>{t}</p>)}</div>
          <dl className="spec" data-reveal>{c.view.table.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        </section>

        <section className="sec">
          <SectionHead no="03" title={c.checks.heading} sub={c.checks.sub} />
          <div className="signs">
            <ul className="reveal-group">{c.checks.items.map((x) => <li key={x}>{x}</li>)}</ul>
            <figure data-reveal className="mask">
              <img src={`/img/${c.checks.photo.img}.webp`} alt={c.checks.photo.alt} loading="lazy" />
              <figcaption>{c.checks.photo.cap}</figcaption>
            </figure>
          </div>
        </section>
      </div>

      <section className="band">
        <div className="wrap">
          <SectionHead no="04" title={c.scope.heading} sub={c.scope.text} />
          <ol className="tools reveal-group">
            {c.scope.list.map((t) => <li key={t.name}><div><h3>{t.name}</h3><p>{t.d}</p></div></li>)}
          </ol>
        </div>
      </section>

      <section className="cta-band" data-reveal>
        <div className="wrap cta-band-in">
          <p>{c.cta}</p>
          <Actions place={false} />
        </div>
      </section>

      <div className="wrap content">
        <section className="sec">
          <SectionHead no="05" title={c.laws.heading} sub={c.laws.sub} />
          <div className="cols">
            <ol className="law reveal-group">{c.laws.list.map((l) => <li key={l.t}><div><b>{l.t}</b><p>{l.d}</p></div></li>)}</ol>
            <aside className="mod-box" data-reveal>
              <h3>{c.mod.heading}</h3>
              <p>{c.mod.lead}</p>
              <ol>{c.mod.items.map((x) => <li key={x}>{x}</li>)}</ol>
            </aside>
          </div>
        </section>

        <section className="sec">
          <SectionHead no="06" title={c.photos.heading} sub={c.photos.sub} />
          <div className="shots">
            {c.photos.items.map(({ p: k, alt, caption }, i) => (
              <figure key={k.img} data-reveal style={{ transitionDelay: `${i * 80}ms` }}>
                <img src={`/img/${k.img}.webp`} alt={alt} loading="lazy" />
                <figcaption><b>{BRAND}</b>{caption}</figcaption>
              </figure>
            ))}
          </div>
          <p className="case-note" data-reveal><PlaceLink label="플레이스 사진 전체 보기" /></p>
        </section>

        <section className="sec mist">
          <SectionHead no="07" title={c.stepsHeading} />
          <ol className="flow reveal-group">
            {c.steps.map((st) => <li key={st.title}><strong>{st.title}</strong><p>{st.text}</p></li>)}
          </ol>
        </section>

        <section className="sec">
          <SectionHead no="08" title={c.tell.heading} />
          <div className="cols">
            <ol className="memo-list reveal-group">{c.tell.items.map((x) => <li key={x}>{x}</li>)}</ol>
            <div className="prose" data-reveal><p>{c.tell.text}</p>
              <dl className="info">{c.info.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
            </div>
          </div>
        </section>

        <section className="sec mist" id="faq">
          <SectionHead no="09" title="자주 묻는 질문" />
          <div className="faq">
            {c.faq.map((f) => <details key={f.q} data-reveal><summary>{f.q}<i /></summary><p>{f.a}</p></details>)}
          </div>
        </section>

        <section className="sec">
          <SectionHead no="10" title={`${p.kw} 관련 안내`} />
          <div className="related">
            {rel.samePlace.length > 0 && <div><h3>{P.name} 다른 철거</h3><ul>{rel.samePlace.map((x) => <li key={x.slug}><Link href={pagePath(x)}>{x.kw}<IconArrow /></Link></li>)}</ul></div>}
            {rel.sameWord.length > 0 && <div><h3>다른 지역 {p.word}</h3><ul>{rel.sameWord.map((x) => <li key={x.slug}><Link href={pagePath(x)}>{x.kw}<IconArrow /></Link></li>)}</ul></div>}
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
