import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const BASE_URL = 'https://api.themoviedb.org/3';
const SITE_HOST = process.env.SITE_HOST || process.env.NEXT_PUBLIC_SITE_HOST || 'zizex-tv.vercel.app';
const SITE_URL = `https://${SITE_HOST}`;
const LOCALES = ['en', 'fr', 'ar'];

// ── Rate Limiting: allow at most 1 submission per 5 minutes per IP ───────────
const submissionMap = new Map();
const COOLDOWN_MS = 5 * 60 * 1000;

function isRateLimited(ip) {
  const last = submissionMap.get(ip);
  const now = Date.now();
  if (last && now - last < COOLDOWN_MS) return true;
  submissionMap.set(ip, now);
  // Cleanup old entries
  if (submissionMap.size > 1000) {
    for (const [k, v] of submissionMap.entries()) {
      if (now - v > COOLDOWN_MS) submissionMap.delete(k);
    }
  }
  return false;
}

function createSlug(title, id) {
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

async function fetchTMDB(endpoint, apiKey, pages = 3) {
  const nums = Array.from({ length: pages }, (_, i) => i + 1);
  const responses = await Promise.all(
    nums.map(p =>
      fetch(`${BASE_URL}${endpoint}?api_key=${apiKey}&page=${p}`)
        .then(res => (res.ok ? res.json() : null))
        .catch(() => null)
    )
  );
  return responses.flatMap(r => r?.results ?? []);
}

async function handleSubmission(req) {
  // ── 1. Auth: require INDEXNOW_SECRET if set ────────────────────────────────
  const indexnowSecret = process.env.INDEXNOW_SECRET;
  if (indexnowSecret) {
    const { searchParams } = new URL(req.url);
    const provided = searchParams.get('secret');
    if (provided !== indexnowSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // ── 2. Rate limiting ───────────────────────────────────────────────────────
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  if (ip !== 'unknown' && isRateLimited(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try again in 5 minutes.' }, { status: 429 });
  }

  // ── 3. Resolve keys from env only ─────────────────────────────────────────
  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const indexnowKey = process.env.INDEXNOW_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Service configuration unavailable' }, { status: 500 });
  }
  if (!indexnowKey) {
    return NextResponse.json({ error: 'IndexNow key not configured' }, { status: 500 });
  }

  try {
    const [popularMovies, popularTV] = await Promise.all([
      fetchTMDB('/movie/popular', apiKey, 4),
      fetchTMDB('/tv/popular', apiKey, 4),
    ]);

    const primaryBrandUrls = [
      `${SITE_URL}/`,
      `${SITE_URL}/en`,
      `${SITE_URL}/fr`,
      `${SITE_URL}/ar`,
    ];

    const urlSet = new Set(primaryBrandUrls);

    LOCALES.forEach(loc => {
      urlSet.add(`${SITE_URL}/${loc}`);
      urlSet.add(`${SITE_URL}/${loc}/movies`);
      urlSet.add(`${SITE_URL}/${loc}/tv`);
      urlSet.add(`${SITE_URL}/${loc}/top-rated`);
      urlSet.add(`${SITE_URL}/${loc}/trending`);
      urlSet.add(`${SITE_URL}/${loc}/about`);
      urlSet.add(`${SITE_URL}/${loc}/contact`);
      urlSet.add(`${SITE_URL}/${loc}/privacy`);
    });

    popularMovies.forEach(movie => {
      if (!movie?.id || !movie?.title) return;
      const slug = createSlug(movie.title, movie.id);
      LOCALES.forEach(loc => {
        urlSet.add(`${SITE_URL}/${loc}/movie/${slug}`);
      });
    });

    popularTV.forEach(show => {
      if (!show?.id || !show?.name) return;
      const slug = createSlug(show.name, show.id);
      LOCALES.forEach(loc => {
        urlSet.add(`${SITE_URL}/${loc}/tv/${slug}/season-1/episode-1`);
      });
    });

    const urlList = Array.from(urlSet);

    const payload = {
      host: SITE_HOST,
      key: indexnowKey,
      keyLocation: `${SITE_URL}/${indexnowKey}.txt`,
      urlList,
    };

    const res = await fetch('https://www.bing.com/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });

    return NextResponse.json({
      success: res.ok || res.status === 200 || res.status === 202,
      status: res.status,
      submittedUrls: urlList.length,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req) {
  return handleSubmission(req);
}

export async function POST(req) {
  return handleSubmission(req);
}
