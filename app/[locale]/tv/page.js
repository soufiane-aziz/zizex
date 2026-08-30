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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zizhub.vercel.app';

export async function generateMetadata(props) {
    const params = await props.params;
    const { locale } = params;

    const isAr = locale === 'ar';
    const isFr = locale === 'fr';

    const title = isAr
        ? 'مسلسلات أجنبية وعربية مترجمة - ZizHub'
        : isFr
            ? 'Séries TV en Streaming Gratuit - ZizHub'
            : 'Watch TV Shows Online Free - ZizHub';

    const description = isAr
        ? 'شاهد أحدث المسلسلات الأجنبية، التركية، والكورية مترجمة بجودة عالية HD على ZizHub. مسلسلات كاملة مجاناً.'
        : isFr
            ? 'Regardez les meilleures séries TV en streaming gratuit HD sur ZizHub. Séries complètes, toutes les saisons sans inscription.'
            : 'Stream the best and most popular TV shows for free in HD on ZizHub. Watch full seasons and episodes online.';

    const keywords = isAr
        ? ['مسلسلات', 'مسلسلات مترجمة', 'مسلسلات اجنبية', 'مسلسلات تركية', 'مسلسل', 'تحميل مسلسلات', 'حلقات مسلسلات']
        : isFr
            ? ['séries tv', 'séries streaming', 'regarder série', 'série complète vf', 'nouveautés séries', 'saison complète']
            : ['watch tv shows', 'free tv series', 'HD series', 'full episodes', 'stream tv online', 'popular shows'];

    return {
        title,
        description,
        keywords,
        alternates: {
            canonical: `${SITE_URL}/${locale}/tv`,
        },
        openGraph: {
            title,
            description,
            url: `${SITE_URL}/${locale}/tv`,
            siteName: 'ZizHub',
            images: [
                {
                    url: `${SITE_URL}/og-image.png`,
                    width: 1200,
                    height: 630,
                    alt: 'ZizHub TV Shows',
                }
            ],
            type: 'website',
            locale: isAr ? 'ar_AE' : isFr ? 'fr_FR' : 'en_US',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [`${SITE_URL}/icon-512.png`],
        },
    };
}

export default async function TVPage(props) {
    const params = await props.params;
    const { locale } = params;

    const contentType = 'tv';
    const filterType = 'default';

    const tmdbLang = locale === 'ar' ? 'ar-AE' : locale === 'fr' ? 'fr-FR' : 'en-US';
    const langQuery = `&language=${tmdbLang}`;

    let primaryDataResults = [];
    let heroMovies = [];
    let allCategories = [];

    const path = `/trending/${contentType}/week`;
    const data = await fetchFromTMDB(path, langQuery);
    primaryDataResults = data?.results?.map(item => ({ ...item, media_type: contentType })) || [];

    heroMovies = primaryDataResults.slice(0, 10);
    const remainingPrimary = primaryDataResults.slice(10);

    if (remainingPrimary.length > 0) {
        let rowTitle = locale === 'ar' ? "مسلسلات متداولة" : locale === 'fr' ? "Séries Tendances" : "Trending TV Shows";
        allCategories.push({
            id: 'primary-dynamic-row',
            name: rowTitle,
            movies: remainingPrimary,
        });
    }

    const genreListData = await fetchFromTMDB(`/genre/${contentType}/list`, langQuery);
    const genres = genreListData?.genres || [];

    const dynamicGenres = await Promise.all(
        genres.map(async (genre) => {
            let discoverQuery = `&with_genres=${genre.id}${langQuery}`;
            const gData = await fetchFromTMDB(`/discover/${contentType}`, discoverQuery);
            return {
                id: `${contentType}-${genre.id}`,
                name: genre.name,
                movies: gData?.results?.map(item => ({ ...item, media_type: contentType })) || [],
                contentType,
                genreId: genre.id,
            };
        })
    );

    dynamicGenres.forEach(genreRow => {
        if (genreRow.movies.length > 0) {
            allCategories.push(genreRow);
        }
    });

    return (
        <HomeClient
            initialHeroMovies={heroMovies}
            initialCategories={allCategories}
            locale={locale}
        />
    );
}
