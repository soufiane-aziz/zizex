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
  process.env.NEXT_PUBLIC_SITE_URL || 'https://filmoxa.vercel.app';

// ─── Fetchers ─────────────────────────────────────────────────────────────────
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

// ─── generateSitemaps ─────────────────────────────────────────────────────────
// id 0 = popular movies   (pages 1-20)
// id 1 = trending movies  (pages 1-10)
// id 2 = top-rated movies (pages 1-10)
// Each batch can have up to ~400 unique movies × 3 locales = ~1200 URLs, well under 50k
export async function generateSitemaps() {
  return [{ id: '0' }, { id: '1' }, { id: '2' }];
}

// ─── Sitemap: Movies ─────────────────────────────────────────────────────────
// Served at: /movies/sitemap/0.xml  /movies/sitemap/1.xml  /movies/sitemap/2.xml
// Submitted to GSC as: /movies/sitemap.xml (index)
export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const id = await props.id;

  let movies: any[] = [];
  if (id === '0') {
    movies = await fetchPages('/movie/popular', 20);
  } else if (id === '1') {
    movies = await fetchTrendingPages('movie', 10);
  } else if (id === '2') {
    movies = await fetchPages('/movie/top_rated', 10);
  }

  const seen = new Set<string>();
  const entries: MetadataRoute.Sitemap = [];

  movies.forEach(movie => {
    if (!movie?.id || !movie?.title) return;
    const key = `${movie.id}`;
    if (seen.has(key)) return;
    seen.add(key);

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

  return entries;
}
