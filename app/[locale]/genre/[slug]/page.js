import React, { cache } from 'react';
import HomeClient from '../../../../components/HomeClient';

export const revalidate = 86400; // 24 hours caching on Edge CDN

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
        const res = await fetch(url, { next: { revalidate: 86400 } });
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
        ? `شاهد ${genreTitle} أونلاين مجاناً | ZizHub`
        : isFr
            ? `Regarder ${genreTitle} en Streaming Gratuit | ZizHub`
            : `Watch ${genreTitle} Online | ZizHub`;

    const description = isAr
        ? `استكشف أفضل ${genreTitle} بجودة عالية وبدون إعلانات مزعجة على ZizHub.`
        : isFr
            ? `Découvrez les meilleurs ${genreTitle} en haute définition sur ZizHub.`
            : `Stream top ${genreTitle} in HD quality online for free on ZizHub.`;

    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zizhub.vercel.app';
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
    const genreConfig = GENRE_MAP[cleanSlug];

    const tmdbLang = locale === 'ar' ? 'ar-AE' : locale === 'fr' ? 'fr-FR' : 'en-US';
    const langQuery = `&language=${tmdbLang}`;

    let movies = [];
    let tvs = [];

    if (genreConfig) {
        const [mData, tData] = await Promise.all([
            fetchFromTMDB('/discover/movie', `&with_genres=${genreConfig.movie}${langQuery}`),
            fetchFromTMDB('/discover/tv', `&with_genres=${genreConfig.tv}${langQuery}`)
        ]);
        movies = (mData?.results || []).map(m => ({ ...m, media_type: 'movie' }));
        tvs = (tData?.results || []).map(t => ({ ...t, media_type: 'tv' }));
    }

    const blendedList = [];
    const maxLen = Math.max(movies.length, tvs.length);
    for (let i = 0; i < maxLen; i++) {
        if (movies[i]) blendedList.push(movies[i]);
        if (tvs[i]) blendedList.push(tvs[i]);
    }

    const heroMovies = blendedList.slice(0, 10);
    const categoryTitle = genreConfig?.title[locale] || genreConfig?.title.en || cleanSlug.toUpperCase();

    const categoryRow = {
        id: `genre-${cleanSlug}`,
        name: categoryTitle,
        movies: blendedList,
        movieGenreId: genreConfig?.movie,
        tvGenreId: genreConfig?.tv,
    };

    return (
        <HomeClient
            initialHeroMovies={heroMovies}
            initialCategories={[categoryRow]}
            contentType="all"
            filterType="default"
            locale={locale}
        />
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
