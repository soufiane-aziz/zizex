import type { MetadataRoute } from 'next';

function createSlug(title: string, id: number | string): string {
  if (!id) return '';
  if (!title) return String(id);
  const clean = String(title)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return clean ? `watch-${clean}-${id}` : `watch-${id}`;
}

// ─── Cache: 7-day CDN revalidation ───────────────────────────────────────────
export const revalidate = 604800;

const API_KEY =
  process.env.NEXT_PUBLIC_TMDB_API_KEY ||
  process.env.TMDB_API_KEY ||
  'f82feeca535cc0132d1ab38948a70405';
const BASE_URL = 'https://api.themoviedb.org/3';
const LOCALES = ['en', 'fr', 'ar'];
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://zizex.vercel.app';

// ─── Fetchers ─────────────────────────────────────────────────────────────────
async function fetchPageRange(endpoint: string, startPage: number, endPage: number): Promise<any[]> {
  if (!API_KEY) return [];
  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  try {
    const responses = await Promise.all(
      pages.map(p => {
        const sep = endpoint.includes('?') ? '&' : '?';
        return fetch(`${BASE_URL}${endpoint}${sep}api_key=${API_KEY}&page=${p}`, {
          cache: 'no-store',
        })
          .then(r => (r.ok ? r.json() : null))
          .catch(() => null);
      }),
    );
    return responses.flatMap(d => d?.results ?? []);
  } catch {
    return [];
  }
}

async function fetchTrendingRange(type: string, startPage: number, endPage: number): Promise<any[]> {
  if (!API_KEY) return [];
  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  try {
    const responses = await Promise.all(
      pages.map(p =>
        fetch(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}&page=${p}`, {
          cache: 'no-store',
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
    if (d instanceof Date && !isNaN(d.getTime()) && d.getFullYear() >= 2000 && d <= now) {
      return d;
    }
  } catch {
    // Fallback
  }
  return now;
}

function buildAlternates(path: string): Record<string, string> {
  const alt: Record<string, string> = {};
  LOCALES.forEach(loc => { alt[loc] = safeUrl(`${SITE_URL}/${loc}${path}`); });
  alt['x-default'] = safeUrl(`${SITE_URL}/en${path}`);
  return alt;
}

// ─── generateSitemaps ─────────────────────────────────────────────────────────
// Generates 12 sub-sitemaps (0 to 11) for ~1,200 movies × 3 locales = ~3,600 URLs
export async function generateSitemaps() {
  return Array.from({ length: 12 }, (_, i) => ({ id: String(i) }));
}

// ─── Sitemap: Movies ─────────────────────────────────────────────────────────
// Served at: /movies/sitemap/0.xml ... /movies/sitemap/11.xml
export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const id = await props.id;
  const sId = parseInt(id, 10) || 0;

  let movies: any[] = [];
  if (sId >= 0 && sId <= 4) {
    // Popular movies (pages 1..25 split into 5 batches)
    const start = sId * 5 + 1;
    movies = await fetchPageRange('/movie/popular', start, start + 4);
  } else if (sId >= 5 && sId <= 7) {
    // Top-rated movies (pages 1..15 split into 3 batches)
    const start = (sId - 5) * 5 + 1;
    movies = await fetchPageRange('/movie/top_rated', start, start + 4);
  } else if (sId >= 8 && sId <= 9) {
    // Trending movies (pages 1..10 split into 2 batches)
    const start = (sId - 8) * 5 + 1;
    movies = await fetchTrendingRange('movie', start, start + 4);
  } else if (sId === 10) {
    // Action & Adventure movies
    movies = await fetchPageRange('/discover/movie?with_genres=28,12&sort_by=popularity.desc', 1, 5);
  } else if (sId === 11) {
    // Sci-Fi, Animation & Thriller movies
    movies = await fetchPageRange('/discover/movie?with_genres=878,16,53&sort_by=popularity.desc', 1, 5);
  }

  const seen = new Set<string>();
  const entries: MetadataRoute.Sitemap = [];

  movies.forEach(movie => {
    if (!movie?.id || !movie?.title) return;
    const key = `${movie.id}`;
    if (seen.has(key)) return;
    seen.add(key);

    const slug    = createSlug(movie.title, movie.id);
    const path    = `/movie/${slug}`;
    const lastMod = safeDate(movie.release_date);

    LOCALES.forEach(locale => {
      entries.push({
        url: safeUrl(`${SITE_URL}/${locale}${path}`),
        changeFrequency: 'weekly',
        priority: 0.40,
        lastModified: lastMod,
        alternates: { languages: buildAlternates(path) },
      });
    });
  });

  return entries;
}
