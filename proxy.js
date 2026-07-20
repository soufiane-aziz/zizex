import { NextResponse } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;
const LOCALES = ['en', 'fr', 'ar'];
const DEFAULT_LOCALE = 'en';

export function proxy(req) {
    const { pathname } = req.nextUrl;

    // Skip internal paths and assets
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/favicon.ico') ||
        PUBLIC_FILE.test(pathname)
    ) {
        return NextResponse.next();
    }

    // Parse locale prefix
    const pathnameHasLocale = LOCALES.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    // If there's already a locale, proceed
    if (pathnameHasLocale) {
        return NextResponse.next();
    }

    // Handle redirects for legacy URLs
    if (pathname.startsWith('/watch/movie/')) {
        const movieId = pathname.split('/').pop();
        return NextResponse.redirect(new URL(`/en/movie/${movieId}`, req.url), 301);
    }

    if (pathname.startsWith('/watch/tv/')) {
        const tvId = pathname.split('/').pop();
        // Default to season-1/episode-1 as requested/standard for tv episode player
        return NextResponse.redirect(new URL(`/en/tv/${tvId}/season-1/episode-1`, req.url), 301);
    }

    // Detect browser language or fall back to default
    const acceptLanguage = req.headers.get('accept-language') || '';
    let locale = DEFAULT_LOCALE;

    if (acceptLanguage) {
        const preferredLanguage = acceptLanguage.split(',')[0].split('-')[0].toLowerCase();
        if (LOCALES.includes(preferredLanguage)) {
            locale = preferredLanguage;
        }
    }

    // We perform a redirection here to keep the URL clean for SEO indexing
    const targetPath = pathname === '/' ? '' : pathname;
    return NextResponse.redirect(new URL(`/${locale}${targetPath}`, req.url), 307);
}

export const config = {
    matcher: [
        // Skip all internal paths (_next) and public directories/files
        '/((?!_next|api|favicon.ico).*)',
    ],
};
