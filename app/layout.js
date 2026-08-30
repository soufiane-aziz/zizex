import './globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://zizhub.vercel.app'),
  title: 'ZizHub - Streaming Platform',
  description: 'Watch your favorite movies and TV shows free in HD on ZizHub.',
  keywords: ['zizhub', 'ZizHub', 'watch movies online', 'free streaming platform', 'HD movies streaming', 'free TV series online', 'top rated movies', 'latest cinema releases', 'watch series free', 'cinema for you', 'movie streaming site', 'online film platform', 'action movies free', 'sci-fi series online', 'trending movies 2026', 'hd film streaming', 'stream full movies', 'watch free tv shows', 'best movie streaming site', 'cinema streaming free', 'Netflix', 'watch Netflix movies free', 'HBO Max streaming', 'Disney Plus free', 'TopCinema', 'EgyBest alternative', 'MyCima', 'Cima4U', 'Shahid VIP free', 'WatchIt movies'],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  openGraph: {
    siteName: 'ZizHub',
    title: 'ZizHub - Free Movies & TV Shows Streaming Platform',
    description: 'Stream thousands of top movies and TV series free in full HD on ZizHub.',
    url: 'https://zizhub.vercel.app',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ZizHub - Watch Movies & TV Shows Free in HD',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZizHub - Free Movies & TV Shows Streaming',
    description: 'Stream thousands of top movies and TV series free in full HD on ZizHub.',
    images: ['/og-image.png'],
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
        <meta name="google-site-verification" content="RetFRXiOgoyM5G7xUBlpRIQIZ85-z80QTyCx0lX21pM" />
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
        <link rel="preconnect" href="https://api.themoviedb.org" />
        <link rel="dns-prefetch" href="https://api.themoviedb.org" />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
