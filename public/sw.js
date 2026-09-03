// Service Worker — Smart AdBlocker & Spam Redirect Shield
// Preserves User Ads (bashsecret.com) & Embed Servers while blocking external spam ad redirects

const SITE_ORIGIN = self.location.origin;

// Whitelisted legitimate domains (Site, User Ads, Embed Servers, CDNs)
const ALLOWED_PATTERNS = [
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
  'vercel.com'
];

// Blocked spam ad networks (top-frame navigation to these = spam ad redirect)
const BLOCKED_SPAM_PATTERNS = [
  'popads', 'popcash', 'trafficjunky', 'hilltopads', 'propellerads',
  'monetag', 'clickadu', 'adcash', 'mgid', 'exoclick', 'juicyads',
  '1xbet', 'bet365', 'yandex.ru/ads', 'outbrain', 'taboola', 'clik.pw',
  'bet-at-home', 'game-ads'
];

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only check top-level navigation requests
  if (request.mode !== 'navigate') return;

  const dest = new URL(request.url);
  const destStr = (dest.hostname + dest.pathname).toLowerCase();

  // 1. Always allow navigation within our own site
  if (dest.origin === SITE_ORIGIN) return;

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
