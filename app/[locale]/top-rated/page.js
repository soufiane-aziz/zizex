import React, { cache } from 'react';
import HomeClient from '../../../components/HomeClient';

export const revalidate = 86400;

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY || 'f82feeca535cc0132d1ab38948a70405';
const BASE_URL = "https://api.themoviedb.org/3";

const UNIFIED_GENRES = [
    { name: { en: "Action", fr: "Action", ar: "أكشن" }, movieIds: "28", tvId: "10759" },
    { name: { en: "Adventure", fr: "Aventure", ar: "مغامرة" }, movieIds: "12", tvId: "10759" },
    { name: { en: "Animation", fr: "Animation", ar: "أنيميشن" }, movieIds: "16", tvId: "16" },
    { name: { en: "Comedy", fr: "Comédie", ar: "كوميدي" }, movieIds: "35", tvId: "35" },
    { name: { en: "Crime", fr: "Crime", ar: "جريمة" }, movieIds: "80", tvId: "80" },
    { name: { en: "Documentary", fr: "Documentaire", ar: "وثائقي" }, movieIds: "99", tvId: "99" },
    { name: { en: "Drama", fr: "Drame", ar: "دراما" }, movieIds: "18", tvId: "18" },
    { name: { en: "Family", fr: "Famille", ar: "عائلي" }, movieIds: "10751", tvId: "10751" },
    { name: { en: "Fantasy", fr: "Fantaisie", ar: "فانتازيا" }, movieIds: "14", tvId: "10765" },
    { name: { en: "Mystery", fr: "Mystère", ar: "غموض" }, movieIds: "9648", tvId: "9648" },
    { name: { en: "Science Fiction", fr: "Science Fiction", ar: "خيال علمي" }, movieIds: "878", tvId: "10765" }
];

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
        ? 'أفلام ومسلسلات الأعلى تقييماً - ZizHub'
        : isFr
            ? 'Films et Séries Mieux Notés - ZizHub'
            : 'Top Rated Movies & TV Shows - ZizHub';

    const description = isAr
        ? 'اكتشف أعلى الأفلام والمسلسلات تقييماً في التاريخ. شاهد الأعمال الأكثر شهرة واعجاباً من قبل الجمهور مجاناً على ZizHub.'
        : isFr
            ? 'Découvrez les films et séries les mieux notés de tous les temps. Regardez les chefs-d\'œuvre du cinéma gratuitement sur ZizHub.'
            : 'Discover the highest-rated movies and TV shows of all time. Stream critically acclaimed masterpieces for free on ZizHub.';

    const keywords = isAr
        ? ['اعلى تقييم', 'افلام اسطورية', 'افلام عظيمة', 'مسلسلات اعلى تقييم', 'مشاهدة افلام', 'افلام imdb']
        : isFr
            ? ['films mieux notés', 'top films', 'top séries', 'chefs-d\'œuvre', 'films imdb', 'meilleurs films']
            : ['top rated movies', 'highest rated tv', 'imdb top 250', 'best movies', 'acclaimed movies', 'classic movies'];

    return {
        title,
        description,
        keywords,
        alternates: {
            canonical: `${SITE_URL}/${locale}/top-rated`,
        },
        openGraph: {
            title,
            description,
            url: `${SITE_URL}/${locale}/top-rated`,
            siteName: 'ZizHub',
            images: [
                {
                    url: `${SITE_URL}/icon-512.png`,
                    width: 512,
                    height: 512,
                    alt: 'ZizHub Top Rated',
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

export default async function TopRatedPage(props) {
    const params = await props.params;
    const { locale } = params;

    const tmdbLang = locale === 'ar' ? 'ar-AE' : locale === 'fr' ? 'fr-FR' : 'en-US';
    const langQuery = `&language=${tmdbLang}`;

    let primaryDataResults = [];
    let heroMovies = [];
    let allCategories = [];

    const moviePath = '/movie/top_rated';
    const tvPath = '/tv/top_rated';

    const [movieData, tvData] = await Promise.all([
        fetchFromTMDB(moviePath, langQuery),
        fetchFromTMDB(tvPath, langQuery)
    ]);

    const mResults = movieData?.results?.map(m => ({ ...m, media_type: 'movie' })) || [];
    const tResults = tvData?.results?.map(t => ({ ...t, media_type: 'tv' })) || [];

    const maxLen = Math.max(mResults.length, tResults.length);
    for (let i = 0; i < maxLen; i++) {
        if (mResults[i]) primaryDataResults.push(mResults[i]);
        if (tResults[i]) primaryDataResults.push(tResults[i]);
    }

    heroMovies = primaryDataResults.slice(0, 10);
    const remainingPrimary = primaryDataResults.slice(10);

    if (remainingPrimary.length > 0) {
        let rowTitle = locale === 'ar' ? "الأعلى تقييمًا" : locale === 'fr' ? "Succès Mieux Notés" : "Top Rated Hits";
        allCategories.push({
            id: 'primary-dynamic-row',
            name: rowTitle,
            movies: remainingPrimary,
        });
    }

    const blendedGenres = await Promise.all(
        UNIFIED_GENRES.map(async (genre) => {
            const mPath = `/discover/movie`;
            const tPath = `/discover/tv`;

            let mQuery = `&with_genres=${genre.movieIds}${langQuery}&sort_by=vote_average.desc&vote_count.gte=200`;
            let tQuery = `&with_genres=${genre.tvId}${langQuery}&sort_by=vote_average.desc&vote_count.gte=200`;

            const [mData, tData] = await Promise.all([
                fetchFromTMDB(mPath, mQuery),
                fetchFromTMDB(tPath, tQuery)
            ]);

            const movieItems = mData?.results?.map(item => ({ ...item, media_type: 'movie' })) || [];
            const tvItems = tData?.results?.map(item => ({ ...item, media_type: 'tv' })) || [];

            const blendedList = [];
            const maxL = Math.max(movieItems.length, tvItems.length);
            for (let i = 0; i < maxL; i++) {
                if (movieItems[i]) blendedList.push(movieItems[i]);
                if (tvItems[i]) blendedList.push(tvItems[i]);
            }

            const resolvedRowName = genre.name[locale] || genre.name.en;

            return {
                id: `blended-${resolvedRowName.toLowerCase().replace(/\s+/g, '-')}`,
                name: locale === 'ar' ? `الأعلى تقييمًا: ${resolvedRowName}` : locale === 'fr' ? `Top Mieux Notés: ${resolvedRowName}` : `Top Rated ${resolvedRowName}`,
                movies: blendedList,
                movieGenreId: genre.movieIds,
                tvGenreId: genre.tvId,
            };
        })
    );

    blendedGenres.forEach(genreRow => {
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
