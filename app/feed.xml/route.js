const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY || 'f82feeca535cc0132d1ab38948a70405';
const BASE_URL = 'https://api.themoviedb.org/3';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zizex.vercel.app';

export const revalidate = 86400; // 24 hours caching

function createSlug(title, id, type = 'movie') {
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

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  try {
    const [movieRes, tvRes] = await Promise.all([
      fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`, { next: { revalidate: 86400 } }),
      fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}`, { next: { revalidate: 86400 } }),
    ]);

    const movieData = movieRes.ok ? await movieRes.json() : null;
    const tvData = tvRes.ok ? await tvRes.json() : null;

    const movies = movieData?.results?.slice(0, 15) || [];
    const shows = tvData?.results?.slice(0, 15) || [];

    const now = new Date().toUTCString();

    const movieItemsHtml = movies.map(m => {
      const slug = createSlug(m.title, m.id, 'movie');
      const url = `${SITE_URL}/en/movie/${slug}`;
      return `
    <item>
      <title>${escapeXml(m.title)} (Movie)</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(m.overview || `Watch ${m.title} free in HD on Zizex.`)}</description>
      <pubDate>${m.release_date ? new Date(m.release_date).toUTCString() : now}</pubDate>
    </item>`;
    }).join('');

    const tvItemsHtml = shows.map(s => {
      const slug = createSlug(s.name, s.id, 'tv');
      const url = `${SITE_URL}/en/tv/${slug}/season-1/episode-1`;
      return `
    <item>
      <title>${escapeXml(s.name)} (TV Series)</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(s.overview || `Watch ${s.name} free online in HD on Zizex.`)}</description>
      <pubDate>${s.first_air_date ? new Date(s.first_air_date).toUTCString() : now}</pubDate>
    </item>`;
    }).join('');

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Zizex - Trending Movies &amp; TV Series</title>
    <link>${SITE_URL}</link>
    <description>Latest trending movies and TV series on Zizex free streaming platform.</description>
    <language>en</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${movieItemsHtml}
${tvItemsHtml}
  </channel>
</rss>`;

    return new Response(rssXml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200',
      },
    });
  } catch (error) {
    return new Response('Error generating feed', { status: 500 });
  }
}
