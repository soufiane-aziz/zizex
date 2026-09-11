import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from 'next/script';
import dynamic from 'next/dynamic';

const AdBlocker = dynamic(() => import('../components/AdBlocker'));
const AntiAdBlock = dynamic(() => import('../components/AntiAdBlock'));

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://filmoxa.vercel.app'),
  title: 'Filmoxa - Streaming Platform',
  description: 'Watch your favorite movies and TV shows free on Filmoxa.',
  keywords: ['filmoxa', 'Filmoxa', 'watch movies online', 'free streaming platform', 'HD movies streaming', 'free TV series online', 'top rated movies', 'latest cinema releases', 'watch series free', 'cinema for you', 'movie streaming site', 'online film platform', 'action movies free', 'sci-fi series online', 'trending movies 2026', 'hd film streaming', 'stream full movies', 'watch free tv shows', 'best movie streaming site', 'cinema streaming free', 'Netflix', 'watch Netflix movies free', 'HBO Max streaming', 'Disney Plus free', 'TopCinema', 'EgyBest alternative', 'MyCima', 'Cima4U', 'Shahid VIP free', 'WatchIt movies'],
  icons: {
    icon: [
      { url: '/logo.png?v=2', sizes: 'any', type: 'image/png' },
    ],
    shortcut: '/logo.png?v=2',
    apple: '/logo.png?v=2',
  },
  openGraph: {
    siteName: 'Filmoxa',
    title: 'Filmoxa - Free Movies & TV Shows Streaming Platform',
    description: 'Stream thousands of top movies and TV series free on Filmoxa.',
    url: 'https://filmoxa.vercel.app',
    type: 'website',
    images: [
      {
        url: '/og-image.png?v=3',
        width: 1024,
        height: 1024,
        alt: 'Filmoxa - Watch Movies & TV Shows For Free',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Filmoxa - Free Movies & TV Shows Streaming',
    description: 'Stream thousands of top movies and TV series free on Filmoxa.',
    images: ['/og-image.png?v=3'],
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
        {/* Favicon */}
        <link rel="icon" href="/logo.png?v=2" type="image/png" />
        <link rel="shortcut icon" href="/logo.png?v=2" />
        <link rel="apple-touch-icon" href="/logo.png?v=2" />



        {/* DNS / Preconnect — open TCP connections early for critical resources */}
        <link rel="preconnect" href="https://image.tmdb.org" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.themoviedb.org" />

        <link rel="dns-prefetch" href="https://image.tmdb.org" />
        <link rel="dns-prefetch" href="https://api.themoviedb.org" />
        <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />
        <link rel="dns-prefetch" href="https://bashsecret.com" />
        <link rel="preconnect" href="https://vidsrc.pm" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://vidsrc.pm" />
        <link rel="dns-prefetch" href="https://autoembed.co" />
        <link rel="dns-prefetch" href="https://multiembed.mov" />
        <link rel="dns-prefetch" href="https://vidsrc.me" />
        <link rel="dns-prefetch" href="https://vidlink.pro" />

        {/* JSON-LD Schema for Brand Ranking */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://filmoxa.vercel.app/#website",
                  "url": "https://filmoxa.vercel.app/",
                  "name": "Filmoxa",
                  "alternateName": ["Filmoxa", "filmoxa", "Filmoxa Streaming"],
                  "description": "Watch free movies and TV shows online in HD on Filmoxa.",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                      "@type": "EntryPoint",
                      "urlTemplate": "https://filmoxa.vercel.app/en/search?q={search_term_string}"
                    },
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "Organization",
                  "@id": "https://filmoxa.vercel.app/#organization",
                  "name": "Filmoxa",
                  "url": "https://filmoxa.vercel.app/",
                  "logo": "https://filmoxa.vercel.app/logo.png?v=2"
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
        {/* Adsterra SocialBar Ad Script */}
        <Script
          id="socialbar-ad"
          src="https://bashsecret.com/20/6e/e9/206ee9fc8937e09edad8756e7612d82c.js"
          strategy="afterInteractive"
        />
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
