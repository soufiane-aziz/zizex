import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from 'next/script';
import dynamic from 'next/dynamic';

const AdBlocker = dynamic(() => import('../components/AdBlocker'));
const AntiAdBlock = dynamic(() => import('../components/AntiAdBlock'));

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://zizex.vercel.app').replace(/\/$/, '');

export const metadata = {
  metadataBase: new URL(SITE_URL),
  manifest: '/manifest.webmanifest',
  applicationName: 'Zizex',
  appleWebApp: {
    title: 'Zizex',
    statusBarStyle: 'default',
    capable: true,
  },
  title: {
    default: 'Zizex - Free Movies & TV Shows Streaming Platform',
    template: '%s | Zizex',
  },
  description: 'Watch your favorite movies and TV shows free on Zizex. Official free streaming platform.',
  keywords: ['zizex', 'ziz ex', 'Zizex', 'ZIZEX', 'ziz-ex', 'Ziz Ex', 'ZIZ EX', 'zizex streaming', 'zizex app', 'zizex official', 'watch movies online', 'streaming platform', 'HD movies streaming', 'TV series online', 'top rated movies', 'latest cinema releases'],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-120x120.png', sizes: '120x120', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    siteName: 'Zizex',
    title: 'Zizex - Free Movies & TV Shows Streaming Platform',
    description: 'Stream thousands of top movies and TV series free on Zizex.',
    url: SITE_URL,
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/og-image.jpg?v=2`,
        width: 1024,
        height: 1024,
        alt: 'Zizex - Watch Movies & TV Shows For Free',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Zizex - Free Movies & TV Shows Streaming',
    description: 'Stream thousands of top movies and TV series free on Zizex.',
    images: [`${SITE_URL}/og-image.jpg?v=2`],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'RetFRXiOgoyM5G7xUBlpRIQIZ85-z80QTyCx0lX21pM',
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || undefined,
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || undefined,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Preload hero / OG image — improves LCP (Core Web Vitals) */}
        <link
          rel="preload"
          href="/og-image.jpg"
          as="image"
          type="image/jpeg"
          fetchPriority="high"
        />

        {/* DNS / Preconnect — open TCP connections early for critical resources */}
        <link rel="preconnect" href="https://image.tmdb.org" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.themoviedb.org" />

        <link rel="dns-prefetch" href="https://image.tmdb.org" />
        <link rel="dns-prefetch" href="https://api.themoviedb.org" />
        <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />
        <link rel="dns-prefetch" href="https://bashsecret.com" />
        <link rel="preconnect" href="https://moviesapi.to" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://moviesapi.to" />
        <link rel="dns-prefetch" href="https://player.smashystream.com" />
        <link rel="dns-prefetch" href="https://embedwave.cc" />
        <link rel="preconnect" href="https://vidlink.pro" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://vidlink.pro" />
        <link rel="preconnect" href="https://player.videasy.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://player.videasy.net" />
        <link rel="dns-prefetch" href="https://vidsrc.pm" />

        {/* JSON-LD Schema for Brand Keyword Priority Ranking */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": `${SITE_URL}/#website`,
                  "url": `${SITE_URL}/`,
                  "name": "Zizex",
                  "alternateName": [
                    "Zizex",
                    "zizex",
                    "ziz ex",
                    "Ziz Ex",
                    "ZIZEX",
                    "ZIZ EX",
                    "ziz-ex",
                    "Zizex Streaming",
                    "Zizex App",
                    "موقع Zizex"
                  ],
                  "description": "Zizex is the official free movies and TV shows streaming platform online in HD.",
                  "inLanguage": ["en", "fr", "ar"],
                  "publisher": {
                    "@id": `${SITE_URL}/#organization`
                  },
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                      "@type": "EntryPoint",
                      "urlTemplate": `${SITE_URL}/en?q={search_term_string}`
                    },
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "Organization",
                  "@id": `${SITE_URL}/#organization`,
                  "name": "Zizex",
                  "url": `${SITE_URL}/`,
                  "logo": `${SITE_URL}/icon.png`,
                  "description": "Official Zizex Streaming Platform",
                  "sameAs": []
                },
                {
                  "@type": "WebPage",
                  "@id": `${SITE_URL}/#mainpage`,
                  "url": `${SITE_URL}/`,
                  "name": "Zizex - Main Official Site",
                  "description": "Official main page for Zizex free streaming platform.",
                  "isPartOf": {
                    "@id": `${SITE_URL}/#website`
                  }
                },
                {
                  "@type": "WebPage",
                  "@id": `${SITE_URL}/fr#mainpage`,
                  "url": `${SITE_URL}/fr`,
                  "name": "Zizex French - Site Officiel",
                  "description": "Page officielle Zizex en Français.",
                  "isPartOf": {
                    "@id": `${SITE_URL}/#website`
                  }
                },
                {
                  "@type": "WebPage",
                  "@id": `${SITE_URL}/ar#mainpage`,
                  "url": `${SITE_URL}/ar`,
                  "name": "Zizex Arabic - الموقع الرسمي",
                  "description": "الصفحة الرسمية لـ Zizex باللغة العربية.",
                  "isPartOf": {
                    "@id": `${SITE_URL}/#website`
                  }
                },
                {
                  "@type": "ItemList",
                  "@id": `${SITE_URL}/#sitenavigation`,
                  "name": "Zizex Navigation",
                  "itemListElement": [
                    {
                      "@type": "SiteNavigationElement",
                      "position": 1,
                      "name": "Movies",
                      "url": `${SITE_URL}/en/movies`
                    },
                    {
                      "@type": "SiteNavigationElement",
                      "position": 2,
                      "name": "TV Shows",
                      "url": `${SITE_URL}/en/tv`
                    },
                    {
                      "@type": "SiteNavigationElement",
                      "position": 3,
                      "name": "Top Rated",
                      "url": `${SITE_URL}/en/top-rated`
                    },
                    {
                      "@type": "SiteNavigationElement",
                      "position": 4,
                      "name": "Trending",
                      "url": `${SITE_URL}/en/trending`
                    }
                  ]
                }
              ]
            })
          }}
        />
      </head>
      <body>
        <AdBlocker />
        <AntiAdBlock />
        {children}
        <Analytics />
        <SpeedInsights />

        {/* Google Analytics 4 */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              id="ga-script"
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            />
            <Script
              id="ga-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
                `,
              }}
            />
          </>
        )}

        {/* Font Awesome — loaded via Script so it is 100% off the critical render path.
            React JSX ignores string onLoad="..." handlers on <link> elements;
            programmatic injection is the only reliable async CSS approach in Next.js. */}
        <Script
          id="fa-loader"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                if(document.querySelector('link[data-fa]')) return;
                var l=document.createElement('link');
                l.rel='stylesheet';
                l.href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
                l.integrity='sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==';
                l.crossOrigin='anonymous';
                l.referrerPolicy='no-referrer';
                l.setAttribute('data-fa','1');
                document.head.appendChild(l);
                var s=document.createElement('style');
                s.textContent='@font-face{font-family:"Font Awesome 6 Free";font-display:swap;}@font-face{font-family:"Font Awesome 6 Brands";font-display:swap;}';
                document.head.appendChild(s);
              })();
            `,
          }}
        />
        {/* SocialBar Ad Script — lazyOnload so it never races with GA4 */}
        <Script
          src="https://bashsecret.com/14/0d/97/140d9749cb302ce1cda4cddc6eccd9b8.js"
          strategy="lazyOnload"
        />
        {/* Service Worker: blocks unauthorized ad redirects from streaming iframes */}
        <Script
          id="sw-register"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function(){});
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
