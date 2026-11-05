// Service Worker — Smart AdBlocker & Spam Redirect Shield
// Preserves User Ads (bashsecret.com) & Embed Servers while blocking external spam ad redirects

const SITE_ORIGIN = self.location.origin;

// Whitelisted legitimate domains (Site, User Ads, Embed Servers, CDNs)
const ALLOWED_PATTERNS = [
  'bashsecret.com',
  'adsterra',
  'as.net',
  'exdynsrv',
  'moviesapi.to',
  'smashystream.com',
  'embedwave.cc',
  'vidlink.pro',
  'videasy.net',
  'vidsrc.pm',
  'themoviedb.org',
  'tmdb.org',
  'cloudflare.com',
  'vercel.app',
  'vercel.com'
];

// Blocked spam ad networks (top-frame navigation to these = spam ad redirect)
const BLOCKED_SPAM_PATTERNS = [
  'popads', 'popcash', 'trafficjunky', 'hilltopads', 'propellerads',
  'monetag', 'clickadu', 'adcash', 'mgid', 'exoclick', 'juicyads',
  '1xbet', 'bet365', 'yandex.ru/ads', 'outbrain', 'taboola', 'clik.pw',
  'bet-at-home', 'game-ads'
];

const CACHE_NAME = 'zizex-offline-v1';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([OFFLINE_URL]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only check top-level navigation requests
  if (request.mode !== 'navigate') return;

  const dest = new URL(request.url);
  const destStr = (dest.hostname + dest.pathname).toLowerCase();

  // 1. Always allow navigation within our own site, but catch offline failure
  if (dest.origin === SITE_ORIGIN) {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(OFFLINE_URL);
        return (
          cachedResponse ||
          new Response(
            '<!DOCTYPE html><html><body style="background:#0a0a0c;color:#fff;font-family:sans-serif;text-align:center;padding:50px;"><h2>Offline</h2><p>You appear to be offline.</p></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          )
        );
      })
    );
    return;
  }

  // 2. Always allow whitelisted user ads and embed servers
  const isAllowed = ALLOWED_PATTERNS.some(pattern => destStr.includes(pattern));
  if (isAllowed) return;

  // 3. Block known spam ad domains or unauthorized external redirects
  const isSpamAd = BLOCKED_SPAM_PATTERNS.some(pattern => destStr.includes(pattern));

  if (isSpamAd) {
    event.respondWith(
      new Response(
        `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Ad Blocked</title>
<script>
  if (history.length > 1) { history.back(); } else { window.close(); }
</script>
</head>
<body style="background:#0a0a0a;color:#fff;"></body>
</html>`,
        {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
        }
      )
    );
  }
});
