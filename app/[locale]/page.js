import React, { cache } from 'react';
import HomeClient from '../../components/HomeClient';

export const revalidate = 604800; // 7 days caching at the edge CDN level

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
        const res = await fetch(url, { next: { revalidate: 604800 } });
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        console.error(`TMDB fetch error for ${path}:`, err);
        return null;
    }
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://filmoxa.vercel.app';

export async function generateMetadata(props) {
    const params = await props.params;
    const { locale } = params;

    const isAr = locale === 'ar';
    const isFr = locale === 'fr';

    const title = isAr
        ? 'Filmoxa - شاهد أفلام ومسلسلات أونلاين مجاناً'
        : isFr
            ? 'Filmoxa - Regarder Films et Séries en Streaming Gratuit'
            : 'Filmoxa - Watch Movies & TV Shows Online Free';

    const description = isAr
        ? 'استمتع بأفضل الأفلام والمسلسلات مجاناً وبجودة عالية على Filmoxa.'
        : isFr
            ? 'Regardez gratuitement les meilleurs films et séries sur Filmoxa.'
            : 'Stream the best movies and TV shows for free on Filmoxa.';

    const keywords = isAr
        ? ['موقع filmoxa', 'مشاهدة افلام اونلاين', 'افلام ومسلسلات مجانا', 'موقع سيما', 'افلام مترجمة اونلاين', 'مسلسلات رمضان 2026', 'تحميل افلام مجانا', 'موقع مشاهدة افلام', 'افلام اكشن مترجمة', 'مسلسلات اجنبية مترجمة', 'موقع برستيج', 'ايجي بست البديل', 'السينما للجميع', 'افلام اون لاين hd', 'موقع سيما فور يو', 'مشاهدة مسلسلات اونلاين', 'افلام رعب مترجمة', 'موقع ماي سيما', 'افلام هندية مترجمة', 'تحميل مسلسلات مجانا', 'نتفليكس', 'موقع نتفليكس مجانا', 'ايجي بست', 'ماي سيما الاصلي', 'سيما فور يو', 'برستيج مسلسلات', 'شاهد افضل الافلام', 'عرب سيد', 'فاصل اعلاني', 'اكوام', 'توك توك سيما']
        : isFr
            ? ['filmoxa streaming', 'regarder films gratuits', 'streaming vf', 'film streaming gratuit', 'site de streaming film', 'series tv streaming', 'cinema en ligne', 'voir film gratuit', 'top film streaming', 'streaming hd gratuit', 'films complets vf', 'series streaming gratuit', 'platforme de streaming', 'cinema streaming gratuit', 'nouveautes films streaming', 'voir series en streaming', 'streaming gratuit sans inscription', 'films streaming vf et vostfr', 'meilleur site streaming', 'film d action streaming', 'Netflix gratuit', 'TopCinema streaming', 'Cima4U streaming', 'MyCima vf', 'Wawacity streaming', 'Frenchstream alternative', 'Zone-Telechargement', 'Cpasbien film']
            : ['filmoxa', 'Filmoxa', 'watch movies online', 'free streaming platform', 'HD movies streaming', 'free TV series online', 'top rated movies', 'latest cinema releases', 'watch series free', 'cinema for you', 'movie streaming site', 'online film platform', 'action movies free', 'sci-fi series online', 'trending movies 2026', 'hd film streaming', 'stream full movies', 'watch free tv shows', 'best movie streaming site', 'cinema streaming free', 'Netflix', 'watch Netflix movies free', 'HBO Max streaming', 'Disney Plus free', 'TopCinema', 'EgyBest alternative', 'MyCima', 'Cima4U', 'Shahid VIP free', 'WatchIt movies'];

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
                'x-default': `${SITE_URL}/en`,
            }
        },
        openGraph: {
            title,
            description,
            url: `${SITE_URL}/${locale}`,
            siteName: 'Filmoxa',
            images: [
                {
                    url: `${SITE_URL}/og-image.png?v=3`,
                    width: 1024,
                    height: 1024,
                    alt: 'Filmoxa - Watch Movies & TV Shows For Free',
                }
            ],
            type: 'website',
            locale: isAr ? 'ar_AE' : isFr ? 'fr_FR' : 'en_US',
        },
        twitter: {
            card: 'summary',
            title,
            description,
            images: [`${SITE_URL}/og-image.png?v=3`],
        },
        keywords: isAr
            ? ['أفلام', 'مسلسلات', 'مشاهدة مجانية', 'فيلم', 'مسلسل', 'بث مباشر', 'HD']
            : isFr
                ? ['films', 'séries', 'streaming gratuit', 'regarder en ligne', 'HD', 'cinéma']
                : ['watch movies online', 'free streaming', 'TV shows', 'HD movies', 'watch online free'],
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
            : (locale === 'ar' ? "المتداول الآن" : locale === 'fr' ? "Tendances Actuelles" : "Trending Now");

        if (contentType !== 'all') {
            if (filterType === 'top_rated') {
                rowTitle = contentType === 'movie'
                    ? (locale === 'ar' ? "أفلام أعلى تقييمًا" : locale === 'fr' ? "Films Mieux Notés" : "Top Rated Movies")
                    : (locale === 'ar' ? "مسلسلات أعلى تقييمًا" : locale === 'fr' ? "Séries Mieux Notées" : "Top Rated TV");
            } else {
                rowTitle = contentType === 'movie'
                    ? (locale === 'ar' ? "أفلام متداولة" : locale === 'fr' ? "Films Tendances" : "Trending Movies")
                    : (locale === 'ar' ? "مسلسلات متداولة" : locale === 'fr' ? "Séries Tendances" : "Trending TV");
            }
        }

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
