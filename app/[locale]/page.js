import React, { cache } from 'react';
import HomeClient from '../../components/HomeClient';
import { fetchFromTMDB } from '../../lib/tmdb';

export const revalidate = 604800; // 7 days caching at the edge CDN level

const UNIFIED_GENRES = [
    { name: { en: "Action & Adventure", fr: "Action & Aventure", ar: "أكشن ومغامرة" }, movieIds: "28,12", tvId: "10759" },
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zizex.vercel.app';

export async function generateMetadata(props) {
    const params = await props.params;
    const { locale } = params;

    const isAr = locale === 'ar';
    const isFr = locale === 'fr';

    const title = isAr
        ? 'Zizex - موقع Zizex مشاهدة أفلام ومسلسلات أونلاين مجاناً'
        : isFr
            ? 'Zizex - Regarder Films et Séries en Streaming Gratuit | Site Officiel'
            : 'Zizex - Watch Free Movies & TV Shows Online | Official Site';

    const description = isAr
        ? 'موقع Zizex الأصلي لمشاهدة أحدث الأفلام والمسلسلات مجاناً وبجودة عالية HD. المنصة الرسمية لـ Zizex.'
        : isFr
            ? 'Zizex est la plateforme officielle pour regarder gratuitement les meilleurs films et séries en streaming HD.'
            : 'Zizex is the official free streaming platform to watch thousands of top movies and TV series free online in HD.';

    const keywords = isAr
        ? ['zizex', 'ziz ex', 'Zizex', 'ZIZEX', 'ziz-ex', 'Ziz Ex', 'ZIZ EX', 'zizex.vercel.app', 'موقع zizex', 'منصة zizex', 'zizex streaming', 'مشاهدة افلام اونلاين', 'افلام ومسلسلات مجانا', 'موقع سيما', 'افلام مترجمة اونلاين', 'تحميل افلام مجانا', 'موقع مشاهدة افلام', 'افلام اكشن مترجمة', 'مسلسلات اجنبية مترجمة', 'ايجي بست البديل', 'السينما للجميع']
        : isFr
            ? ['zizex', 'ziz ex', 'Zizex', 'ZIZEX', 'ziz-ex', 'Ziz Ex', 'ZIZ EX', 'zizex.vercel.app', 'zizex streaming', 'site zizex', 'zizex official', 'zizex fr', 'regarder films gratuits', 'streaming vf', 'film streaming gratuit', 'site de streaming film', 'series tv streaming', 'cinema en ligne', 'voir film gratuit', 'top film streaming', 'streaming hd gratuit', 'films complets vf']
            : ['zizex', 'ziz ex', 'Zizex', 'ZIZEX', 'ziz-ex', 'Ziz Ex', 'ZIZ EX', 'zizex.vercel.app', 'zizex streaming', 'zizex app', 'zizex site', 'zizex official', 'watch movies online', 'free streaming platform', 'HD movies streaming', 'free TV series online', 'top rated movies', 'latest cinema releases', 'watch series free', 'cinema for you', 'movie streaming site'];

    return {
        title,
        description,
        keywords,
        alternates: {
            canonical: `${SITE_URL}/${locale}`,
            languages: {
                'en': `${SITE_URL}/en`,
                'fr': `${SITE_URL}/fr`,
                'ar': `${SITE_URL}/ar`,
                'x-default': `${SITE_URL}/`,
            }
        },
        openGraph: {
            title,
            description,
            url: `${SITE_URL}/${locale}`,
            siteName: 'Zizex',
            images: [
                {
                    url: `${SITE_URL}/og-image.jpg?v=6`,
                    width: 1024,
                    height: 1024,
                    alt: 'Zizex - Watch Movies & TV Shows For Free',
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

export default async function LocalizedHomePage(props) {
    const searchParams = await props.searchParams;
    const params = await props.params;
    const { locale } = params;

    const contentType = searchParams.type || 'all';
    const filterType = searchParams.filter || 'default';

    // Format language parameter for TMDB calls
    const tmdbLang = locale === 'ar' ? 'ar-AE' : locale === 'fr' ? 'fr-FR' : 'en-US';
    const langQuery = `&language=${tmdbLang}`;

    let primaryDataResults = [];
    let heroMovies = [];
    let allCategories = [];

    // Fetch Hero and Primary Row data
    if (contentType === 'all') {
        const isTop = filterType === 'top_rated';
        const moviePath = isTop ? '/movie/top_rated' : '/trending/movie/week';
        const tvPath = isTop ? '/tv/top_rated' : '/trending/tv/week';

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
    } else {
        // movie or tv
        const isTop = filterType === 'top_rated';
        const path = isTop ? `/${contentType}/top_rated` : `/trending/${contentType}/week`;
        const data = await fetchFromTMDB(path, langQuery);
        primaryDataResults = data?.results?.map(item => ({ ...item, media_type: contentType })) || [];
    }

    heroMovies = primaryDataResults.slice(0, 10);
    const remainingPrimary = primaryDataResults.slice(10);

    // Set up categories row
    if (remainingPrimary.length > 0) {
        let rowTitle = filterType === 'top_rated'
            ? (locale === 'ar' ? "الأعلى تقييمًا" : locale === 'fr' ? "Succès Mieux Notés" : "Top Rated Hits")
            : (locale === 'ar' ? "الأكثر مشاهدة الآن" : locale === 'fr' ? "Tendances du Moment" : "Trending Now");

        allCategories.push({
            id: 'primary-dynamic-row',
            name: rowTitle,
            movies: remainingPrimary,
            // loadMore is client-side fallback - handled inside client row
        });
    }

    // Fetch category rows
    if (contentType === 'all') {
        const blendedGenres = await Promise.all(
            UNIFIED_GENRES.map(async (genre) => {
                const mPath = `/discover/movie`;
                const tPath = `/discover/tv`;

                let mQuery = `&with_genres=${genre.movieIds}${langQuery}`;
                let tQuery = `&with_genres=${genre.tvId}${langQuery}`;

                if (filterType === 'top_rated') {
                    mQuery += `&sort_by=vote_average.desc&vote_count.gte=200`;
                    tQuery += `&sort_by=vote_average.desc&vote_count.gte=200`;
                }

                const [mData, tData] = await Promise.all([
                    fetchFromTMDB(mPath, mQuery),
                    fetchFromTMDB(tPath, tQuery)
                ]);

                const movieItems = mData?.results?.map(item => ({ ...item, media_type: 'movie' })) || [];
                const tvItems = tData?.results?.map(item => ({ ...item, media_type: 'tv' })) || [];

                const blendedList = [];
                const maxLen = Math.max(movieItems.length, tvItems.length);
                for (let i = 0; i < maxLen; i++) {
                    if (movieItems[i]) blendedList.push(movieItems[i]);
                    if (tvItems[i]) blendedList.push(tvItems[i]);
                }

                const resolvedRowName = genre.name[locale] || genre.name.en;

                return {
                    id: `blended-${resolvedRowName.toLowerCase().replace(/\s+/g, '-')}`,
                    name: filterType === 'top_rated'
                        ? (locale === 'ar' ? `الأعلى تقييمًا: ${resolvedRowName}` : locale === 'fr' ? `Top Mieux Notés: ${resolvedRowName}` : `Top Rated ${resolvedRowName}`)
                        : resolvedRowName,
                    movies: blendedList.slice(0, 12),
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
    } else {
        // movie or tv genres
        const genreListData = await fetchFromTMDB(`/genre/${contentType}/list`, langQuery);
        const genres = genreListData?.genres || [];

        const dynamicGenres = await Promise.all(
            genres.map(async (genre) => {
                let discoverQuery = `&with_genres=${genre.id}${langQuery}`;
                if (filterType === 'top_rated') {
                    discoverQuery += `&sort_by=vote_average.desc&vote_count.gte=300`;
                }
                const data = await fetchFromTMDB(`/discover/${contentType}`, discoverQuery);
                return {
                    id: `${contentType}-${genre.id}`,
                    name: filterType === 'top_rated'
                        ? (locale === 'ar' ? `أعلى تقييمًا: ${genre.name}` : locale === 'fr' ? `Top Mieux Noté: ${genre.name}` : `Top Rated ${genre.name}`)
                        : genre.name,
                    movies: (data?.results?.map(item => ({ ...item, media_type: contentType })) || []).slice(0, 12),
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
    }

    return (
        <HomeClient
            initialHeroMovies={heroMovies}
            initialCategories={allCategories}
            contentType={contentType}
            filterType={filterType}
            locale={locale}
        />
    );
}
