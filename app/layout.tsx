import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header, Footer, StickyBar, JsonLd } from '../components/Common';
import Motion from '../components/Motion';
import { businessJsonLd, webSiteJsonLd } from '../lib/jsonld';
import { SITE_URL, SITE_NAME } from '../lib/site';

export const metadata: Metadata = {
  icons: { icon: [{ url: '/favicon.ico', sizes: 'any' }, { url: '/icon.png', type: 'image/png', sizes: '192x192' }], apple: '/apple-touch-icon.png' },
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s` },
  robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  verification: { google: 'DcMqPBbpRm_AYTKYCbvhSG5I7xSmtmmTpaBW5osvabI', other: { 'naver-site-verification': '420933d948a93ce53ebc81e7a3086910d88d26e0' } },
};

export const viewport: Viewport = { themeColor: '#1a1d20', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
      </head>
      <body>
        <JsonLd data={[businessJsonLd(), webSiteJsonLd()]} />
        <Header />
        {children}
        <Footer />
        <StickyBar />
        <Motion />
        <script dangerouslySetInnerHTML={{ __html: "document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(!a)return;var h=a.getAttribute('href')||'',k=h.indexOf('tel:')===0?'tel':h.indexOf('sms:')===0?'sms':/kakao/.test(h)?'kakao':'';if(k&&navigator.sendBeacon)navigator.sendBeacon('/_t?e='+k+'&p='+encodeURIComponent(location.pathname))},true)" }} />
      </body>
    </html>
  );
}
