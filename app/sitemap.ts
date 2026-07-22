const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const LOCALES = ['en', 'fr', 'ar'];
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zshow.vercel.app';

async function fetchPopularFromTMDB(type: string, pages = 3) {
    let allResults: any[] = [];
    for (let page = 1; page <= pages; page++) {
        const url = `${BASE_URL}/${type}/popular?api_key=${API_KEY}&page=${page}`;
        try {
            const res = await fetch(url, { next: { revalidate: 86400 } });
            if (res.ok) {
                const data = await res.json();
                if (data.results) allResults = allResults.concat(data.results);
            }
        } catch (err) {
            console.error(`Sitemap TMDB fetch error for ${type} page ${page}:`, err);
        }
    }
    return allResults;
}

export async function generateSitemaps() {
    // Returns sitemap IDs: 0 for Movies, 1 for TV Shows
    return [{ id: 0 }, { id: 1 }];
}

export default async function sitemap(props: { id: number | string }) {
    const id = Number(props?.id ?? 0);
    const sitemapEntries = [];

    // Home paths for each locale
    if (id === 0) {
        LOCALES.forEach(locale => {
            sitemapEntries.push({
                url: `${SITE_URL}/${locale}`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1.0,
                alternates: {
                    languages: {
                        'en': `${SITE_URL}/en`,
                        'fr': `${SITE_URL}/fr`,
                        'ar': `${SITE_URL}/ar`,
                        'x-default': `${SITE_URL}/en`,
                    }
                }
            });
        });
    }

    if (id === 0) {
        // Generate Movie Entries
        const popularMovies = await fetchPopularFromTMDB('movie', 3);

        popularMovies.forEach(movie => {
            LOCALES.forEach(locale => {
                const path = `/movie/${movie.id}`;
                const alternates = {};
                LOCALES.forEach(loc => {
                    alternates[loc] = `${SITE_URL}/${loc}${path}`;
                });
                alternates['x-default'] = `${SITE_URL}/en${path}`;

                const videoThumbnail = movie.backdrop_path
                    ? `${IMAGE_BASE_URL}/w780${movie.backdrop_path}`
                    : `${IMAGE_BASE_URL}/w500${movie.poster_path}`;

                sitemapEntries.push({
                    url: `${SITE_URL}/${locale}${path}`,
                    lastModified: new Date(movie.release_date || new Date()),
                    changeFrequency: 'weekly',
                    priority: 0.8,
                    alternates: { languages: alternates },
                    videos: [
                        {
                            thumbnailUrl: videoThumbnail,
                            title: movie.title || 'Movie playback',
                            description: movie.overview || 'Watch full movie online',
                            playerLoc: `https://multiembed.mov/?video_id=${movie.id}&tmdb=1`,
                        }
                    ]
                });
            });
        });
    } else if (id === 1) {
        // Generate TV Series Entries (S1E1 as details watcher)
        const popularTv = await fetchPopularFromTMDB('tv', 3);

        popularTv.forEach(show => {
            LOCALES.forEach(locale => {
                const path = `/tv/${show.id}/season-1/episode-1`;
                const alternates = {};
                LOCALES.forEach(loc => {
                    alternates[loc] = `${SITE_URL}/${loc}${path}`;
                });
                alternates['x-default'] = `${SITE_URL}/en${path}`;

                const videoThumbnail = show.backdrop_path
                    ? `${IMAGE_BASE_URL}/w780${show.backdrop_path}`
                    : `${IMAGE_BASE_URL}/w500${show.poster_path}`;

                sitemapEntries.push({
                    url: `${SITE_URL}/${locale}${path}`,
                    lastModified: new Date(show.first_air_date || new Date()),
                    changeFrequency: 'weekly',
                    priority: 0.8,
                    alternates: { languages: alternates },
                    videos: [
                        {
                            thumbnailUrl: videoThumbnail,
                            title: show.name || 'TV series stream',
                            description: show.overview || 'Watch full series online',
                            playerLoc: `https://multiembed.mov/?video_id=${show.id}&tmdb=1&s=1&e=1`,
                        }
                    ]
                });
            });
        });
    }

    return sitemapEntries;
}

