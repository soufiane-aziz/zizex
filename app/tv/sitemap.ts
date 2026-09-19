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
          next: { revalidate: 604800 },
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
  if (!API_KEY) return 2;
  try {
    const res = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}`, {
      next: { revalidate: 604800 },
    });
    if (!res.ok) return 2;
    const data = await res.json();
    return Math.min(data?.number_of_seasons ?? 1, 8);
  } catch {
    return 2;
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
// Generates 12 sub-sitemaps (0 to 11) for TV Shows
export async function generateSitemaps() {
  return Array.from({ length: 12 }, (_, i) => ({ id: String(i) }));
}

// ─── Sitemap: TV Shows ─────────────────────────────────────────────────────────
// Served at: /tv/sitemap/0.xml ... /tv/sitemap/11.xml
export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const id = await props.id;
  const sId = parseInt(id, 10) || 0;

  let shows: any[] = [];
  if (sId >= 0 && sId <= 4) {
    // Popular TV shows (pages 1..25 split into 5 batches)
    const start = sId * 5 + 1;
    shows = await fetchPageRange('/tv/popular', start, start + 4);
  } else if (sId >= 5 && sId <= 7) {
    // Top-rated TV shows (pages 1..15 split into 3 batches)
    const start = (sId - 5) * 5 + 1;
    shows = await fetchPageRange('/tv/top_rated', start, start + 4);
  } else if (sId >= 8 && sId <= 9) {
    // Trending TV shows (pages 1..10 split into 2 batches)
    const start = (sId - 8) * 5 + 1;
    shows = await fetchTrendingRange('tv', start, start + 4);
  } else if (sId === 10) {
    // Drama & Action TV shows
    shows = await fetchPageRange('/discover/tv?with_genres=10759,18&sort_by=popularity.desc', 1, 5);
  } else if (sId === 11) {
    // Animation, Sci-Fi & Comedy TV shows
    shows = await fetchPageRange('/discover/tv?with_genres=16,10765,35&sort_by=popularity.desc', 1, 5);
  }

  const seen = new Set<string>();
  const uniqueShows = shows.filter(s => {
    if (!s?.id || !s?.name) return false;
    const key = `${s.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Fetch season counts for top shows in batch
  const topBatch = uniqueShows.slice(0, 100);
  const seasonCounts = await Promise.all(topBatch.map(s => fetchTvSeasonCount(s.id)));
  const tvSeasonMap = new Map<number, number>();
  topBatch.forEach((s, i) => tvSeasonMap.set(s.id, seasonCounts[i]));

  const entries: MetadataRoute.Sitemap = [];

  uniqueShows.forEach(show => {
    const slug       = createSlug(show.name, show.id);
    const airDate    = safeDate(show.first_air_date);
    const numSeasons = tvSeasonMap.get(show.id) ?? 2;

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
