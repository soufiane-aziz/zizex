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
    title: 'Zizex | Watch Free Movies & TV Shows Online',
    description: 'Zizex is the ultimate free streaming platform to watch thousands of HD movies and TV series online without registration.',
    alternates: {
      canonical: `${SITE_URL}/`,
      languages: {
        'en': `${SITE_URL}/en`,
        'fr': `${SITE_URL}/fr`,
        'ar': `${SITE_URL}/ar`,
        'x-default': `${SITE_URL}/`,
      },
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