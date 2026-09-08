import type { MetadataRoute } from 'next';

// ─── Cache: 7-day CDN revalidation ───────────────────────────────────────────
export const revalidate = 604800;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://filmoxa.vercel.app';
const LOCALES = ['en', 'fr', 'ar'];

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

function safeUrl(url: string): string {
  try { return encodeURI(url); } catch { return url; }
}

function buildAlternates(path: string): Record<string, string> {
  const alt: Record<string, string> = {};
  LOCALES.forEach(loc => { alt[loc] = safeUrl(`${SITE_URL}/${loc}${path}`); });
  alt['x-default'] = safeUrl(`${SITE_URL}/en${path}`);
  return alt;
}

// ─── Sitemap 0: Static pages (root + brand + genres) ─────────────────────────
// Served at: /sitemap.xml
// Total entries: 1 + (7×3) + (20×3) = 82 URLs
export default function sitemap(): MetadataRoute.Sitemap {
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

  // 1. Brand static pages per locale (7 × 3 = 21 entries)
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

  // 2. Genre pages per locale (20 × 3 = 60 entries)
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

  return entries; // 82 total URLs
}
