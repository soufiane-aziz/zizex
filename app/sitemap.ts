import type { MetadataRoute } from 'next';

// ─── Cache: 7-day CDN revalidation ───────────────────────────────────────────
export const revalidate = 604800;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://zizex.vercel.app';
const LOCALES = ['en', 'fr', 'ar'];

// ─── All 20 Genre Slugs ───────────────────────────────────────────────────────
const GENRE_SLUGS = [
  'action', 'adventure', 'animation', 'comedy', 'crime',
  'documentary', 'drama', 'family', 'fantasy', 'history',
  'horror', 'music', 'mystery', 'romance', 'sci-fi',
  'sport', 'thriller', 'tv-movie', 'war', 'western',
];

// ─── Static brand pages (Zizex keyword anchors) ────────────────────────────
const BRAND_PAGES: { path: string; priority: number; freq: string }[] = [
  { path: '/movies',    priority: 0.85, freq: 'daily'   },
  { path: '/tv',        priority: 0.85, freq: 'daily'   },
  { path: '/top-rated', priority: 0.80, freq: 'weekly'  },
  { path: '/trending',  priority: 0.80, freq: 'daily'   },
  { path: '/search',    priority: 0.70, freq: 'weekly'  },
  { path: '/about',     priority: 0.60, freq: 'monthly' },
];

function safeUrl(url: string): string {
  try { return encodeURI(url); } catch { return url; }
}

function buildAlternates(path: string): Record<string, string> {
  const alt: Record<string, string> = {};
  LOCALES.forEach(loc => { alt[loc] = safeUrl(`${SITE_URL}/${loc}${path}`); });
  alt['x-default'] = safeUrl(`${SITE_URL}${path || '/'}`);
  return alt;
}

// ─── Sitemap 0: Static pages (root + brand + genres) ─────────────────────────
// Served at: /sitemap.xml
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const now = new Date();

  // 1. Top 1: Main Canonical URL (Root & EN) — Priority 1.0
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
        'x-default': safeUrl(`${SITE_URL}/`),
      },
    },
  });

  entries.push({
    url: safeUrl(`${SITE_URL}/en`),
    changeFrequency: 'daily',
    priority: 1.0,
    lastModified: now,
    alternates: {
      languages: {
        en: safeUrl(`${SITE_URL}/en`),
        fr: safeUrl(`${SITE_URL}/fr`),
        ar: safeUrl(`${SITE_URL}/ar`),
        'x-default': safeUrl(`${SITE_URL}/`),
      },
    },
  });

  // 2. Top 2: French URL (/fr) — Priority 0.99
  entries.push({
    url: safeUrl(`${SITE_URL}/fr`),
    changeFrequency: 'daily',
    priority: 0.99,
    lastModified: now,
    alternates: {
      languages: {
        en: safeUrl(`${SITE_URL}/en`),
        fr: safeUrl(`${SITE_URL}/fr`),
        ar: safeUrl(`${SITE_URL}/ar`),
        'x-default': safeUrl(`${SITE_URL}/`),
      },
    },
  });

  // 3. Top 3: Arabic URL (/ar) — Priority 0.98
  entries.push({
    url: safeUrl(`${SITE_URL}/ar`),
    changeFrequency: 'daily',
    priority: 0.98,
    lastModified: now,
    alternates: {
      languages: {
        en: safeUrl(`${SITE_URL}/en`),
        fr: safeUrl(`${SITE_URL}/fr`),
        ar: safeUrl(`${SITE_URL}/ar`),
        'x-default': safeUrl(`${SITE_URL}/`),
      },
    },
  });

  // 4. Brand static pages per locale (/movies, /tv, etc.)
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

  // 5. Genre pages per locale
  LOCALES.forEach(locale => {
    GENRE_SLUGS.forEach(slug => {
      const path = `/genre/${slug}`;
      entries.push({
        url: safeUrl(`${SITE_URL}/${locale}${path}`),
        changeFrequency: 'weekly',
        priority: 0.50,
        lastModified: now,
        alternates: { languages: buildAlternates(path) },
      });
    });
  });

  return entries;
}
