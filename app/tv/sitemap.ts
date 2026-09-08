import type { MetadataRoute } from 'next';
import { createSlug } from '../../lib/slug';

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
// id 0 = popular TV shows    (pages 1-20)
// id 1 = trending TV shows   (pages 1-10)
// id 2 = top-rated TV shows  (pages 1-10)
export async function generateSitemaps() {
  return [{ id: '0' }, { id: '1' }, { id: '2' }];
}

// ─── Sitemap: TV Shows ────────────────────────────────────────────────────────
// Served at: /tv/sitemap/0.xml  /tv/sitemap/1.xml  /tv/sitemap/2.xml
// Submitted to GSC as: /tv/sitemap.xml (index)
export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const id = await props.id;

  let shows: any[] = [];
  if (id === '0') {
    shows = await fetchPages('/tv/popular', 20);
  } else if (id === '1') {
    shows = await fetchTrendingPages('tv', 10);
  } else if (id === '2') {
    shows = await fetchPages('/tv/top_rated', 10);
  }

  const seen = new Set<string>();
  const uniqueShows = shows.filter(s => {
    if (!s?.id || !s?.name) return false;
    const key = `${s.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Fetch real season counts for top 200 shows to avoid TMDB rate limits
  const top200       = uniqueShows.slice(0, 200);
  const seasonCounts = await Promise.all(top200.map(s => fetchTvSeasonCount(s.id)));
  const tvSeasonMap  = new Map<number, number>();
  top200.forEach((s, i) => tvSeasonMap.set(s.id, seasonCounts[i]));

  const entries: MetadataRoute.Sitemap = [];

  uniqueShows.forEach(show => {
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
