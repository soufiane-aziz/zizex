import './globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://zshow.vercel.app'),
  title: 'zShow - Streaming Platform',
  description: 'Watch your favorite movies and TV shows free in HD',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192.png',
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
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
