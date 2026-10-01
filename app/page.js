import React from 'react';
import LocalizedHomePage, { generateMetadata as generateLocalizedMetadata } from './[locale]/page';

export const revalidate = 604800;

export async function generateMetadata(props) {
  const searchParams = await props.searchParams;
  const metadata = await generateLocalizedMetadata({
    params: Promise.resolve({ locale: 'en' }),
    searchParams: Promise.resolve(searchParams || {}),
  });

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zizex.vercel.app';

  return {
    ...metadata,
    title: 'Zizex - Official Free Movies & TV Shows Streaming Platform',
    description: 'Zizex is the official free streaming platform to watch thousands of HD movies and TV series online without registration. Stream top movies and shows on Zizex.',
    keywords: ['zizex', 'ziz ex', 'Zizex', 'ZIZEX', 'ziz-ex', 'Ziz Ex', 'ZIZ EX', 'zizex.vercel.app', 'zizex streaming', 'zizex app', 'zizex site', 'zizex official', 'watch movies online', 'free streaming platform', 'HD movies streaming', 'TV series online'],
    alternates: {
      canonical: `${SITE_URL}/`,
      languages: {
        'en': `${SITE_URL}/en`,
        'fr': `${SITE_URL}/fr`,
        'ar': `${SITE_URL}/ar`,
        'x-default': `${SITE_URL}/`,
      },
    },
    openGraph: {
      title: 'Zizex - Official Free Movies & TV Shows Streaming Platform',
      description: 'Zizex is the official free streaming platform to watch thousands of HD movies and TV series online without registration.',
      url: `${SITE_URL}/`,
      siteName: 'Zizex',
      images: [
        {
          url: `${SITE_URL}/og-image.jpg?v=6`,
          width: 1024,
          height: 1024,
          alt: 'Zizex - Free Movies & TV Shows Streaming Platform',
        },
      ],
      type: 'website',
      locale: 'en_US',
    },
  };
}

export default async function RootPage(props) {
  const searchParams = await props.searchParams;
  return (
    <LocalizedHomePage
      params={Promise.resolve({ locale: 'en' })}
      searchParams={Promise.resolve(searchParams || {})}
    />
  );
}