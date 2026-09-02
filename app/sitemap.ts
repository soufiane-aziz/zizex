import type { MetadataRoute } from 'next';
import { createSlug } from '../lib/slug';

export const revalidate = 604800; // 7 days CDN cache for sitemap generation

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY || 'f82feeca535cc0132d1ab38948a70405';
const BASE_URL = "https://api.themoviedb.org/3";
const LOCALES = ['en', 'fr', 'ar'];
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zizhub.vercel.app';

async function fetchPopularFromTMDB(type: string, pages = 20) {
    if (!API_KEY) {
        console.warn(`Sitemap TMDB fetch skipped: TMDB_API_KEY is not defined.`);
        return [];
    }
    const pageNumbers = Array.from({ length: pages }, (_, i) => i + 1);
    try {
        const responses = await Promise.all(
            pageNumbers.map(page =>
                fetch(`${BASE_URL}/${type}/popular?api_key=${API_KEY}&page=${page}`, { next: { revalidate: 604800 } })
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

async function fetchTrendingFromTMDB(type: string, pages = 10) {
    if (!API_KEY) return [];
    const pageNumbers = Array.from({ length: pages }, (_, i) => i + 1);
    try {
        const responses = await Promise.all(
            pageNumbers.map(page =>
                fetch(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}&page=${page}`, { next: { revalidate: 604800 } })
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
    } catch {
        return [];
    }
}

async function fetchTopRatedFromTMDB(type: string, pages = 10) {
    if (!API_KEY) return [];
    const pageNumbers = Array.from({ length: pages }, (_, i) => i + 1);
    try {
        const responses = await Promise.all(
            pageNumbers.map(page =>
                fetch(`${BASE_URL}/${type}/top_rated?api_key=${API_KEY}&page=${page}`, { next: { revalidate: 604800 } })
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
    } catch {
        return [];
    }
}

function safeUrl(url: string): string {
    try {
        return encodeURI(url);
    } catch {
        return url;
    }
}

function safeDate(dateStr?: string | null): Date {
    const now = new Date();
    if (!dateStr || typeof dateStr !== 'string') return now;
    const clean = dateStr.trim();
    if (!clean || clean.length < 4) return now;
    
    try {
        const d = new Date(clean);
        // Google Search Console rejects lastmod dates older than modern web standards (e.g. pre-2010) or in the future
        if (d instanceof Date && !isNaN(d.getTime()) && d.getFullYear() >= 2010 && d <= now) {
            return d;
        }
    } catch {
        // Fallback to current date on any parsing exception
    }
    return now;
}

const GENRE_SLUGS = [
    'action', 'adventure', 'animation', 'comedy', 'crime',
    'documentary', 'drama', 'family', 'fantasy', 'mystery', 'sci-fi',
    'horror', 'romance', 'thriller', 'war', 'western'
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const sitemapEntries: MetadataRoute.Sitemap = [];

    // 1. Home & Genre paths for each locale
    LOCALES.forEach(locale => {
        const corePages = [
            { path: '', priority: 1.0, freq: 'daily' },
            { path: '/movies', priority: 0.9, freq: 'daily' },
            { path: '/tv', priority: 0.9, freq: 'daily' },
            { path: '/top-rated', priority: 0.8, freq: 'weekly' }
        ];

        corePages.forEach(page => {
            sitemapEntries.push({
                url: safeUrl(`${SITE_URL}/${locale}${page.path}`),
                changeFrequency: page.freq as any,
                priority: page.priority,
                lastModified: new Date(),
                alternates: {
                    languages: {
                        'en': safeUrl(`${SITE_URL}/en${page.path}`),
                        'fr': safeUrl(`${SITE_URL}/fr${page.path}`),
                        'ar': safeUrl(`${SITE_URL}/ar${page.path}`),
                        'x-default': safeUrl(`${SITE_URL}/en${page.path}`),
                    }
                }
            });
        });

        GENRE_SLUGS.forEach(slug => {
            const genrePath = `/genre/${slug}`;
            const alternates: Record<string, string> = {};
            LOCALES.forEach(loc => {
                alternates[loc] = safeUrl(`${SITE_URL}/${loc}${genrePath}`);
            });
            alternates['x-default'] = safeUrl(`${SITE_URL}/en${genrePath}`);

            sitemapEntries.push({
                url: safeUrl(`${SITE_URL}/${locale}${genrePath}`),
                changeFrequency: 'weekly',
                priority: 0.7,
                lastModified: new Date(),
                alternates: { languages: alternates }
            });
        });
    });

    const seenIds = new Set<string>();

    // 2. Movies (Popular, Trending & Top Rated)
    const [popularMovies, trendingMovies, topRatedMovies] = await Promise.all([
        fetchPopularFromTMDB('movie', 20),
        fetchTrendingFromTMDB('movie', 10),
        fetchTopRatedFromTMDB('movie', 10)
    ]);
    const allMovies = [...popularMovies, ...trendingMovies, ...topRatedMovies];

    allMovies.forEach(movie => {
        if (!movie || !movie.id || !movie.title) return;
        const key = `movie-${movie.id}`;
        if (seenIds.has(key)) return;
        seenIds.add(key);

        const movieSlug = createSlug(movie.title, movie.id, 'movie');
        const releaseDate = safeDate(movie.release_date);

        LOCALES.forEach(locale => {
            const path = `/movie/${movieSlug}`;
            const alternates: Record<string, string> = {};
            LOCALES.forEach(loc => {
                alternates[loc] = safeUrl(`${SITE_URL}/${loc}${path}`);
            });
            alternates['x-default'] = safeUrl(`${SITE_URL}/en${path}`);

            sitemapEntries.push({
                url: safeUrl(`${SITE_URL}/${locale}${path}`),
                changeFrequency: 'weekly',
                priority: 0.8,
                lastModified: releaseDate,
                alternates: { languages: alternates },
            });
        });
    });

    // 3. TV Series (Popular, Trending & Top Rated)
    const [popularTv, trendingTv, topRatedTv] = await Promise.all([
        fetchPopularFromTMDB('tv', 20),
        fetchTrendingFromTMDB('tv', 10),
        fetchTopRatedFromTMDB('tv', 10)
    ]);
    const allTv = [...popularTv, ...trendingTv, ...topRatedTv];

    allTv.forEach(show => {
        if (!show || !show.id || !show.name) return;
        const key = `tv-${show.id}`;
        if (seenIds.has(key)) return;
        seenIds.add(key);

        const tvSlug = createSlug(show.name, show.id, 'tv');
        const airDate = safeDate(show.first_air_date);

        LOCALES.forEach(locale => {
            const path = `/tv/${tvSlug}/season-1/episode-1`;
            const alternates: Record<string, string> = {};
            LOCALES.forEach(loc => {
                alternates[loc] = safeUrl(`${SITE_URL}/${loc}${path}`);
            });
            alternates['x-default'] = safeUrl(`${SITE_URL}/en${path}`);

            sitemapEntries.push({
                url: safeUrl(`${SITE_URL}/${locale}${path}`),
                changeFrequency: 'weekly',
                priority: 0.8,
                lastModified: airDate,
                alternates: { languages: alternates },
            });
        });
    });

    return sitemapEntries;
}


