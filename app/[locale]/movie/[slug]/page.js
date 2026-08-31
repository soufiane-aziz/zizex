import React, { cache } from 'react';
import WatchMovieClient from '../../../../components/WatchMovieClient';
import { createSlug, extractIdFromSlug } from '../../../../lib/slug';

export const revalidate = 604800; // 7 days caching on Edge CDN

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY || 'f82feeca535cc0132d1ab38948a70405';
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

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

// Helper to resolve Movie ID from slug (extracts trailing numeric ID or text search)
const resolveMovieId = cache(async (slug) => {
    const extractedId = extractIdFromSlug(slug);
    if (extractedId) return extractedId;

    // Try search by query
    const cleanQuery = slug.replace(/-/g, ' ');
    const data = await fetchFromTMDB('/search/movie', `&query=${encodeURIComponent(cleanQuery)}`);
    if (data && data.results && data.results.length > 0) {
        return data.results[0].id;
    }
    return null;
});

// Generate dynamic metadata for French, Arabic and English
export async function generateMetadata(props) {
    const params = await props.params;
    const { locale, slug } = params;
    const movieId = await resolveMovieId(slug);

    if (!movieId) {
        return {
            title: 'ZizHub - Watch Movies Online',
            description: 'Stream movie databases seamlessly.'
        };
    }

    const tmdbLang = locale === 'ar' ? 'ar-AE' : locale === 'fr' ? 'fr-FR' : 'en-US';
    const movieDetails = await fetchFromTMDB(`/movie/${movieId}`, `&language=${tmdbLang}`);

    if (!movieDetails) {
        return {
            title: 'ZizHub - Watch Movies Online'
        };
    }

    const movieTitle = movieDetails.title;
    const isAr = locale === 'ar';
    const isFr = locale === 'fr';

    const docTitle = isAr
        ? `ZizHub | شاهد ${movieTitle} أونلاين مجاناً`
        : isFr
            ? `ZizHub | Regarder ${movieTitle} en Streaming Gratuit`
            : `ZizHub | Watch ${movieTitle} Online Free`;

    const docDesc = movieDetails.overview
        ? movieDetails.overview.substring(0, 160)
        : `Stream ${movieTitle} online on ZizHub.`;

    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zizhub.vercel.app';
    const ogImage = movieDetails.backdrop_path
        ? `${IMAGE_BASE_URL}/w780${movieDetails.backdrop_path}`
        : movieDetails.poster_path
            ? `${IMAGE_BASE_URL}/w500${movieDetails.poster_path}`
            : `${SITE_URL}/icon-512.png`;

    const seoSlug = createSlug(movieDetails.title, movieId, 'movie');
    const path = `/movie/${seoSlug}`;
    const alternates = {
        canonical: `${SITE_URL}/${locale}${path}`,
        languages: {
            'en': `${SITE_URL}/en${path}`,
            'fr': `${SITE_URL}/fr${path}`,
            'ar': `${SITE_URL}/ar${path}`,
            'x-default': `${SITE_URL}/en${path}`,
        }
    };

    const genresList = (movieDetails.genres || []).map(g => g.name).join(', ');
    const year = movieDetails.release_date ? movieDetails.release_date.split('-')[0] : '';
    const keywords = isAr
        ? [`شاهد ${movieTitle}`, `فيلم ${movieTitle} مترجم`, `${movieTitle} كامل HD`, `تحميل فيلم ${movieTitle}`, `أفلام ${year}`, genresList]
        : isFr
            ? [`regarder ${movieTitle}`, `film ${movieTitle} streaming vf`, `${movieTitle} complet hd`, `telecharger ${movieTitle}`, `films ${year}`, genresList]
            : [`watch ${movieTitle} online`, `stream ${movieTitle} free`, `${movieTitle} full movie HD`, `${movieTitle} ${year}`, `watch ${movieTitle} HD`, genresList];

    return {
        title: docTitle,
        description: docDesc,
        keywords: keywords,
        alternates,
        openGraph: {
            title: docTitle,
            description: docDesc,
            url: `${SITE_URL}/${locale}${path}`,
            images: [
                {
                    url: ogImage,
                    width: 800,
                    height: 600,
                    alt: movieTitle,
                }
            ],
            type: 'video.movie',
        },
        twitter: {
            card: 'summary_large_image',
            title: docTitle,
            description: docDesc,
            images: [ogImage],
        }
    };
}

