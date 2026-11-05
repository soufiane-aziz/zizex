import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export const runtime = 'nodejs';

// Strict allowlist: only well-known path prefixes can be revalidated
const ALLOWED_PATH_PREFIXES = ['/', '/en/', '/fr/', '/ar/', '/movies/', '/tv/', '/sitemap', '/feed.xml', '/robots.txt'];

function isPathAllowed(path) {
  if (typeof path !== 'string' || path.length > 256) return false;
  // Must start with /
  if (!path.startsWith('/')) return false;
  // Block path traversal
  if (path.includes('..') || path.includes('\0')) return false;
  return ALLOWED_PATH_PREFIXES.some(prefix => path === prefix || path.startsWith(prefix));
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get('path');
  const secret = searchParams.get('secret');

  // ── 1. Auth: always require secret if REVALIDATE_SECRET is set.
  //            If the env var is NOT set, block all external calls
  //            (the endpoint is unusable without a secret configured).
  const expectedSecret = process.env.REVALIDATE_SECRET;
  if (!expectedSecret) {
    return NextResponse.json({ message: 'Revalidation endpoint not configured' }, { status: 403 });
  }
  if (secret !== expectedSecret) {
    return NextResponse.json({ message: 'Invalid token secret' }, { status: 401 });
  }

  // ── 2. Validate path ───────────────────────────────────────────────────────
  if (!path) {
    return NextResponse.json({ message: 'Missing path parameter' }, { status: 400 });
  }
  if (!isPathAllowed(path)) {
    return NextResponse.json({ message: 'Path not allowed' }, { status: 403 });
  }

  try {
    revalidatePath(path);
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating path', error: err.message }, { status: 500 });
  }
}
