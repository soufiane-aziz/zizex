import './globals.css';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://zshow.vercel.app'),
  title: 'zShow - Streaming Platform',
  description: 'Watch your favorite movies and TV shows',
};

export default function RootLayout({ children }) {
  return children;
}
