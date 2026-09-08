'use client';

import { useEffect } from 'react';

// Whitelisted domains (User's site, User's Adsterra/bashsecret ads, Embed Servers, CDNs)
const ALLOWED_AD_DOMAINS = [
  'bashsecret.com',
  'adsterra',
  'as.net',
  'exdynsrv',
  'vidsrc.pm',
  'vidsrc.me',
  'autoembed.co',
  'multiembed.mov',
  '2embed.cc',
  'vidlink.pro',
  'themoviedb.org',
  'tmdb.org',
  'cloudflare.com',
  'vercel.app',
  'filmoxa'
];

// Spam ad network signatures to block
const BLOCKED_SPAM_DOMAINS = [
  'popads', 'popcash', 'trafficjunky', 'hilltopads', 'propellerads',
  'monetag', 'clickadu', 'adcash', 'mgid', 'exoclick', 'juicyads',
  '1xbet', 'bet365', 'yandex.ru/ads', 'outbrain', 'taboola', 'clik.pw',
  'bet-at-home', 'game-ads'
];

export default function AdBlocker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Intercept window.open to block unauthorized popups/popunders
    const originalWindowOpen = window.open;
    window.open = function (url, target, features) {
      if (!url) return null;
      const urlStr = String(url).toLowerCase();

      // Always allow user's own site, relative links, and user's Adsterra/bashsecret ads
      const isAllowed = ALLOWED_AD_DOMAINS.some(domain => urlStr.includes(domain)) ||
                        urlStr.startsWith('/') ||
                        urlStr.startsWith(window.location.origin);

      const isSpam = BLOCKED_SPAM_DOMAINS.some(domain => urlStr.includes(domain));

      if (isAllowed && !isSpam) {
        return originalWindowOpen.apply(this, arguments);
      }

      console.warn('[Filmoxa AdBlocker] Blocked external spam ad popup:', urlStr);
      return null;
    };

    return () => {
      window.open = originalWindowOpen;
    };
  }, []);

  return null;
}
