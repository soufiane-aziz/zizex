import { NextResponse } from 'next/server';

// ─── 1. Exhaustive DMCA bots, copyright crawlers, anti-piracy tools & automated scrapers ───
const BAD_BOT_REGEX = /markscan|markmonitor|marketly|mediastory|opsec|redpoints|red\s*points|digimarc|corsearch|link-busters|linkbusters|toppletrack|topple\s*track|audiolock|removeyourmedia|friendmts|friend-mts|group-ib|groupib|ip-echelon|ipechelon|muso|leakid|leak-id|webdrone|tracer\.ai|tracer|aiplex|brandit|netnames|attributor|entura|incopro|dtecnet|rightscorp|rivendell|sovrn|cyveillance|copyrightagent|copyright-agent|antipiracy|anti-piracy|counterfeit|python|httpx|aiohttp|scrapy|puppeteer|playwright|headlesschrome|selenium|phantomjs|curl\/|wget\/|go-http-client|java\/|node-fetch|axios|postman|libwww-perl|okhttp|httpclient|zgrab|censys|shodan|bytespider|petalsearch|petalbot|semrush|ahrefsbot|mj12bot|dotbot|claudebot|gptbot/i;

// ─── 2. Verified good search engines and social preview crawlers to ALWAYS allow ───────────
const GOOD_BOT_REGEX = /google|googlebot|google-inspectiontool|storebot-google|mediapartners-google|adsbot-google|bing|bingbot|msnbot|bingpreview|yandex|yandexbot|yandeximages|duckduck|duckduckbot|slurp|baidu|baiduspider|sogou|applebot|facebook|facebookexternalhit|facebot|twitter|twitterbot|whatsapp|telegram|telegrambot|discord|discordbot|slack|slackbot|linkedin|pinterest/i;

// ─── 3. Edge sliding window rate limiter (In-Memory per Edge Instance) ────────────────────
const ipRateMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 60 seconds
const MAX_REQUESTS_PER_WINDOW = 120; // 120 page loads per minute

function isRateLimited(ip) {
  const now = Date.now();

  // Passive cleanup to avoid standing setInterval in Edge runtime (saves Fluid Active CPU)
  if (ipRateMap.size > 1000) {
    for (const [k, rec] of ipRateMap.entries()) {
      if (now > rec.resetTime) {
        ipRateMap.delete(k);
      }
    }
  }

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

export function middleware(request) {
  const ua = request.headers.get('user-agent') || '';
  const pathname = request.nextUrl.pathname;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';

  // 1. Whitelist verified search bots first
  const isGoodBot = GOOD_BOT_REGEX.test(ua);

  // 2. Layer 1: Block known DMCA crawlers, anti-piracy agencies and scrapers
  if (!isGoodBot && BAD_BOT_REGEX.test(ua)) {
    return new NextResponse('Access Denied: Automated bot crawling or anti-piracy scraping policy violation.', {
      status: 403,
      headers: {
        'Content-Type': 'text/plain',
        'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  }

  // 3. Layer 2: Detect headless scrapers missing critical browser headers on watch pages
  const isWatchPage = pathname.includes('/tv/') || pathname.includes('/movie/');
  if (isWatchPage && !isGoodBot) {
    const acceptLang = request.headers.get('accept-language');
    const secFetchDest = request.headers.get('sec-fetch-dest');

    // Real browsers ALWAYS send accept-language or sec-fetch-dest when navigating pages
    if (!ua || (!acceptLang && !secFetchDest)) {
      return new NextResponse('Access Denied: Suspicious automated client headers.', {
        status: 403,
        headers: {
          'Content-Type': 'text/plain',
          'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }
  }

  // 4. Layer 3: Edge Rate Limiting for rapid automated page crawling
  const isPrefetch =
    request.headers.get('next-router-prefetch') ||
    request.headers.get('purpose') === 'prefetch' ||
    request.headers.get('sec-purpose') === 'prefetch' ||
    request.headers.get('x-nextjs-data') ||
    request.nextUrl.searchParams.has('_rsc');

  if (isWatchPage && !isPrefetch && !isGoodBot && ip !== 'unknown') {
    if (isRateLimited(ip)) {
      return new NextResponse('Too Many Requests: Rate limit exceeded. Please wait a moment.', {
        status: 429,
        headers: {
          'Content-Type': 'text/plain',
          'Retry-After': '10',
          'X-Robots-Tag': 'noindex, nofollow',
        },
      });
    }
  }

  const response = NextResponse.next();

  // Layer 5: Set Edge CDN Cache-Control & Security headers
  if (!pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
  }
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), interest-cohort=()');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

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
