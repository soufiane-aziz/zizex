// @ts-nocheck
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Signatures of known copyright / anti-piracy crawlers & aggressive scrapers
const BLOCKED_USER_AGENTS = [
  'markscan',
  'marketly',
  'mediastory',
  'opsec',
  'redpoints',
  'digimarc',
  'corsearch',
  'link-busters',
  'toppletrack',
  'audiolock',
  'removeyourmedia',
  'friendmts',
  'group-ib',
  'ip-echelon',
  'markmonitor',
  'bytespider',
  'petalbot',
  'dotbot',
  'mj12bot',
  'ahrefsbot',
  'semrushbot',
  'scrapy',
];

export function middleware(request: NextRequest) {
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();

  // Check if request is from a known copyright crawler or unauthorized scraper
  const isBlocked = BLOCKED_USER_AGENTS.some((crawler) => userAgent.includes(crawler));

  if (isBlocked) {
    // Return 403 Forbidden to deny access and prevent content harvesting for DMCA filings
    return new NextResponse('Access Denied', {
      status: 403,
      headers: {
        'Content-Type': 'text/plain',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  }

  return NextResponse.next();
}

// Apply middleware to all routes except Next.js internals, static files, and icons
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.png, apple-icon.png (icons)
     * - sw.js (service worker)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|webp|svg|ico)$|sw.js).*)',
  ],
};
