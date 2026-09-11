import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://filmoxa.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    // All 7 sitemaps submitted directly — sub-sitemaps are confirmed working
    // /movies/sitemap.xml and /tv/sitemap.xml are submitted separately in GSC
    sitemap: [
      `${SITE_URL}/sitemap.xml`,           // static: root + brand pages + genres (82 URLs)
      `${SITE_URL}/movies/sitemap/0.xml`,  // movies: popular (up to 8 000 URLs)
      `${SITE_URL}/movies/sitemap/1.xml`,  // movies: trending (up to 4 000 URLs)
      `${SITE_URL}/movies/sitemap/2.xml`,  // movies: top-rated (up to 4 000 URLs)
      `${SITE_URL}/tv/sitemap/0.xml`,      // tv: popular (up to 8 000 URLs)
      `${SITE_URL}/tv/sitemap/1.xml`,      // tv: trending (up to 4 000 URLs)
      `${SITE_URL}/tv/sitemap/2.xml`,      // tv: top-rated + seasons (up to 8 000 URLs)
    ],
  };
}
