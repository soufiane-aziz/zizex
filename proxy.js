import { NextResponse } from 'next/server';

// 1. Known scraper / bot user-agent patterns & Copyright DMCA crawlers
const BAD_BOT_REGEX = /python|httpx|aiohttp|scrapy|puppeteer|playwright|headlesschrome|selenium|phantomjs|curl\/|wget\/|go-http-client|java\/|node-fetch|axios|postman|libwww-perl|bytespider|petalsearch|semrush|ahrefsbot|mj12bot|dotbot|claudebot|gptbot|markscan|marketly|mediastory|opsec|redpoints|digimarc|corsearch|link-busters|toppletrack|audiolock|removeyourmedia|friendmts|group-ib|ip-echelon|markmonitor/i;

// 2. Verified search engine crawlers and social media preview bots to ALLOW
const GOOD_BOT_REGEX = /google|bing|yandex|duckduck|slurp|baidu|facebook|twitter|whatsapp|telegram|linkedin|pinterest/i;

// 3. Simple Edge sliding window rate limiter (In-Memory per Edge Instance)
const ipRateMap = new Map();
const RATE_LIMIT_WINDOW = 30 * 1000; // 30 seconds
const MAX_REQUESTS_PER_WINDOW = 20;   // Max 20 episode/movie page loads per 30s

function isRateLimited(ip) {
  const now = Date.now();
  const record = ipRateMap.get(ip);

  if (!record) {
    ipRateMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (now > record.resetTime) {
    ipRateMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  record.count += 1;
  if (record.count > MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  return false;
}

// Clean up old IP entries every 2 minutes to keep memory clean
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRateMap.entries()) {
    if (now > record.resetTime) {
      ipRateMap.delete(ip);
    }
  }
}, 2 * 60 * 1000);

export function middleware(request) {
  const ua = request.headers.get('user-agent') || '';
  const pathname = request.nextUrl.pathname;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';

  // Layer 1: Block known automated scraper user-agents
  if (BAD_BOT_REGEX.test(ua) && !GOOD_BOT_REGEX.test(ua)) {
    return new NextResponse('Access Denied: Automated bot scraping is prohibited.', {
      status: 403,
      headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' },
    });
  }

  // Layer 2: Detect headless scrapers missing critical browser headers on watch pages
  const isWatchPage = pathname.includes('/tv/') || pathname.includes('/movie/');
  if (isWatchPage && !GOOD_BOT_REGEX.test(ua)) {
    const acceptLang = request.headers.get('accept-language');
    const secFetchDest = request.headers.get('sec-fetch-dest');
    
    // Real browsers ALWAYS send accept-language or sec-fetch-dest when navigating pages
    if (!ua || (!acceptLang && !secFetchDest)) {
      return new NextResponse('Access Denied: Suspicious automated client headers.', {
        status: 403,
        headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' },
      });
    }
  }

  // Layer 3: Edge Rate Limiting for rapid automated page crawling
  if (isWatchPage && !GOOD_BOT_REGEX.test(ua) && ip !== 'unknown') {
    if (isRateLimited(ip)) {
      return new NextResponse('Too Many Requests: Rate limit exceeded.', {
        status: 429,
        headers: { 'Content-Type': 'text/plain', 'Retry-After': '30' },
      });
    }
  }

  const response = NextResponse.next();

  // Layer 4: Set Edge CDN Cache-Control headers for localized routes
  if (pathname.startsWith('/en/') || pathname.startsWith('/fr/') || pathname.startsWith('/ar/')) {
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
  }

  return response;
}

// Export default function for Next.js 16 Proxy convention compatibility
export default function proxy(request) {
  return middleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets, sitemaps, robots.txt, feed.xml, and manifests
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap|robots\\.txt|feed\\.xml|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt)$).*)',
  ],
};
