import type { MetadataRoute } from 'next';
import { createSlug } from '../lib/slug';

export const revalidate = 86400; // 24 hours CDN cache for sitemap generation

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

async function fetchTrendingFromTMDB(type: string, pages = 10) {
    if (!API_KEY) return [];
    const pageNumbers = Array.from({ length: pages }, (_, i) => i + 1);
    try {
        const responses = await Promise.all(
            pageNumbers.map(page =>
                fetch(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}&page=${page}`, { next: { revalidate: 86400 } })
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

function safeDateString(dateStr?: string | null): string {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    if (!dateStr || typeof dateStr !== 'string') return todayStr;
    const clean = dateStr.trim();
    if (!clean || clean.length < 4) return todayStr;
    
    try {
        const d = new Date(clean);
        if (d instanceof Date && !isNaN(d.getTime()) && d.getFullYear() >= 1900) {
            // Google Search Console rejects lastmod dates that are in the future
            if (d > now) {
                return todayStr;
            }
            return d.toISOString().split('T')[0];
        }
    } catch {
        // Fallback to today's date on any parsing exception
    }
    return todayStr;
}

const GENRE_SLUGS = [
    'action', 'adventure', 'animation', 'comedy', 'crime',
    'documentary', 'drama', 'family', 'fantasy', 'mystery', 'sci-fi'
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const sitemapEntries: MetadataRoute.Sitemap = [];
    const todayDate = new Date().toISOString().split('T')[0];

    // 1. Home & Genre paths for each locale
    LOCALES.forEach(locale => {
        sitemapEntries.push({
            url: `${SITE_URL}/${locale}`,
            lastModified: todayDate,
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
                lastModified: todayDate,
                changeFrequency: 'weekly',
                priority: 0.7,
                alternates: { languages: alternates }
            });
        });
    });

    const seenIds = new Set<string>();

    // 2. Movies (Popular & Trending)
    const [popularMovies, trendingMovies] = await Promise.all([
        fetchPopularFromTMDB('movie', 25),
        fetchTrendingFromTMDB('movie', 10)
    ]);
    const allMovies = [...popularMovies, ...trendingMovies];

    allMovies.forEach(movie => {
        if (!movie || !movie.id || !movie.title) return;
        const key = `movie-${movie.id}`;
        if (seenIds.has(key)) return;
        seenIds.add(key);

        const movieSlug = createSlug(movie.title, movie.id, 'movie');
        LOCALES.forEach(locale => {
            const path = `/movie/${movieSlug}`;
            const alternates: Record<string, string> = {};
            LOCALES.forEach(loc => {
                alternates[loc] = `${SITE_URL}/${loc}${path}`;
            });
            alternates['x-default'] = `${SITE_URL}/en${path}`;

            sitemapEntries.push({
                url: `${SITE_URL}/${locale}${path}`,
                lastModified: safeDateString(movie.release_date),
                changeFrequency: 'weekly',
                priority: 0.8,
                alternates: { languages: alternates },
            });
        });
    });

    // 3. TV Series (Popular & Trending)
    const [popularTv, trendingTv] = await Promise.all([
        fetchPopularFromTMDB('tv', 25),
        fetchTrendingFromTMDB('tv', 10)
    ]);
    const allTv = [...popularTv, ...trendingTv];

    allTv.forEach(show => {
        if (!show || !show.id || !show.name) return;
        const key = `tv-${show.id}`;
        if (seenIds.has(key)) return;
        seenIds.add(key);

        const tvSlug = createSlug(show.name, show.id, 'tv');
        LOCALES.forEach(locale => {
            const path = `/tv/${tvSlug}/season-1/episode-1`;
            const alternates: Record<string, string> = {};
            LOCALES.forEach(loc => {
                alternates[loc] = `${SITE_URL}/${loc}${path}`;
            });
            alternates['x-default'] = `${SITE_URL}/en${path}`;

            sitemapEntries.push({
                url: `${SITE_URL}/${locale}${path}`,
                lastModified: safeDateString(show.first_air_date),
                changeFrequency: 'weekly',
                priority: 0.8,
                alternates: { languages: alternates },
            });
        });
    });

    return sitemapEntries;
}


