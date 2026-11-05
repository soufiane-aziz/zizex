import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BASE_URL = 'https://api.themoviedb.org/3';

// Strict allowlist of permitted TMDB endpoints to prevent SSRF
const ALLOWED_ENDPOINTS = new Set([
  '/search/multi',
  '/discover/movie',
  '/discover/tv',
  '/movie/top_rated',
  '/trending/movie/week',
  '/tv/top_rated',
  '/trending/tv/week',
]);

// In-memory cache for repeated searches and pagination
const cacheMap = new Map();
const MAX_CACHE_SIZE = 500;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// In-memory rate limiting map: IP -> { count, resetTime }
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute per IP

function isRateLimited(ip) {
  const now = Date.now();
  // Passive cleanup if map grows too large
  if (rateLimitMap.size > 2000) {
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetTime) rateLimitMap.delete(key);
    }
  }

  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  record.count += 1;
  return record.count > MAX_REQUESTS_PER_WINDOW;
}

function getCached(key) {
  const item = cacheMap.get(key);
  if (!item) return null;
  if (Date.now() - item.time > CACHE_TTL_MS) {
    cacheMap.delete(key);
    return null;
  }
  return item.data;
}

function setCached(key, data) {
  if (cacheMap.size >= MAX_CACHE_SIZE) {
    const oldestKey = cacheMap.keys().next().value;
    cacheMap.delete(oldestKey);
  }
  cacheMap.set(key, { time: Date.now(), data });
}

export async function GET(request) {
  // Rate limiting check
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );
  }

  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Service configuration unavailable' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  let endpoint = searchParams.get('endpoint') || searchParams.get('path') || '';

  if (!endpoint.startsWith('/')) {
    endpoint = `/${endpoint}`;
  }

  // 1. Validate endpoint against strict allowlist (SSRF prevention)
  if (!ALLOWED_ENDPOINTS.has(endpoint)) {
    return NextResponse.json({ error: 'Endpoint not permitted' }, { status: 403 });
  }

  // 2. Validate and sanitize query parameters
  const forwardedParams = new URLSearchParams();
  forwardedParams.set('api_key', apiKey);

  for (const [key, value] of searchParams.entries()) {
    if (key === 'endpoint' || key === 'path' || key === 'api_key') continue;

    // Validate specific parameters
    if (key === 'query') {
      const sanitizedQuery = value.slice(0, 100).trim();
      if (sanitizedQuery) forwardedParams.set('query', sanitizedQuery);
    } else if (key === 'page') {
      const pageNum = parseInt(value, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= 500) {
        forwardedParams.set('page', String(pageNum));
      }
    } else if (key === 'with_genres') {
      if (/^[\d,]+$/.test(value)) {
        forwardedParams.set('with_genres', value);
      }
    } else if (key === 'language') {
      if (/^[a-zA-Z]{2}(-[a-zA-Z]{2})?$/.test(value)) {
        forwardedParams.set('language', value);
      }
    } else if (key === 'sort_by') {
      const allowedSort = ['popularity.desc', 'popularity.asc', 'vote_average.desc', 'vote_average.asc', 'release_date.desc', 'first_air_date.desc'];
      if (allowedSort.includes(value)) {
        forwardedParams.set('sort_by', value);
      }
    } else if (key === 'vote_count.gte') {
      const count = parseInt(value, 10);
      if (!isNaN(count) && count >= 0 && count <= 100000) {
        forwardedParams.set('vote_count.gte', String(count));
      }
    }
  }

  const cacheKey = `${endpoint}?${forwardedParams.toString()}`;
  const cachedResponse = getCached(cacheKey);
  if (cachedResponse) {
    return NextResponse.json(cachedResponse, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  try {
    const tmdbUrl = `${BASE_URL}${endpoint}?${forwardedParams.toString()}`;
    const res = await fetch(tmdbUrl, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 1800 }, // Cache TMDB response for 30 minutes in Next.js Data Cache
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Upstream provider error' }, { status: res.status });
    }

    const data = await res.json();
    setCached(cacheKey, data);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal gateway error' }, { status: 500 });
  }
}

