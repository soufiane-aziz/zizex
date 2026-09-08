import type { MetadataRoute } from 'next';
import { createSlug } from '../lib/slug';

// ─── Cache: 7-day CDN revalidation ───────────────────────────────────────────
export const revalidate = 604800;

// ─── Config ───────────────────────────────────────────────────────────────────
const API_KEY =
  process.env.NEXT_PUBLIC_TMDB_API_KEY ||
  process.env.TMDB_API_KEY ||
  'f82feeca535cc0132d1ab38948a70405';
const BASE_URL = 'https://api.themoviedb.org/3';
const LOCALES = ['en', 'fr', 'ar'];
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://filmoxa.vercel.app';

// ─── All 20 Genre Slugs ───────────────────────────────────────────────────────
const GENRE_SLUGS = [
  'action', 'adventure', 'animation', 'comedy', 'crime',
  'documentary', 'drama', 'family', 'fantasy', 'history',
  'horror', 'music', 'mystery', 'romance', 'sci-fi',
  'sport', 'thriller', 'tv-movie', 'war', 'western',
];

// ─── Static brand pages (Filmoxa keyword anchors) ────────────────────────────
const BRAND_PAGES: { path: string; priority: number; freq: string }[] = [
  { path: '',           priority: 1.0,  freq: 'daily'   },
  { path: '/movies',    priority: 0.95, freq: 'daily'   },
  { path: '/tv',        priority: 0.95, freq: 'daily'   },
  { path: '/top-rated', priority: 0.85, freq: 'weekly'  },
  { path: '/trending',  priority: 0.85, freq: 'daily'   },
  { path: '/search',    priority: 0.70, freq: 'weekly'  },
  { path: '/about',     priority: 0.60, freq: 'monthly' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function safeUrl(url: string): string {
  try { return encodeURI(url); } catch { return url; }
}

function safeDate(dateStr?: string | null): Date {
  const now = new Date();
  if (!dateStr || typeof dateStr !== 'string') return now;
  const clean = dateStr.trim();
  if (!clean || clean.length < 4) return now;
  try {
    const d = new Date(clean);
    // Google Search Console rejects dates older than 2010 or in the future
    if (d instanceof Date && !isNaN(d.getTime()) && d.getFullYear() >= 2010 && d <= now) {
      return d;
    }
  } catch {
    // Fallback to current date on any parsing exception
  }
  return now;
}

function buildAlternates(path: string): Record<string, string> {
  const alt: Record<string, string> = {};
  LOCALES.forEach(loc => { alt[loc] = safeUrl(`${SITE_URL}/${loc}${path}`); });
  alt['x-default'] = safeUrl(`${SITE_URL}/en${path}`);
  return alt;
}

// ─── TMDB Fetchers ────────────────────────────────────────────────────────────
async function fetchPages(endpoint: string, pages: number): Promise<any[]> {
  if (!API_KEY) return [];
  const nums = Array.from({ length: pages }, (_, i) => i + 1);
  try {
    const responses = await Promise.all(
      nums.map(p =>
        fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&page=${p}`, {
          next: { revalidate: 604800 },
        })
          .then(r => (r.ok ? r.json() : null))
          .catch(() => null),
      ),
    );
    return responses.flatMap(d => d?.results ?? []);
  } catch {
    return [];
  }
}

async function fetchTrendingPages(type: string, pages: number): Promise<any[]> {
  if (!API_KEY) return [];
  const nums = Array.from({ length: pages }, (_, i) => i + 1);
  try {
    const responses = await Promise.all(
      nums.map(p =>
        fetch(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}&page=${p}`, {
          next: { revalidate: 604800 },
        })
          .then(r => (r.ok ? r.json() : null))
          .catch(() => null),
      ),
    );
    return responses.flatMap(d => d?.results ?? []);
  } catch {
    return [];
  }
}

async function fetchTvSeasonCount(id: number): Promise<number> {
  if (!API_KEY) return 3;
  try {
    const res = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}`, {
      next: { revalidate: 604800 },
    });
    if (!res.ok) return 3;
    const data = await res.json();
    return Math.min(data?.number_of_seasons ?? 1, 10);
  } catch {
    return 3;
  }
}

// ─── Main Sitemap ─────────────────────────────────────────────────────────────
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const now = new Date();

  // 0. Root canonical — highest Filmoxa brand signal
  entries.push({
    url: safeUrl(SITE_URL),
    changeFrequency: 'daily',
    priority: 1.0,
    lastModified: now,
    alternates: {
      languages: {
        en: safeUrl(`${SITE_URL}/en`),
        fr: safeUrl(`${SITE_URL}/fr`),
        ar: safeUrl(`${SITE_URL}/ar`),
        'x-default': safeUrl(`${SITE_URL}/en`),
      },
    },
  });

  // 1. Brand static pages per locale (7 pages × 3 locales = 21 entries)
  LOCALES.forEach(locale => {
    BRAND_PAGES.forEach(page => {
      entries.push({
        url: safeUrl(`${SITE_URL}/${locale}${page.path}`),
        changeFrequency: page.freq as MetadataRoute.Sitemap[number]['changeFrequency'],
        priority: page.priority,
        lastModified: now,
        alternates: { languages: buildAlternates(page.path) },
      });
    });
  });

  // 2. Genre pages per locale (20 genres × 3 locales = 60 entries)
  LOCALES.forEach(locale => {
    GENRE_SLUGS.forEach(slug => {
      const path = `/genre/${slug}`;
      entries.push({
        url: safeUrl(`${SITE_URL}/${locale}${path}`),
        changeFrequency: 'weekly',
        priority: 0.70,
        lastModified: now,
        alternates: { languages: buildAlternates(path) },
      });
    });
  });

  // 3. Fetch all TMDB content in parallel
  //    Movies:  popular×20 + trending×10 + top-rated×10  → ~8 000 unique movies
  //    TV:      popular×20 + trending×10 + top-rated×10  → ~8 000 unique shows
  const [
    popularMovies, trendingMovies, topRatedMovies,
    popularTv, trendingTv, topRatedTv,
  ] = await Promise.all([
    fetchPages('/movie/popular',   20),
    fetchTrendingPages('movie',    10),
    fetchPages('/movie/top_rated', 10),
    fetchPages('/tv/popular',      20),
    fetchTrendingPages('tv',       10),
    fetchPages('/tv/top_rated',    10),
  ]);

  // 4. Movies — de-duplicate + emit per-locale entries
  const seenMovies = new Set<string>();
  const allMovies = [...popularMovies, ...trendingMovies, ...topRatedMovies];

  allMovies.forEach(movie => {
    if (!movie?.id || !movie?.title) return;
    const key = `movie-${movie.id}`;
    if (seenMovies.has(key)) return;
    seenMovies.add(key);

    const slug    = createSlug(movie.title, movie.id, 'movie');
    const path    = `/movie/${slug}`;
    const lastMod = safeDate(movie.release_date);

    LOCALES.forEach(locale => {
      entries.push({
        url: safeUrl(`${SITE_URL}/${locale}${path}`),
        changeFrequency: 'weekly',
        priority: 0.85,
        lastModified: lastMod,
        alternates: { languages: buildAlternates(path) },
      });
    });
  });

  // 5. TV shows — de-duplicate, fetch real season counts, emit entries
  const seenTv = new Set<string>();
  const allTv  = [...popularTv, ...trendingTv, ...topRatedTv];
  const uniqueTv = allTv.filter(s => {
    if (!s?.id || !s?.name) return false;
    const key = `tv-${s.id}`;
    if (seenTv.has(key)) return false;
    seenTv.add(key);
    return true;
  });

  // Batch-fetch real season counts for top 200 shows (avoids TMDB rate limits)
  const top200       = uniqueTv.slice(0, 200);
  const seasonCounts = await Promise.all(top200.map(s => fetchTvSeasonCount(s.id)));
  const tvSeasonMap  = new Map<number, number>();
  top200.forEach((s, i) => tvSeasonMap.set(s.id, seasonCounts[i]));

  uniqueTv.forEach(show => {
    const slug       = createSlug(show.name, show.id, 'tv');
    const airDate    = safeDate(show.first_air_date);
    const numSeasons = tvSeasonMap.get(show.id) ?? 3;

    // Season 1 / Episode 1 — primary canonical per locale (priority 0.85)
    LOCALES.forEach(locale => {
      const path = `/tv/${slug}/season-1/episode-1`;
      entries.push({
        url: safeUrl(`${SITE_URL}/${locale}${path}`),
        changeFrequency: 'weekly',
        priority: 0.85,
        lastModified: airDate,
        alternates: { languages: buildAlternates(path) },
      });
    });

    // Seasons 2 → N — drives Googlebot crawl depth (priority 0.65)
    for (let s = 2; s <= numSeasons; s++) {
      LOCALES.forEach(locale => {
        const path = `/tv/${slug}/season-${s}/episode-1`;
        entries.push({
          url: safeUrl(`${SITE_URL}/${locale}${path}`),
          changeFrequency: 'monthly',
          priority: 0.65,
          lastModified: airDate,
          alternates: { languages: buildAlternates(path) },
        });
      });
    }
  });

  return entries;
}
