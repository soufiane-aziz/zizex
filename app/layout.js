import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from 'next/script';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://zizhub.vercel.app'),
  title: 'ZizHub - Streaming Platform',
  description: 'Watch your favorite movies and TV shows free on ZizHub.',
  keywords: ['zizhub', 'ZizHub', 'watch movies online', 'free streaming platform', 'HD movies streaming', 'free TV series online', 'top rated movies', 'latest cinema releases', 'watch series free', 'cinema for you', 'movie streaming site', 'online film platform', 'action movies free', 'sci-fi series online', 'trending movies 2026', 'hd film streaming', 'stream full movies', 'watch free tv shows', 'best movie streaming site', 'cinema streaming free', 'Netflix', 'watch Netflix movies free', 'HBO Max streaming', 'Disney Plus free', 'TopCinema', 'EgyBest alternative', 'MyCima', 'Cima4U', 'Shahid VIP free', 'WatchIt movies'],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  openGraph: {
    siteName: 'ZizHub',
    title: 'ZizHub - Free Movies & TV Shows Streaming Platform',
    description: 'Stream thousands of top movies and TV series free on ZizHub.',
    url: 'https://zizhub.vercel.app',
    type: 'website',
    images: [
      {
        url: '/og-image.png?v=6',
        width: 1200,
        height: 630,
        alt: 'ZizHub - Watch Movies & TV Shows For Free',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZizHub - Free Movies & TV Shows Streaming',
    description: 'Stream thousands of top movies and TV series free on ZizHub.',
    images: ['/og-image.png?v=6'],
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-512.png" />

        {/* Font Awesome — async (non-render-blocking). Saves ~2,360ms LCP */}
        <link
          rel="preload"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          as="style"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          media="print"
          // @ts-ignore — onLoad is valid for link elements in this async pattern
          onLoad="this.media='all'"
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
            integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
        </noscript>

        {/* DNS / Preconnect */}
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="preconnect" href="https://api.themoviedb.org" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
        <link rel="dns-prefetch" href="https://api.themoviedb.org" />
        <link rel="dns-prefetch" href="https://vidsrc.pm" />
        <link rel="dns-prefetch" href="https://autoembed.co" />
        <link rel="dns-prefetch" href="https://multiembed.mov" />
      </head>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
        {/* Service Worker: blocks unauthorized ad redirects from streaming iframes */}
        <Script
          id="sw-register"
          strategy="afterInteractive"
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
