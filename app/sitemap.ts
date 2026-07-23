import { createSlug } from '../lib/slug';

export const revalidate = 86400; // 24 hours CDN cache for sitemap generation

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const LOCALES = ['en', 'fr', 'ar'];
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zshow.vercel.app';

async function fetchPopularFromTMDB(type: string, pages = 20) {
    if (!API_KEY) {
        console.warn(`Sitemap TMDB fetch skipped: TMDB_API_KEY is not defined.`);
        return [];
    }
    const pageNumbers = Array.from({ length: pages }, (_, i) => i + 1);
    try {
        const responses = await Promise.all(
            pageNumbers.map(page =>
                fetch(`${BASE_URL}/${type}/popular?api_key=${API_KEY}&page=${page}`, { next: { revalidate: 86400 } })
                    .then(res => res.ok ? res.json() : null)
                    .catch(() => null)
            )
        );
        let allResults: any[] = [];
        responses.forEach(data => {
            if (data && data.results) {
                allResults = allResults.concat(data.results);
            }
        });
        return allResults;
    } catch (err) {
        console.error(`Sitemap TMDB fetch error for ${type}:`, err);
        return [];
    }
}

function xmlEscape(str: string): string {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function safeDate(dateStr?: string): Date {
    if (!dateStr) return new Date();
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
}

export async function generateSitemaps() {
    // Returns sitemap IDs: 0 for Movies, 1 for TV Shows
    return [{ id: 0 }, { id: 1 }];
}

const GENRE_SLUGS = [
    'action', 'adventure', 'animation', 'comedy', 'crime',
    'documentary', 'drama', 'family', 'fantasy', 'mystery', 'sci-fi'
];

export default async function sitemap(props: { id: Promise<string | number> | string | number }) {
    const rawId = await props?.id;
    const id = Number(rawId ?? 0);
    const sitemapEntries: any[] = [];

    // Home & Genre paths for each locale
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

            GENRE_SLUGS.forEach(slug => {
                const genrePath = `/genre/${slug}`;
                const alternates: Record<string, string> = {};
                LOCALES.forEach(loc => {
                    alternates[loc] = `${SITE_URL}/${loc}${genrePath}`;
                });
                alternates['x-default'] = `${SITE_URL}/en${genrePath}`;

                sitemapEntries.push({
                    url: `${SITE_URL}/${locale}${genrePath}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly',
                    priority: 0.7,
                    alternates: { languages: alternates }
                });
            });
        });
    }

    if (id === 0) {
        // Generate Movie Entries (20 pages = ~400 movies)
        const popularMovies = await fetchPopularFromTMDB('movie', 20);

        popularMovies.forEach(movie => {
            if (!movie || !movie.id || !movie.title) return;
            const movieSlug = createSlug(movie.title, movie.id, 'movie');
            LOCALES.forEach(locale => {
                const path = `/movie/${movieSlug}`;
                const alternates: Record<string, string> = {};
                LOCALES.forEach(loc => {
                    alternates[loc] = `${SITE_URL}/${loc}${path}`;
                });
                alternates['x-default'] = `${SITE_URL}/en${path}`;

                const videoThumbnail = movie.backdrop_path
                    ? `${IMAGE_BASE_URL}/w780${movie.backdrop_path}`
                    : `${IMAGE_BASE_URL}/w500${movie.poster_path}`;

                sitemapEntries.push({
                    url: `${SITE_URL}/${locale}${path}`,
                    lastModified: safeDate(movie.release_date),
                    changeFrequency: 'weekly',
                    priority: 0.8,
                    alternates: { languages: alternates },
                    videos: [
                        {
                            thumbnail_loc: xmlEscape(videoThumbnail),
                            title: xmlEscape(movie.title || 'Movie playback'),
                            description: xmlEscape(movie.overview || 'Watch full movie online'),
                            player_loc: xmlEscape(`https://multiembed.mov/?video_id=${movie.id}&tmdb=1`),
                        }
                    ]
                });
            });
        });
    } else if (id === 1) {
        // Generate TV Series Entries (20 pages = ~400 TV series)
        const popularTv = await fetchPopularFromTMDB('tv', 20);

        popularTv.forEach(show => {
            if (!show || !show.id || !show.name) return;
            const tvSlug = createSlug(show.name, show.id, 'tv');
            LOCALES.forEach(locale => {
                const path = `/tv/${tvSlug}/season-1/episode-1`;
                const alternates: Record<string, string> = {};
                LOCALES.forEach(loc => {
                    alternates[loc] = `${SITE_URL}/${loc}${path}`;
                });
                alternates['x-default'] = `${SITE_URL}/en${path}`;

                const videoThumbnail = show.backdrop_path
                    ? `${IMAGE_BASE_URL}/w780${show.backdrop_path}`
                    : `${IMAGE_BASE_URL}/w500${show.poster_path}`;

                sitemapEntries.push({
                    url: `${SITE_URL}/${locale}${path}`,
                    lastModified: safeDate(show.first_air_date),
                    changeFrequency: 'weekly',
                    priority: 0.8,
                    alternates: { languages: alternates },
                    videos: [
                        {
                            thumbnail_loc: xmlEscape(videoThumbnail),
                            title: xmlEscape(show.name || 'TV series stream'),
                            description: xmlEscape(show.overview || 'Watch full series online'),
                            player_loc: xmlEscape(`https://multiembed.mov/?video_id=${show.id}&tmdb=1&s=1&e=1`),
                        }
                    ]
                });
            });
        });
    }

    return sitemapEntries;
}

