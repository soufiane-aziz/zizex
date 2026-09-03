'use client';

import { useEffect } from 'react';

// Whitelisted domains (User's site, User's Adsterra/bashsecret ads, Embed Servers, CDNs)
const ALLOWED_AD_DOMAINS = [
  'bashsecret.com',
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
  'zizhub'
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

    // 1. Intercept window.open to block unauthorized popups/popunders
    const originalWindowOpen = window.open;
    window.open = function (url, target, features) {
      if (!url) return null;
      const urlStr = String(url).toLowerCase();

      // Always allow user's own site, relative links, and user's bashsecret ads
      const isAllowed = ALLOWED_AD_DOMAINS.some(domain => urlStr.includes(domain)) ||
                        urlStr.startsWith('/') ||
                        urlStr.startsWith(window.location.origin);

      const isSpam = BLOCKED_SPAM_DOMAINS.some(domain => urlStr.includes(domain));

      if (isAllowed && !isSpam) {
        return originalWindowOpen.apply(this, arguments);
      }

      console.warn('[ZizHub AdBlocker] Blocked external spam ad popup:', urlStr);
      return null;
    };

    // 2. MutationObserver: Block dynamically injected spam ad scripts
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.tagName === 'SCRIPT' && node.src) {
            const src = node.src.toLowerCase();
            const isUserAd = src.includes('bashsecret.com');
            const isSpamScript = BLOCKED_SPAM_DOMAINS.some(domain => src.includes(domain));

            if (isSpamScript && !isUserAd) {
              console.warn('[ZizHub AdBlocker] Removed spam ad script:', src);
              node.parentNode?.removeChild(node);
            }
          }
        });
      });
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });

    return () => {
      window.open = originalWindowOpen;
      observer.disconnect();
    };
  }, []);

  return null;
}
