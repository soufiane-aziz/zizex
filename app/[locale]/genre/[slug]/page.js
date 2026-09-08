import React, { cache } from 'react';
import HomeClient from '../../../../components/HomeClient';
import { createSlug } from '../../../../lib/slug';

export const revalidate = 604800; // 7 days caching on Edge CDN

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY || 'f82feeca535cc0132d1ab38948a70405';
const BASE_URL = "https://api.themoviedb.org/3";

const GENRE_MAP = {
    'action': { movie: '28', tv: '10759', title: { en: 'Action Movies & TV', fr: 'Films & Séries Action', ar: 'أفلام ومسلسلات أكشن' } },
    'adventure': { movie: '12', tv: '10759', title: { en: 'Adventure Movies & TV', fr: 'Films & Séries Aventure', ar: 'أفلام ومسلسلات مغامرة' } },
    'animation': { movie: '16', tv: '16', title: { en: 'Animation Movies & TV', fr: 'Films & Séries Animation', ar: 'أنيميشن ومسلسلات' } },
    'comedy': { movie: '35', tv: '35', title: { en: 'Comedy Movies & TV', fr: 'Comédie Films & Séries', ar: 'أفلام ومسلسلات كوميدي' } },
    'crime': { movie: '80', tv: '80', title: { en: 'Crime Movies & TV', fr: 'Films & Séries Crime', ar: 'أفلام ومسلسلات جريمة' } },
    'documentary': { movie: '99', tv: '99', title: { en: 'Documentaries', fr: 'Documentaires', ar: 'أفلام وثائقية' } },
    'drama': { movie: '18', tv: '18', title: { en: 'Drama Movies & TV', fr: 'Drame Films & Séries', ar: 'أفلام ومسلسلات دراما' } },
    'family': { movie: '10751', tv: '10751', title: { en: 'Family Movies & TV', fr: 'Films & Séries Famille', ar: 'أفلام ومسلسلات عائلية' } },
    'fantasy': { movie: '14', tv: '10765', title: { en: 'Fantasy Movies & TV', fr: 'Fantaisie Films & Séries', ar: 'أفلام ومسلسلات فانتازيا' } },
    'mystery': { movie: '9648', tv: '9648', title: { en: 'Mystery Movies & TV', fr: 'Mystère Films & Séries', ar: 'أفلام ومسلسلات غموض' } },
    'sci-fi': { movie: '878', tv: '10765', title: { en: 'Science Fiction Movies & TV', fr: 'Science Fiction Films & Séries', ar: 'أفلام ومسلسلات خيال علمي' } },
};

const fetchFromTMDB = cache(async (path, queryParams = '') => {
    const url = `${BASE_URL}${path}?api_key=${API_KEY}${queryParams}`;
    try {
        const res = await fetch(url, { next: { revalidate: 604800 } });
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        console.error(`TMDB fetch error for ${path}:`, err);
        return null;
    }
});

export async function generateMetadata(props) {
    const params = await props.params;
    const { locale, slug } = params;
    const cleanSlug = slug.toLowerCase();
    const genreConfig = GENRE_MAP[cleanSlug];

    const isAr = locale === 'ar';
    const isFr = locale === 'fr';

    const genreTitle = genreConfig?.title[locale] || genreConfig?.title.en || cleanSlug.replace(/-/g, ' ');

    const title = isAr
        ? `Filmoxa | شاهد ${genreTitle} أونلاين مجاناً HD`
        : isFr
            ? `Regarder ${genreTitle} en Streaming Gratuit | Filmoxa`
            : `Watch ${genreTitle} Online | Filmoxa`;

    const description = isAr
        ? `استكشف واشاهد أفضل ${genreTitle} على منصة Filmoxa بجودة عالية HD وبدون إعلانات.`
        : isFr
            ? `Découvrez et regardez les meilleurs ${genreTitle} en streaming HD gratuit sur Filmoxa.`
            : `Stream top ${genreTitle} in HD quality online for free on Filmoxa.`;

    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://filmoxa.vercel.app';
    const path = `/genre/${cleanSlug}`;

    return {
        title,
        description,
        alternates: {
            canonical: `${SITE_URL}/${locale}${path}`,
            languages: {
                'en': `${SITE_URL}/en${path}`,
                'fr': `${SITE_URL}/fr${path}`,
                'ar': `${SITE_URL}/ar${path}`,
                'x-default': `${SITE_URL}/en${path}`,
            }
        }
    };
}

