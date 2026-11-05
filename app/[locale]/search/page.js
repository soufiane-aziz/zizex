import React from 'react';
import SearchClient from './SearchClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zizex-tv.vercel.app';

export async function generateMetadata(props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { locale } = params;
  const query = searchParams?.q || '';

  const isAr = locale === 'ar';
  const isFr = locale === 'fr';

  const title = query
    ? isAr
      ? `نتائج البحث عن "${query}" - Zizex`
      : isFr
        ? `Recherche "${query}" - Zizex`
        : `Search results for "${query}" - Zizex`
    : isAr
      ? 'البحث في الأفلام والمسلسلات - Zizex'
      : isFr
        ? 'Rechercher des films et séries - Zizex'
        : 'Search Movies & TV Shows - Zizex';

  const description = query
    ? isAr
      ? `استكشف نتائج البحث عن ${query} وشاهد الأفلام والمسلسلات مجاناً على Zizex.`
      : isFr
        ? `Découvrez les résultats pour ${query} et regardez gratuitement sur Zizex.`
        : `Explore search results for ${query} and stream movies & TV shows for free on Zizex.`
    : 'Search and stream thousands of movies and TV shows for free on Zizex.';

  return {
    title,
    description,
    robots: {
      index: false, // Don't let search engines index arbitrary query parameter combinations
      follow: true,
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}/search`,
    },
  };
}

export default async function SearchPage(props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { locale } = params;
  const query = searchParams?.q || '';

  return <SearchClient initialQuery={query} locale={locale} />;
}

