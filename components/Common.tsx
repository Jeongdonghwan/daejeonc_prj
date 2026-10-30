// 공통 UI — 이모지 없이 선 아이콘, 각진 버튼, 번호 붙은 섹션 머리.
// 사용자 요청: 네이버 플레이스 링크를 헤더·히어로·푸터·하단 고정바에 고정 → PlaceLink.
import Link from 'next/link';
import { BRAND, CONTACT, PLACE_FACTS, PLACE_URL, tel } from '../lib/site';

export const JsonLd = ({ data }: { data: object | object[] }) => (
  <>{(Array.isArray(data) ? data : [data]).map((d, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />)}</>
);

const Svg = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);
export const IconPhone = () => <Svg d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />;
export const IconPin = () => <Svg d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" size={16} />;
export const IconArrow = () => <Svg d="M5 12h14M13 6l6 6-6 6" size={16} />;
export const IconOut = () => <Svg d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" size={14} />;

// 네이버 플레이스 링크 (새 창)
export const PlaceLink = ({ className = 'place-link', label = '네이버 플레이스에서 보기' }: { className?: string; label?: string }) => (
  <a className={className} href={PLACE_URL} target="_blank" rel="noopener"><IconPin />{label}<IconOut /></a>
);

export const PhoneBlock = ({ label = '' }: { label?: string }) => (
  <div className="phone-block">
    <a className="btn-primary" href={tel}><IconPhone /><span>{label}{CONTACT.phone}</span></a>
  </div>
);

// 본문 버튼 묶음: 전화 · 플레이스
export const Actions = ({ place = true }: { place?: boolean }) => (
  <div className="actions">
    <PhoneBlock />
    {place && <a className="btn-text" href={PLACE_URL} target="_blank" rel="noopener"><IconPin /><span>네이버 플레이스 · 사진·리뷰 보기</span><IconArrow /></a>}
  </div>
);

export const SectionHead = ({ no, title, sub }: { no: string; title: string; sub?: string }) => (
  <header className="sh" data-reveal>
    <span className="sh-no" aria-hidden="true">{no}</span>
    <h2>{title}</h2>
    {sub && <p>{sub}</p>}
  </header>
);

export const Ticker = ({ items }: { items: string[] }) => (
  <div className="ticker" aria-hidden="true">
    <div className="ticker-track">{[...items, ...items].map((x, i) => <span key={i}>{x}</span>)}</div>
  </div>
);

export const Header = () => (
  <header className="site-header">
    <div className="wrap header-inner">
      <Link href="/" className="logo" aria-label={`${BRAND} 홈`}>
        <span className="logo-word"><b>{BRAND}</b><small>DAEJEON · DEMOLITION</small></span>
      </Link>
      <nav className="nav" aria-label="주 메뉴">
        <Link href="/area/" className="hide-m">지역</Link>
        <a href={PLACE_URL} className="hide-m nav-place" target="_blank" rel="noopener">네이버 플레이스</a>
        <a href={tel} className="nav-call" aria-label={`전화 ${CONTACT.phone}`}><IconPhone /><span>{CONTACT.phone}</span></a>
      </nav>
    </div>
  </header>
);

export const Footer = () => (
  <footer className="site-footer">
    <div className="wrap foot-grid">
      <div>
        <strong className="foot-brand">{BRAND}</strong>
        <p>철거 · 상가철거 · 식당철거 · 원상복구 · 완파 · 미용실·학원·공장·폐업 철거<br />대전 중구 · 서구 · 유성구 · 둔산 · 도안 · 노은 외</p>
        <p><Link href="/area/">지역 안내</Link> · <a href="/rss.xml">RSS</a> · <PlaceLink label="네이버 플레이스" /></p>
      </div>
      <ul className="foot-info">
        <li><span>상호</span>{BRAND}</li>
        {PLACE_FACTS.category && <li><span>업종</span>{PLACE_FACTS.category}</li>}
        {PLACE_FACTS.address && <li><span>주소</span>{PLACE_FACTS.address}</li>}
        {PLACE_FACTS.hours && <li><span>영업</span>{PLACE_FACTS.hours}</li>}
        <li><span>전화</span><a href={tel}>{CONTACT.phone}</a></li>
      </ul>
    </div>
    <div className="wrap foot-bottom">© {new Date().getFullYear()} {BRAND} · 업체 정보·사진 출처: 네이버 플레이스{PLACE_FACTS.checked ? ` (${PLACE_FACTS.checked} 확인)` : ''}</div>
  </footer>
);

export const StickyBar = () => (
  <div className="sticky-bar">
    <div className="sb-row">
      <a href={tel} className="sb-call"><IconPhone />{CONTACT.phone}</a>
      <a href={PLACE_URL} className="sb-kakao" target="_blank" rel="noopener"><IconPin />플레이스</a>
    </div>
  </div>
);
