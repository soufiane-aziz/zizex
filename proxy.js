import { NextResponse } from 'next/server';

// Known bot / scraper user agents to block immediately at Vercel Edge
const BAD_BOT_REGEX = /python|httpx|aiohttp|scrapy|puppeteer|playwright|headlesschrome|selenium|phantomjs|curl\/|wget\/|go-http-client|java\/|node-fetch|axios|postman|libwww-perl|bytespider|petalsearch|semrush|ahrefsbot|mj12bot|dotbot|claudebot|gptbot/i;

// Legitimate search engine bots and social media preview bots to ALLOW
const GOOD_BOT_REGEX = /googlebot|bingbot|yandex|duckduckbot|slurp|baiduspider|facebookexternalhit|twitterbot|whatsapp|telegrambot|linkedinbot|pinterest/i;

export function proxy(request) {
  const ua = request.headers.get('user-agent') || '';

  // 1. Block known bad bots/scrapers
  if (BAD_BOT_REGEX.test(ua) && !GOOD_BOT_REGEX.test(ua)) {
    return new NextResponse('Access Denied: Automated bot scraping is prohibited.', {
      status: 403,
      headers: { 
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-store',
      },
    });
  }

  // 2. Block requests with completely empty user-agents on TV/movie watch pages
  const pathname = request.nextUrl.pathname;
  if (!ua && (pathname.includes('/tv/') || pathname.includes('/movie/'))) {
    return new NextResponse('Access Denied: Invalid client headers.', {
      status: 403,
      headers: { 
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-store',
      },
    });
  }

  const response = NextResponse.next();

  // 3. Set Edge CDN Cache Control headers for localized pages to maximize Vercel Edge cache hits
  if (pathname.startsWith('/en/') || pathname.startsWith('/fr/') || pathname.startsWith('/ar/')) {
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files (_next/static, _next/image, favicon.ico, public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt)$).*)',
  ],
};
