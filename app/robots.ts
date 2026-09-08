import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://filmoxa.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    // All 3 sitemap roots submitted to Google Search Console
    sitemap: [
      `${SITE_URL}/sitemap.xml`,         // static: root + brand pages + genres (82 URLs)
      `${SITE_URL}/movies/sitemap.xml`,  // movies: popular + trending + top-rated (up to ~24 000 URLs)
      `${SITE_URL}/tv/sitemap.xml`,      // TV: popular + trending + top-rated + seasons (up to ~30 000 URLs)
    ],
  };
}
