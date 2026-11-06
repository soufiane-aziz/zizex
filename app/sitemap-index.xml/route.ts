const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://zizex-tv.vercel.app').replace(/\/$/, '');

export const revalidate = 86400; // 24 hours

export async function GET() {
  const movieSitemaps = Array.from({ length: 12 }, (_, i) => `  <sitemap>\n    <loc>${SITE_URL}/movies/sitemap/${i}.xml</loc>\n  </sitemap>`).join('\n');
  const tvSitemaps = Array.from({ length: 12 }, (_, i) => `  <sitemap>\n    <loc>${SITE_URL}/tv/sitemap/${i}.xml</loc>\n  </sitemap>`).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/feed.xml</loc>
  </sitemap>
${movieSitemaps}
${tvSitemaps}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200',
    },
  });
}
