import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zizex.vercel.app';

export default function robots(): MetadataRoute.Robots {
  const movieSitemaps = Array.from({ length: 12 }, (_, i) => `${SITE_URL}/movies/sitemap/${i}.xml`);
  const tvSitemaps = Array.from({ length: 12 }, (_, i) => `${SITE_URL}/tv/sitemap/${i}.xml`);

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
      {
        userAgent: [
          'Bytespider',
          'PetalBot',
          'AhrefsBot',
          'SemrushBot',
          'MJ12bot',
          'DotBot',
          'Scrapy',
          'Python',
        ],
        disallow: ['/'],
      },
    ],
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/feed.xml`,
      ...movieSitemaps,
      ...tvSitemaps,
    ],
  };
}
