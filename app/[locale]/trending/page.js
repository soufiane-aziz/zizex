import React, { cache } from 'react';
import HomeClient from '../../../components/HomeClient';

export const revalidate = 86400;

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY || 'f82feeca535cc0132d1ab38948a70405';
const BASE_URL = "https://api.themoviedb.org/3";

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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zizex.vercel.app';

// All genres — movies + matching TV genre id
const GENRES = [
    { movieId: '28,12', tvId: 10759, name: { en: 'Action & Adventure', fr: 'Action & Aventure', ar: 'أكشن ومغامرة' } },
    { movieId: 16,    tvId: 16,    name: { en: 'Animation',       fr: 'Animation',         ar: 'أنيميشن'           } },
    { movieId: 35,    tvId: 35,    name: { en: 'Comedy',          fr: 'Comédie',           ar: 'كوميدي'            } },
    { movieId: 80,    tvId: 80,    name: { en: 'Crime',           fr: 'Crime',             ar: 'جريمة'             } },
    { movieId: 99,    tvId: 99,    name: { en: 'Documentary',     fr: 'Documentaire',      ar: 'وثائقي'            } },
    { movieId: 18,    tvId: 18,    name: { en: 'Drama',           fr: 'Drame',             ar: 'دراما'             } },
    { movieId: 10751, tvId: 10751, name: { en: 'Family',          fr: 'Famille',           ar: 'عائلي'             } },
    { movieId: 14,    tvId: 10765, name: { en: 'Fantasy',         fr: 'Fantaisie',         ar: 'فانتازيا'          } },
    { movieId: 36,    tvId: null,  name: { en: 'History',         fr: 'Histoire',          ar: 'تاريخي'            } },
    { movieId: 27,    tvId: null,  name: { en: 'Horror',          fr: 'Horreur',           ar: 'رعب'               } },
    { movieId: 10402, tvId: 10402, name: { en: 'Music',           fr: 'Musique',           ar: 'موسيقى'            } },
    { movieId: 9648,  tvId: 9648,  name: { en: 'Mystery',         fr: 'Mystère',           ar: 'غموض'              } },
    { movieId: 10749, tvId: null,  name: { en: 'Romance',         fr: 'Romance',           ar: 'رومانسي'           } },
    { movieId: 878,   tvId: 10765, name: { en: 'Science Fiction', fr: 'Science-Fiction',   ar: 'خيال علمي'         } },
    { movieId: 53,    tvId: 9648,  name: { en: 'Thriller',        fr: 'Thriller',          ar: 'إثارة'             } },
    { movieId: 10752, tvId: null,  name: { en: 'War',             fr: 'Guerre',            ar: 'حرب'               } },
    { movieId: 37,    tvId: null,  name: { en: 'Western',         fr: 'Western',           ar: 'ويسترن'            } },
];

export async function generateMetadata(props) {
    const params = await props.params;
    const { locale } = params;

    const isAr = locale === 'ar';
    const isFr = locale === 'fr';

    const title = isAr
        ? 'الأكثر مشاهدة الآن - أفلام ومسلسلات رائجة | Zizex'
        : isFr
            ? 'Tendances du Moment - Films et Séries Populaires | Zizex'
            : 'Trending Now - Most Watched Movies & TV Shows | Zizex';

    const description = isAr
        ? 'اكتشف الأفلام والمسلسلات الأكثر مشاهدة الآن حسب النوع. شاهد ترند الأكشن، الدراما، الرعب، والمزيد مجاناً على Zizex.'
        : isFr
            ? 'Découvrez les films et séries les plus regardés par genre. Action, Drame, Horreur, Comédie et plus encore en tendance sur Zizex.'
            : 'Discover the most-watched movies and TV shows by genre. Trending Action, Drama, Horror, Comedy and more — free on Zizex.';

    const keywords = isAr
        ? ['ترند أكشن', 'ترند دراما', 'ترند رعب', 'افلام رائجة', 'مسلسلات رائجة', 'الاكثر مشاهدة 2026']
        : isFr
            ? ['tendances action', 'tendances drame', 'films populaires par genre', 'séries tendance', 'streaming gratuit']
            : ['trending action movies', 'trending drama series', 'trending horror', 'popular by genre', 'most watched 2026'];

    return {
        title,
        description,
        keywords,
        alternates: {
            canonical: `${SITE_URL}/${locale}/trending`,
            languages: {
                en: `${SITE_URL}/en/trending`,
                fr: `${SITE_URL}/fr/trending`,
                ar: `${SITE_URL}/ar/trending`,
                'x-default': `${SITE_URL}/en/trending`,
            },
        },
        openGraph: {
            title,
            description,
            url: `${SITE_URL}/${locale}/trending`,
            siteName: 'Zizex',
            images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1024, height: 1024, alt: 'Zizex Trending' }],
            type: 'website',
            locale: isAr ? 'ar_AE' : isFr ? 'fr_FR' : 'en_US',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [`${SITE_URL}/og-image.jpg`],
        },
    };
}

