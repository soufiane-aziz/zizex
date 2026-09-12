import React, { cache } from 'react';
import HomeClient from '../../../components/HomeClient';

export const revalidate = 604800;

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY || 'f82feeca535cc0132d1ab38948a70405';
const BASE_URL = "https://api.themoviedb.org/3";

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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zizex.vercel.app';

export async function generateMetadata(props) {
    const params = await props.params;
    const { locale } = params;

    const isAr = locale === 'ar';
    const isFr = locale === 'fr';

    const title = isAr
        ? 'أفلام مترجمة اونلاين - Zizex'
        : isFr
            ? 'Films en Streaming Gratuit - Zizex'
            : 'Watch Movies Online Free - Zizex';

    const description = isAr
        ? 'مشاهدة أحدث الأفلام الأجنبية والعربية مترجمة وبجودة عالية HD على Zizex. أفلام أكشن، رعب، دراما، والمزيد مجاناً.'
        : isFr
            ? 'Regardez les derniers films en streaming gratuit HD sur Zizex. Films d\'action, comédie, horreur et bien plus sans inscription.'
            : 'Stream the latest and greatest movies for free in HD on Zizex. Action, comedy, horror, and more.';

    const keywords = isAr
        ? ['مشاهدة افلام', 'افلام مترجمة', 'افلام اكشن', 'افلام رعب', 'فيلم', 'تحميل افلام', 'افلام 2026']
        : isFr
            ? ['films en streaming', 'film gratuit', 'voir film', 'film complet vf', 'nouveautés films', 'film hd']
            : ['watch movies', 'free movies', 'HD movies', 'action movies', 'horror movies', 'stream films'];

    return {
        title,
        description,
        keywords,
        alternates: {
            canonical: `${SITE_URL}/${locale}/movies`,
        },
        openGraph: {
            title,
            description,
            url: `${SITE_URL}/${locale}/movies`,
            siteName: 'Zizex',
            images: [
                {
                    url: `${SITE_URL}/og-image.jpg?v=6`,
                    width: 1024,
                    height: 1024,
                    alt: 'Zizex Movies',
                }
            ],
            type: 'website',
            locale: isAr ? 'ar_AE' : isFr ? 'fr_FR' : 'en_US',
        },
        twitter: {
            card: 'summary',
            title,
            description,
            images: [`${SITE_URL}/og-image.jpg?v=6`],
        },
    };
}

export default async function MoviesPage(props) {
    const params = await props.params;
    const { locale } = params;

    const contentType = 'movie';
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
        let rowTitle = locale === 'ar' ? "أفلام متداولة" : locale === 'fr' ? "Films Tendances" : "Trending Movies";
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
