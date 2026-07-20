import React from 'react';
import WatchTVClient from '../../../../../../components/WatchTVClient';

export const dynamic = 'force-dynamic'; // Force dynamic rendering to bypass caching during debugging

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

async function fetchFromTMDB(path, queryParams = '') {
    const url = `${BASE_URL}${path}?api_key=${API_KEY}${queryParams}`;
    try {
        const res = await fetch(url, { next: { revalidate: 86400 } });
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        console.error(`TMDB fetch error for ${path}:`, err);
        return null;
    }
}

// Helper to resolve TV Show ID from slug
async function resolveTVShowId(slug) {
    if (/^\d+$/.test(slug)) {
        return parseInt(slug);
    }
    // Try search by query
    const cleanQuery = slug.replace(/-/g, ' ');
    const data = await fetchFromTMDB('/search/tv', `&query=${encodeURIComponent(cleanQuery)}`);
    if (data && data.results && data.results.length > 0) {
        return data.results[0].id;
    }
    return null;
}

// Extract number from parameters (e.g. season-1 -> 1)
function parseParamNumber(paramStr) {
    if (typeof paramStr === 'number') return paramStr;
    if (!paramStr) return 1;
    const match = String(paramStr).match(/\d+/);
    return match ? parseInt(match[0]) : 1;
}

const extractParamValue = (params, prefixes) => {
    for (const key of Object.keys(params)) {
        for (const prefix of prefixes) {
            if (key.toLowerCase().includes(prefix)) {
                return params[key];
            }
        }
    }
    return 1;
};

// Generate dynamic metadata for French, Arabic and English
export async function generateMetadata(props) {
    const params = await props.params;
    const { locale, slug } = params;
    const seasonIdParam = extractParamValue(params, ['seasonid', 'season-id', 'season']);
    const episodeIdParam = extractParamValue(params, ['episodeid', 'episode-id', 'episode']);

    const showId = await resolveTVShowId(slug);
    const seasonNum = parseParamNumber(seasonIdParam);
    const episodeNum = parseParamNumber(episodeIdParam);

    if (!showId) {
        return {
            title: 'zShow - Search and Watch TV Series',
            description: 'Stream series metadata seamlessly.'
        };
    }

    const tmdbLang = locale === 'ar' ? 'ar-AE' : locale === 'fr' ? 'fr-FR' : 'en-US';
    const showDetails = await fetchFromTMDB(`/tv/${showId}`, `&language=${tmdbLang}`);

    if (!showDetails) {
        return { title: 'zShow - Streaming Platform' };
    }

    const showName = showDetails.name;
    const isAr = locale === 'ar';
    const isFr = locale === 'fr';

    // Fetch episode specific title if possible
    let episodeTitle = `Episode ${episodeNum}`;
    const epData = await fetchFromTMDB(`/tv/${showId}/season/${seasonNum}/episode/${episodeNum}`, `&language=${tmdbLang}`);
    if (epData && epData.name) {
        episodeTitle = epData.name;
    }

    const docTitle = isAr
        ? `شاهد مسلسل ${showName} الموسم ${seasonNum} الحلقة ${episodeNum} أونلاين | zShow`
        : isFr
            ? `Regarder ${showName} Saison ${seasonNum} Épisode ${episodeNum} en Streaming | zShow`
            : `Watch ${showName} Season ${seasonNum} Episode ${episodeNum} Online | zShow`;

    const docDesc = epData && epData.overview
        ? epData.overview.substring(0, 160)
        : `Stream ${showName} Season ${seasonNum} Episode ${episodeNum} ("${episodeTitle}") on zShow.`;

    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zshow.vercel.app';
    const ogImage = epData && epData.still_path
        ? `${IMAGE_BASE_URL}/w780${epData.still_path}`
        : showDetails.backdrop_path
            ? `${IMAGE_BASE_URL}/w780${showDetails.backdrop_path}`
            : `${SITE_URL}/window.svg`;

    const path = `/tv/${slug}/season-${seasonNum}/episode-${episodeNum}`;
    const alternates = {
        canonical: `${SITE_URL}/${locale}${path}`,
        languages: {
            'en': `${SITE_URL}/en${path}`,
            'fr': `${SITE_URL}/fr${path}`,
            'ar': `${SITE_URL}/ar${path}`,
            'x-default': `${SITE_URL}/en${path}`,
        }
    };

    return {
        title: docTitle,
        description: docDesc,
        alternates,
        openGraph: {
            title: docTitle,
            description: docDesc,
            url: `https://zshow.me/${locale}${path}`,
            images: [
                {
                    url: ogImage,
                    width: 800,
                    height: 600,
                    alt: `${showName} S${seasonNum}E${episodeNum}`,
                }
            ],
            type: 'video.episode',
        },
        twitter: {
            card: 'summary_large_image',
            title: docTitle,
            description: docDesc,
            images: [ogImage],
        }
    };
}

