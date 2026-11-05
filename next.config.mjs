/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/**',
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
  experimental: {
    optimizePackageImports: ['@vercel/analytics', '@vercel/speed-insights'],
  },
  async rewrites() {
    return [
      {
        source: '/sitemap/:id.xml',
        destination: '/sitemap.xml',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*\\.(svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Global security headers on ALL routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.plyr.io https://www.googletagmanager.com https://www.google-analytics.com https://vercel.live",
              "style-src 'self' 'unsafe-inline' https://cdn.plyr.io",
              "img-src 'self' data: blob: https://image.tmdb.org https://www.themoviedb.org https://i.ytimg.com https://www.google-analytics.com",
              "font-src 'self' data:",
              "connect-src 'self' https://api.themoviedb.org https://www.google-analytics.com https://vitals.vercel-insights.com https://vercel.live",
              "media-src 'self' blob:",
              "frame-src 'self' https://moviesapi.to https://*.moviesapi.to https://player.smashystream.com https://embedwave.cc https://vidlink.pro https://player.videasy.net https://vidsrc.pm https://vidsrc.to https://vidsrc.xyz",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