export async function generateStaticParams() {
    return [{ locale: 'en' }, { locale: 'fr' }, { locale: 'ar' }];
}

export default async function TrendingPage(props) {
    const params = await props.params;
    const { locale } = params;

    const tmdbLang = locale === 'ar' ? 'ar-AE' : locale === 'fr' ? 'fr-FR' : 'en-US';
    const lang = `&language=${tmdbLang}`;

    // Fetch hero data + all genre rows in one parallel round-trip
    const [trendingAllDay, ...genreResults] = await Promise.all([
        // Hero: today's trending (mixed)
        fetchFromTMDB('/trending/all/day', lang),
        // One request per genre — blended movie+tv discover
        ...GENRES.map(g =>
            fetchFromTMDB('/discover/movie', `${lang}&sort_by=popularity.desc&with_genres=${g.movieId}&vote_count.gte=30&page=1`)
        ),
        ...GENRES.map(g =>
            g.tvId
                ? fetchFromTMDB('/discover/tv', `${lang}&sort_by=popularity.desc&with_genres=${g.tvId}&vote_count.gte=10&page=1`)
                : Promise.resolve(null)
        ),
    ]);

    // Hero slides
    const heroMovies = (trendingAllDay?.results || [])
        .slice(0, 10)
        .map(item => ({
            ...item,
            media_type: item.media_type || (item.title ? 'movie' : 'tv'),
        }));

    const label = (ar, fr, en) => locale === 'ar' ? ar : locale === 'fr' ? fr : en;
    const allCategories = [];

    // Split genre results into movies half and TV half
    const movieResults = genreResults.slice(0, GENRES.length);
    const tvResults = genreResults.slice(GENRES.length);

    GENRES.forEach((genre, i) => {
        const gName = genre.name[locale] || genre.name.en;

        // Blend movie + TV items interleaved
        const movies = (movieResults[i]?.results || []).map(m => ({ ...m, media_type: 'movie' }));
        const tvShows = (tvResults[i]?.results || []).map(t => ({ ...t, media_type: 'tv' }));

        const blended = [];
        const max = Math.max(movies.length, tvShows.length);
        for (let j = 0; j < max; j++) {
            if (movies[j]) blended.push(movies[j]);
            if (tvShows[j]) blended.push(tvShows[j]);
        }

        // Fall back to movies only if no TV genre exists
        const items = blended.length > 0 ? blended : movies;

        if (items.length > 0) {
            allCategories.push({
                id: `trending-${genre.movieId}`,
                name: gName,
                movies: items,
                movieGenreId: genre.movieId,
                tvGenreId: genre.tvId,
            });
        }
    });

    // BreadcrumbList JSON-LD
    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': label('الرئيسية', 'Accueil', 'Home'), 'item': `${SITE_URL}/${locale}` },
            { '@type': 'ListItem', 'position': 2, 'name': label('الأكثر مشاهدة', 'Tendances', 'Trending'), 'item': `${SITE_URL}/${locale}/trending` },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
            <HomeClient
                initialHeroMovies={heroMovies}
                initialCategories={allCategories}
                locale={locale}
            />
        </>
    );
}
