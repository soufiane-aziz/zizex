import type { MetadataRoute } from 'next';
import { createSlug } from '../lib/slug';

export const revalidate = 86400; // 24 hours CDN cache for sitemap generation

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY;
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

function safeDate(dateStr?: string): Date {
    if (!dateStr) return new Date();
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
}

const GENRE_SLUGS = [
    'action', 'adventure', 'animation', 'comedy', 'crime',
    'documentary', 'drama', 'family', 'fantasy', 'mystery', 'sci-fi'
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const sitemapEntries: MetadataRoute.Sitemap = [];

    // 1. Home & Genre paths for each locale
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

    // 2. Movies
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

            sitemapEntries.push({
                url: `${SITE_URL}/${locale}${path}`,
                lastModified: safeDate(movie.release_date),
                changeFrequency: 'weekly',
                priority: 0.8,
                alternates: { languages: alternates },
            });
        });
    });

    // 3. TV Series
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

            sitemapEntries.push({
                url: `${SITE_URL}/${locale}${path}`,
                lastModified: safeDate(show.first_air_date),
                changeFrequency: 'weekly',
                priority: 0.8,
                alternates: { languages: alternates },
            });
        });
    });

    return sitemapEntries;
}


