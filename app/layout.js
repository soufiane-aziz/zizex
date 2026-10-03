import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from 'next/script';
import dynamic from 'next/dynamic';

const AdBlocker = dynamic(() => import('../components/AdBlocker'));
const AntiAdBlock = dynamic(() => import('../components/AntiAdBlock'));

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://zizex.vercel.app'),
  title: 'Zizex - Free Movies & TV Shows Streaming Platform',
  description: 'Watch your favorite movies and TV shows free on Zizex. Official free streaming platform.',
  keywords: ['zizex', 'ziz ex', 'Zizex', 'ZIZEX', 'ziz-ex', 'Ziz Ex', 'ZIZ EX', 'zizex.vercel.app', 'zizex streaming', 'zizex app', 'zizex official', 'watch movies online', 'streaming platform', 'HD movies streaming', 'TV series online', 'top rated movies', 'latest cinema releases'],
  icons: {
    icon: [
      { url: '/icon.png?v=2', sizes: '512x512', type: 'image/png' },
      { url: '/favicon.ico?v=2', sizes: 'any' },
      { url: '/logo.png?v=2', sizes: '1024x1024', type: 'image/png' },
    ],
    shortcut: '/icon.png?v=2',
    apple: [
      { url: '/apple-icon.png?v=2', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    siteName: 'Zizex',
    title: 'Zizex - Free Movies & TV Shows Streaming Platform',
    description: 'Stream thousands of top movies and TV series free on Zizex.',
    url: 'https://zizex.vercel.app',
    type: 'website',
    images: [
      {
        url: 'https://zizex.vercel.app/og-image.jpg?v=2',
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
    images: ['https://zizex.vercel.app/og-image.jpg?v=2'],
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
        {/* Favicon & Site Icons for Google Search and Browsers */}
        <link rel="icon" href="/icon.png?v=2" type="image/png" sizes="512x512" />
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="shortcut icon" href="/icon.png?v=2" />
        <link rel="apple-touch-icon" href="/apple-icon.png?v=2" sizes="180x180" />

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
        <link rel="preconnect" href="https://vidlink.pro" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://vidlink.pro" />
        <link rel="dns-prefetch" href="https://vidsrc.cc" />
        <link rel="dns-prefetch" href="https://autoembed.co" />
        <link rel="dns-prefetch" href="https://multiembed.mov" />
        <link rel="dns-prefetch" href="https://vidsrc.me" />
        <link rel="dns-prefetch" href="https://vidlink.pro" />

        {/* JSON-LD Schema for Brand Keyword Priority Ranking */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://zizex.vercel.app/#website",
                  "url": "https://zizex.vercel.app/",
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
                    "zizex.vercel.app",
                    "موقع Zizex"
                  ],
                  "description": "Zizex is the official free movies and TV shows streaming platform online in HD.",
                  "inLanguage": ["en", "fr", "ar"],
                  "publisher": {
                    "@id": "https://zizex.vercel.app/#organization"
                  },
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                      "@type": "EntryPoint",
                      "urlTemplate": "https://zizex.vercel.app/en?q={search_term_string}"
                    },
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "Organization",
                  "@id": "https://zizex.vercel.app/#organization",
                  "name": "Zizex",
                  "url": "https://zizex.vercel.app/",
                  "logo": "https://zizex.vercel.app/icon.png",
                  "description": "Official Zizex Streaming Platform",
                  "sameAs": []
                },
                {
                  "@type": "WebPage",
                  "@id": "https://zizex.vercel.app/#mainpage",
                  "url": "https://zizex.vercel.app/",
                  "name": "Zizex - Main Official Site",
                  "description": "Official main page for Zizex free streaming platform.",
                  "isPartOf": {
                    "@id": "https://zizex.vercel.app/#website"
                  }
                },
                {
                  "@type": "WebPage",
                  "@id": "https://zizex.vercel.app/fr#mainpage",
                  "url": "https://zizex.vercel.app/fr",
                  "name": "Zizex French - Site Officiel",
                  "description": "Page officielle Zizex en Français.",
                  "isPartOf": {
                    "@id": "https://zizex.vercel.app/#website"
                  }
                },
                {
                  "@type": "WebPage",
                  "@id": "https://zizex.vercel.app/ar#mainpage",
                  "url": "https://zizex.vercel.app/ar",
                  "name": "Zizex Arabic - الموقع الرسمي",
                  "description": "الصفحة الرسمية لـ Zizex باللغة العربية.",
                  "isPartOf": {
                    "@id": "https://zizex.vercel.app/#website"
                  }
                },
                {
                  "@type": "ItemList",
                  "@id": "https://zizex.vercel.app/#sitenavigation",
                  "name": "Zizex Navigation",
                  "itemListElement": [
                    {
                      "@type": "SiteNavigationElement",
                      "position": 1,
                      "name": "Movies",
                      "url": "https://zizex.vercel.app/en/movies"
                    },
                    {
                      "@type": "SiteNavigationElement",
                      "position": 2,
                      "name": "TV Shows",
                      "url": "https://zizex.vercel.app/en/tv"
                    },
                    {
                      "@type": "SiteNavigationElement",
                      "position": 3,
                      "name": "Top Rated",
                      "url": "https://zizex.vercel.app/en/top-rated"
                    },
                    {
                      "@type": "SiteNavigationElement",
                      "position": 4,
                      "name": "Trending",
                      "url": "https://zizex.vercel.app/en/trending"
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
