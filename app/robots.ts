import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zizex.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: [
      `${SITE_URL}/sitemap.xml`,          // Root static pages & genres
      `${SITE_URL}/movies/sitemap.xml`,   // Movies master sitemap index
      `${SITE_URL}/tv/sitemap.xml`,       // TV shows master sitemap index
    ],
  };
}