export default async function LocalizedMoviePage(props) {
    const params = await props.params;
    const { locale, slug } = params;
    const movieId = await resolveMovieId(slug);

    if (!movieId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white font-sans">
                <div className="text-center">
                    <h1 className="text-3xl font-black text-red-600 mb-4">404</h1>
                    <p className="text-sm text-zinc-400">Movie records could not be resolved inside our system databanks.</p>
                </div>
            </div>
        );
    }

    const tmdbLang = locale === 'ar' ? 'ar-AE' : locale === 'fr' ? 'fr-FR' : 'en-US';
    const langQuery = `&language=${tmdbLang}`;

    // Fetch Movie Details
    const movieDetails = await fetchFromTMDB(`/movie/${movieId}`, langQuery);
    if (!movieDetails) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white font-sans">
                <div className="text-center">
                    <h1 className="text-3xl font-black text-red-600 mb-4">404</h1>
                    <p className="text-sm text-zinc-400">Movie details fetch failed.</p>
                </div>
            </div>
        );
    }

    // Fetch collections lists and recommendations
    let franchiseMovies = [];
    if (movieDetails.belongs_to_collection) {
        const collectionData = await fetchFromTMDB(`/collection/${movieDetails.belongs_to_collection.id}`, langQuery);
        if (collectionData && collectionData.parts) {
            franchiseMovies = collectionData.parts
                .filter(movie => movie.id !== movieId)
                .sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
        }
    }

    const [recData, simData] = await Promise.all([
        fetchFromTMDB(`/movie/${movieId}/recommendations`, langQuery),
        fetchFromTMDB(`/movie/${movieId}/similar`, langQuery)
    ]);

    const rawSuggestions = [...(recData?.results || []), ...(simData?.results || [])];
    const uniqueSuggestions = [];
    rawSuggestions.forEach(movie => {
        const isCurrentMovie = movie.id === movieId;
        const isAlreadyInFranchise = franchiseMovies.some(m => m.id === movie.id);
        const isAlreadyAdded = uniqueSuggestions.some(m => m.id === movie.id);

        if (!isCurrentMovie && !isAlreadyInFranchise && !isAlreadyAdded) {
            uniqueSuggestions.push(movie);
        }
    });

    const finalSidebarItems = [...franchiseMovies];
    const paddingNeeded = 6 - finalSidebarItems.length;
    if (paddingNeeded > 0 && uniqueSuggestions.length > 0) {
        finalSidebarItems.push(...uniqueSuggestions.slice(0, paddingNeeded));
    }

    const remainingOffset = Math.max(0, paddingNeeded);
    const finalBottomItems = uniqueSuggestions.slice(remainingOffset, remainingOffset + 32);

    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zizhub.vercel.app';
    const seoMovieSlug = createSlug(movieDetails.title, movieId, 'movie');

    // Fetch movie credits (director + main cast) — cached, runs in parallel
    const creditsData = await fetchFromTMDB(`/movie/${movieId}/credits`, `&language=${tmdbLang}`);
    const releaseDates = await fetchFromTMDB(`/movie/${movieId}/release_dates`, '');

    const director = creditsData?.crew?.find(p => p.job === 'Director');
    const topActors = (creditsData?.cast || []).slice(0, 8);

    // Get content rating (US MPAA rating)
    const usRelease = releaseDates?.results?.find(r => r.iso_3166_1 === 'US');
    const contentRating = usRelease?.release_dates?.[0]?.certification || undefined;

    // Build ISO 8601 duration from runtime (minutes)
    const runtimeMin = movieDetails.runtime;
    const isoDuration = runtimeMin
        ? `PT${Math.floor(runtimeMin / 60)}H${runtimeMin % 60}M`
        : undefined;

    // Injected JSON-LD Schema — fully enriched for Google Rich Results
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Movie',
        'name': movieDetails.title,
        'description': movieDetails.overview,
        'url': `${SITE_URL}/${locale}/movie/${seoMovieSlug}`,
        'image': movieDetails.poster_path ? `${IMAGE_BASE_URL}/w780${movieDetails.poster_path}` : undefined,
        'dateCreated': movieDetails.release_date,
        'datePublished': movieDetails.release_date,
        ...(isoDuration && { 'duration': isoDuration }),
        ...(contentRating && { 'contentRating': contentRating }),
        ...(movieDetails.genres?.length > 0 && {
            'genre': movieDetails.genres.map(g => g.name)
        }),
        ...(director && {
            'director': {
                '@type': 'Person',
                'name': director.name,
                'url': `https://www.themoviedb.org/person/${director.id}`
            }
        }),
        ...(topActors.length > 0 && {
            'actor': topActors.map(a => ({
                '@type': 'Person',
                'name': a.name,
                'url': `https://www.themoviedb.org/person/${a.id}`
            }))
        }),
        ...(movieDetails.production_companies?.length > 0 && {
            'productionCompany': movieDetails.production_companies.slice(0, 3).map(c => ({
                '@type': 'Organization',
                'name': c.name
            }))
        }),
        'aggregateRating': movieDetails.vote_average && movieDetails.vote_count > 10 ? {
            '@type': 'AggregateRating',
            'ratingValue': movieDetails.vote_average.toFixed(1),
            'bestRating': '10',
            'worstRating': '1',
            'ratingCount': movieDetails.vote_count,
        } : undefined
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
                'name': locale === 'ar' ? 'الأفلام' : locale === 'fr' ? 'Films' : 'Movies',
                'item': `${SITE_URL}/${locale}?type=movie`
            },
            {
                '@type': 'ListItem',
                'position': 3,
                'name': movieDetails.title,
                'item': `${SITE_URL}/${locale}/movie/${seoMovieSlug}`
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <WatchMovieClient
                id={movieId}
                movieDetails={movieDetails}
                sidebarMovies={finalSidebarItems}
                bottomSimilarMovies={finalBottomItems}
                locale={locale}
            />
        </>
    );
}

// Enable dynamic paths statically built on demand
export async function generateStaticParams() {
    return [];
}
