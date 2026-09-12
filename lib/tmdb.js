import { cache } from 'react';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY || 'f82feeca535cc0132d1ab38948a70405';
const BASE_URL = 'https://api.themoviedb.org/3';

// In-memory cache for ultra-fast zero-latency API responses across requests
const memoryCache = new Map();
const MAX_CACHE_SIZE = 1000;
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export const fetchFromTMDB = cache(async (path, queryParams = '') => {
  if (!API_KEY) return null;

  const cacheKey = `${path}?${queryParams}`;
  const now = Date.now();

  // 1. Check in-memory RAM cache first
  if (memoryCache.has(cacheKey)) {
    const cached = memoryCache.get(cacheKey);
    if (now - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }

  const url = `${BASE_URL}${path}?api_key=${API_KEY}${queryParams}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 604800 }, // 7 days Vercel Edge CDN cache
    });

    if (!res.ok) return null;

    const data = await res.json();

    // Prevent unlimited memory growth
    if (memoryCache.size >= MAX_CACHE_SIZE) {
      const firstKey = memoryCache.keys().next().value;
      memoryCache.delete(firstKey);
    }

    memoryCache.set(cacheKey, { timestamp: now, data });
    return data;
  } catch (err) {
    console.error(`TMDB fetch error for ${path}:`, err);
    return null;
  }
});
