import React, { cache } from 'react';
import WatchTVClient from '../../../../../../components/WatchTVClient';
import { createSlug, extractIdFromSlug } from '../../../../../../lib/slug';
import { fetchFromTMDB } from '../../../../../../lib/tmdb';

export const revalidate = 604800; // 7 days caching on Edge CDN
export const dynamicParams = true;

export async function generateStaticParams() {
    return [
        { locale: 'en', slug: 'watch-trending-1', seasonId: 'season-1', episodeId: 'episode-1' },
        { locale: 'fr', slug: 'watch-trending-1', seasonId: 'season-1', episodeId: 'episode-1' },
        { locale: 'ar', slug: 'watch-trending-1', seasonId: 'season-1', episodeId: 'episode-1' },
    ];
}

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// Helper to resolve TV Show ID from slug
const resolveTVShowId = cache(async (slug) => {
    const extractedId = extractIdFromSlug(slug);
    if (extractedId) return extractedId;

    // Try search by query
    const cleanQuery = slug.replace(/-/g, ' ');
    const data = await fetchFromTMDB('/search/tv', `&query=${encodeURIComponent(cleanQuery)}`);
    if (data && data.results && data.results.length > 0) {
        return data.results[0].id;
    }
    return null;
});

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
            title: 'Zizex - Search and Watch TV Series',
            description: 'Stream series metadata seamlessly.'
        };
    }

    const tmdbLang = locale === 'ar' ? 'ar-AE' : locale === 'fr' ? 'fr-FR' : 'en-US';
    const showDetails = await fetchFromTMDB(`/tv/${showId}`, `&language=${tmdbLang}`);

    if (!showDetails) {
        return { title: 'Zizex - Streaming Platform' };
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
        ? `Zizex | شاهد مسلسل ${showName} الموسم ${seasonNum} الحلقة ${episodeNum} أونلاين`
        : isFr
            ? `Zizex | Regarder ${showName} Saison ${seasonNum} Épisode ${episodeNum} en Streaming`
            : `Zizex | Watch ${showName} Season ${seasonNum} Episode ${episodeNum} Online`;

    const docDesc = epData && epData.overview
        ? epData.overview.substring(0, 160)
        : `Stream ${showName} Season ${seasonNum} Episode ${episodeNum} ("${episodeTitle}") on Zizex.`;

    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zizex.vercel.app';
    const seoTvSlug = createSlug(showDetails.name, showId, 'tv');
    const ogImage = epData && epData.still_path
        ? `${IMAGE_BASE_URL}/w780${epData.still_path}`
        : showDetails.backdrop_path
            ? `${IMAGE_BASE_URL}/w780${showDetails.backdrop_path}`
            : `${SITE_URL}/logo.png`;

    const path = `/tv/${seoTvSlug}/season-${seasonNum}/episode-${episodeNum}`;
    const alternates = {
        canonical: `${SITE_URL}/${locale}${path}`,
        languages: {
            'en': `${SITE_URL}/en${path}`,
            'fr': `${SITE_URL}/fr${path}`,
            'ar': `${SITE_URL}/ar${path}`,
            'x-default': `${SITE_URL}/en${path}`,
        }
    };

    const keywords = isAr
        ? [`مسلسل ${showName}`, `شاهد ${showName} الموسم ${seasonNum} الحلقة ${episodeNum}`, `${showName} حلقة ${episodeNum} مترجم`, `تحميل ${showName}`]
        : isFr
            ? [`regarder ${showName}`, `${showName} saison ${seasonNum} episode ${episodeNum}`, `${showName} streaming vf`, `serie ${showName} streaming`]
            : [`watch ${showName} online`, `${showName} season ${seasonNum} episode ${episodeNum}`, `stream ${showName} free`, `${showName} S${seasonNum}E${episodeNum} HD`];

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
    const primaryGenreId = showDetails.genres?.[0]?.id;

    // Fetch all secondary data in parallel — single round-trip instead of 6 sequential ones
    const [seasonData, recsData, tvCredits, genreData] = await Promise.all([
        fetchFromTMDB(`/tv/${showId}/season/${seasonNum}`, langQuery),
        fetchFromTMDB(`/tv/${showId}/recommendations`, `&page=1${langQuery}`),
        fetchFromTMDB(`/tv/${showId}/credits`, `&language=${tmdbLang}`),
        primaryGenreId
            ? fetchFromTMDB(`/discover/tv`, `&with_genres=${primaryGenreId}&sort_by=popularity.desc&page=1${langQuery}`)
            : Promise.resolve(null),
    ]);

    const episodes = seasonData?.episodes || [];

    const seenShowIds = new Set([showId]);
    const uniqueShows = [];
    [...(recsData?.results || []), ...(genreData?.results || [])].forEach(show => {
        if (!seenShowIds.has(show.id)) {
            seenShowIds.add(show.id);
            uniqueShows.push(show);
        }
    });

    const finalSimilarShows = uniqueShows.slice(0, 24);

    // Fetch current episode specific details for JSON-LD VideoObject and TVEpisode schemas
    const currentEpisodeDetails = episodes.find(e => e.episode_number === episodeNum) || {};

    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zizex.vercel.app';
    const episodeName = currentEpisodeDetails.name || `Episode ${episodeNum}`;
    const episodeStill = currentEpisodeDetails.still_path
        ? `${IMAGE_BASE_URL}/w500${currentEpisodeDetails.still_path}`
        : showDetails.poster_path
            ? `${IMAGE_BASE_URL}/w500${showDetails.poster_path}`
            : `${SITE_URL}/logo.png`;

    // Embed URL for schema (matches Server 1 player)
    const schemaEmbedUrl = `https://vidlink.pro/tv/${showId}/${seasonNum}/${episodeNum}`;

    const tvActors = (tvCredits?.cast || []).slice(0, 8);
    const tvCreators = showDetails.created_by || [];

    const seoTvSlug = createSlug(showDetails.name, showId, 'tv');

    // TVEpisode schema nodes — fully enriched for Google Rich Results
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'TVEpisode',
        'name': episodeName,
        'url': `${SITE_URL}/${locale}/tv/${seoTvSlug}/season-${seasonNum}/episode-${episodeNum}`,
        'episodeNumber': episodeNum,
        'seasonNumber': seasonNum,
        'description': currentEpisodeDetails.overview || showDetails.overview,
        'image': episodeStill,
        'datePublished': currentEpisodeDetails.air_date || showDetails.first_air_date,
        'partOfSeason': {
            '@type': 'TVSeason',
            'seasonNumber': seasonNum,
            'name': seasonData?.name || `Season ${seasonNum}`,
        },
        'partOfSeries': {
            '@type': 'TVSeries',
            'name': showDetails.name,
            'description': showDetails.overview,
            'url': `${SITE_URL}/${locale}/tv/${seoTvSlug}/season-1/episode-1`,
            'image': showDetails.poster_path ? `${IMAGE_BASE_URL}/w780${showDetails.poster_path}` : undefined,
            'startDate': showDetails.first_air_date,
            ...(showDetails.status === 'Ended' && showDetails.last_air_date && { 'endDate': showDetails.last_air_date }),
            ...(showDetails.genres?.length > 0 && { 'genre': showDetails.genres.map(g => g.name) }),
            ...(tvCreators.length > 0 && {
                'creator': tvCreators.map(c => ({ '@type': 'Person', 'name': c.name }))
            }),
            ...(tvActors.length > 0 && {
                'actor': tvActors.map(a => ({ '@type': 'Person', 'name': a.name }))
            }),
            'aggregateRating': showDetails.vote_average && showDetails.vote_count > 10 ? {
                '@type': 'AggregateRating',
                'ratingValue': showDetails.vote_average.toFixed(1),
                'bestRating': '10',
                'worstRating': '1',
                'ratingCount': showDetails.vote_count,
            } : undefined,
            ...(showDetails.number_of_seasons && { 'numberOfSeasons': showDetails.number_of_seasons }),
            ...(showDetails.number_of_episodes && { 'numberOfEpisodes': showDetails.number_of_episodes }),
        },
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
                'name': locale === 'ar' ? 'المسلسلات' : locale === 'fr' ? 'Séries' : 'TV Shows',
                'item': `${SITE_URL}/${locale}?type=tv`
            },
            {
                '@type': 'ListItem',
                'position': 3,
                'name': showDetails.name,
                'item': `${SITE_URL}/${locale}/tv/${seoTvSlug}/season-${seasonNum}/episode-${episodeNum}`
            }
        ]
    };

    const rawTvDate = currentEpisodeDetails.air_date || showDetails.first_air_date || '2024-01-01';
    const cleanTvUploadDate = String(rawTvDate).trim().length >= 10
        ? `${String(rawTvDate).trim().substring(0, 10)}T00:00:00Z`
        : '2024-01-01T00:00:00Z';

    const tvThumbnails = [
        episodeStill,
        ...(showDetails.backdrop_path ? [`${IMAGE_BASE_URL}/w1280${showDetails.backdrop_path}`] : []),
        ...(showDetails.poster_path ? [`${IMAGE_BASE_URL}/w780${showDetails.poster_path}`] : []),
        `${SITE_URL}/logo.png`
    ];

    const standaloneVideoObjectLd = {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        'name': `${showDetails.name} Season ${seasonNum} Episode ${episodeNum} - ${episodeName}`,
        'description': currentEpisodeDetails.overview || showDetails.overview || `Watch ${showDetails.name} S${seasonNum}E${episodeNum} online on Zizex.`,
        'thumbnailUrl': tvThumbnails,
        'uploadDate': cleanTvUploadDate,
        'datePublished': cleanTvUploadDate,
        'duration': 'PT45M',
        'embedUrl': schemaEmbedUrl,
        'contentUrl': schemaEmbedUrl,
        'regionsAllowed': 'US,FR,AR,GB,CA,DE,ES,IT,BR,MX,AU,IN,MA,DZ,TN,SA,AE',
        'isPartOf': {
            '@type': 'WebSite',
            '@id': 'https://zizex.vercel.app/#website',
            'name': 'Zizex',
            'url': 'https://zizex.vercel.app/'
        },
        'provider': {
            '@type': 'Organization',
            '@id': 'https://zizex.vercel.app/#organization',
            'name': 'Zizex'
        },
        'interactionStatistic': {
            '@type': 'InteractionCounter',
            'interactionType': { '@type': 'WatchAction' },
            'userInteractionCount': showDetails.vote_count ? Math.max(showDetails.vote_count, 500) : 1000
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(standaloneVideoObjectLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <noscript>
                <iframe
                    src={schemaEmbedUrl}
                    width="100%"
                    height="450"
                    allowFullScreen
                    title={`${showDetails.name} Season ${seasonNum} Episode ${episodeNum}`}
                />
            </noscript>
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