export default async function LocalizedGenrePage(props) {
    const params = await props.params;
    const { locale, slug } = params;
    const cleanSlug = slug.toLowerCase();
    const targetGenreConfig = GENRE_MAP[cleanSlug];

    const tmdbLang = locale === 'ar' ? 'ar-AE' : locale === 'fr' ? 'fr-FR' : 'en-US';
    const langQuery = `&language=${tmdbLang}`;

    // Sort genre keys so the target genre row is at the top, followed by all other genres
    const genreKeys = Object.keys(GENRE_MAP);
    const sortedGenreKeys = [
        ...(targetGenreConfig ? [cleanSlug] : []),
        ...genreKeys.filter(k => k !== cleanSlug)
    ];

    const allCategories = await Promise.all(
        sortedGenreKeys.map(async (gKey) => {
            const gConf = GENRE_MAP[gKey];
            if (!gConf) return null;

            const [mData, tData] = await Promise.all([
                fetchFromTMDB('/discover/movie', `&with_genres=${gConf.movie}${langQuery}`),
                fetchFromTMDB('/discover/tv', `&with_genres=${gConf.tv}${langQuery}`)
            ]);

            const mResults = (mData?.results || []).map(m => ({ ...m, media_type: 'movie' }));
            const tResults = (tData?.results || []).map(t => ({ ...t, media_type: 'tv' }));

            const blended = [];
            const maxL = Math.max(mResults.length, tResults.length);
            for (let i = 0; i < maxL; i++) {
                if (mResults[i]) blended.push(mResults[i]);
                if (tResults[i]) blended.push(tResults[i]);
            }

            const titleText = gConf.title[locale] || gConf.title.en || gKey.toUpperCase();

            return {
                id: `genre-${gKey}`,
                name: titleText,
                movies: blended,
                movieGenreId: gConf.movie,
                tvGenreId: gConf.tv,
            };
        })
    );

    const validCategories = allCategories.filter(Boolean);
    const primaryCategory = validCategories[0] || { movies: [], name: cleanSlug };
    const heroMovies = primaryCategory.movies.slice(0, 10);
    const categoryTitle = targetGenreConfig?.title[locale] || targetGenreConfig?.title.en || cleanSlug.toUpperCase();

    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://filmoxa.vercel.app';
    const canonicalUrl = `${SITE_URL}/${locale}/genre/${cleanSlug}`;

    const collectionLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': `${categoryTitle} Movies & TV Shows - Filmoxa`,
        'description': `Explore top ${categoryTitle} movies and TV shows streaming on Filmoxa. Free full HD stream without ads limits.`,
        'url': canonicalUrl,
        'mainEntity': {
            '@type': 'ItemList',
            'itemListElement': primaryCategory.movies.slice(0, 20).map((item, index) => ({
                '@type': 'ListItem',
                'position': index + 1,
                'name': item.title || item.name,
                'url': `${SITE_URL}/${locale}/${item.media_type || 'movie'}/${createSlug(item.title || item.name, item.id, item.media_type || 'movie')}`
            }))
        }
    };

    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            {
                '@type': 'ListItem',
                'position': 1,
                'name': locale === 'ar' ? 'الرئيسية' : locale === 'fr' ? 'Accueil' : 'Home',
                'item': `${SITE_URL}/${locale}`
            },
            {
                '@type': 'ListItem',
                'position': 2,
                'name': categoryTitle,
                'item': canonicalUrl
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <HomeClient
                initialHeroMovies={heroMovies}
                initialCategories={validCategories}
                contentType="all"
                filterType="default"
                locale={locale}
            />
        </>
    );
}

export async function generateStaticParams() {
    const locales = ['en', 'fr', 'ar'];
    const slugs = Object.keys(GENRE_MAP);
    const params = [];
    locales.forEach(locale => {
        slugs.forEach(slug => {
            params.push({ locale, slug });
        });
    });
    return params;
}