export default async function LocalizedEpisodePage(props) {
    const params = await props.params;
    try {
        const fs = require('fs');
        fs.writeFileSync('params_debug.txt', JSON.stringify({ params, timestamp: new Date().toISOString() }) + '\n', { flag: 'a' });
    } catch (e) { }
    const { locale, slug } = params;
    const seasonIdParam = extractParamValue(params, ['seasonid', 'season-id', 'season']);
    const episodeIdParam = extractParamValue(params, ['episodeid', 'episode-id', 'episode']);

    const showId = await resolveTVShowId(slug);
    const seasonNum = parseParamNumber(seasonIdParam);
    const episodeNum = parseParamNumber(episodeIdParam);

    if (!showId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white font-sans">
                <div className="text-center">
                    <h1 className="text-3xl font-black text-red-600 mb-4">404</h1>
                    <p className="text-sm text-zinc-400">TV show records could not be resolved inside our system databanks.</p>
                </div>
            </div>
        );
    }

    const tmdbLang = locale === 'ar' ? 'ar-AE' : locale === 'fr' ? 'fr-FR' : 'en-US';
    const langQuery = `&language=${tmdbLang}`;

    // Fetch show details
    const showDetails = await fetchFromTMDB(`/tv/${showId}`, langQuery);
    if (!showDetails) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white font-sans">
                <div className="text-center">
                    <h1 className="text-3xl font-black text-red-600 mb-4">404</h1>
                    <p className="text-sm text-zinc-400">Show details fetch failed.</p>
                </div>
            </div>
        );
    }

    const validSeasons = (showDetails.seasons || []).filter(s => s.season_number > 0);

    // Fetch episodes list for current season
    const seasonData = await fetchFromTMDB(`/tv/${showId}/season/${seasonNum}`, langQuery);
    const episodes = seasonData?.episodes || [];

    // Fetch similar show recommendations
    const [recs1, recs2] = await Promise.all([
        fetchFromTMDB(`/tv/${showId}/recommendations`, `&page=1${langQuery}`),
        fetchFromTMDB(`/tv/${showId}/recommendations`, `&page=2${langQuery}`)
    ]);

    let combinedRecommendations = [...(recs1?.results || []), ...(recs2?.results || [])];

    if (showDetails.genres && showDetails.genres.length > 0) {
        const primaryGenreId = showDetails.genres[0].id;
        const [dg1, dg2] = await Promise.all([
            fetchFromTMDB(`/discover/tv`, `&with_genres=${primaryGenreId}&sort_by=popularity.desc&page=1${langQuery}`),
            fetchFromTMDB(`/discover/tv`, `&with_genres=${primaryGenreId}&sort_by=popularity.desc&page=2${langQuery}`)
        ]);
        const genreMatches = [...(dg1?.results || []), ...(dg2?.results || [])]
            .filter(show => show.id !== showId);

        combinedRecommendations = [...combinedRecommendations, ...genreMatches];
    }

    // Deduplicate recommendations list
    const uniqueShows = combinedRecommendations.filter((show, index, self) =>
        self.findIndex(s => s.id === show.id) === index
    );

    const finalSimilarShows = uniqueShows.slice(0, 48);

    // Fetch current episode specific details for JSON-LD VideoObject and TVEpisode schemas
    const currentEpisodeDetails = episodes.find(e => e.episode_number === episodeNum) || {};

    const episodeName = currentEpisodeDetails.name || `Episode ${episodeNum}`;
    const episodeStill = currentEpisodeDetails.still_path
        ? `${IMAGE_BASE_URL}/w500${currentEpisodeDetails.still_path}`
        : showDetails.poster_path
            ? `${IMAGE_BASE_URL}/w500${showDetails.poster_path}`
            : 'https://zshow.me/window.svg';

    // Embed URL for schema
    const schemaEmbedUrl = `https://multiembed.mov/?video_id=${showId}&tmdb=1&s=${seasonNum}&e=${episodeNum}`;

    // TVEpisode schema nodes
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'TVEpisode',
        'name': episodeName,
        'episodeNumber': episodeNum,
        'seasonNumber': seasonNum,
        'partOfSeason': {
            '@type': 'TVSeason',
            'seasonNumber': seasonNum,
            'name': seasonData?.name || `Season ${seasonNum}`,
        },
        'partOfSeries': {
            '@type': 'TVSeries',
            'name': showDetails.name,
            'description': showDetails.overview,
            'image': showDetails.poster_path ? `${IMAGE_BASE_URL}/w500${showDetails.poster_path}` : undefined,
        },
        'video': {
            '@type': 'VideoObject',
            'name': `${showDetails.name} Season ${seasonNum} Episode ${episodeNum} - ${episodeName}`,
            'description': currentEpisodeDetails.overview || showDetails.overview,
            'thumbnailUrl': episodeStill,
            'uploadDate': currentEpisodeDetails.air_date || showDetails.first_air_date,
            'embedUrl': schemaEmbedUrl,
            // Target key moments / timelines mapping for organic searches if needed
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <WatchTVClient
                id={showId}
                showDetails={showDetails}
                seasons={validSeasons}
                currentSeason={seasonNum}
                episodes={episodes}
                currentEpisode={episodeNum}
                similarShows={finalSimilarShows}
                slug={slug}
                locale={locale}
            />
        </>
    );
}

// Enable dynamic paths statically built on demand
export async function generateStaticParams() {
    return [];
}
