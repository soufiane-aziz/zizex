// Service Worker — Anti-Ad Redirect Protection
// Blocks streaming iframe ad redirects at the network level (no sandbox needed)

const SITE_ORIGIN = self.location.origin;

// Known streaming/ad domains to block (top-frame navigation to these = ad redirect)
const BLOCKED_PATTERNS = [
  'doubleclick', 'googlesyndication', 'adnxs', 'popads', 'popcash',
  'trafficjunky', 'ero-advertising', 'hilltopads', 'adsterra', 'propellerads',
  'monetizer', 'juicyads', 'clickadu', 'adcash', 'mgid', 'exoclick',
  'revcontent', 'outbrain', 'taboola', 'traffic', 'redirect', 'aff.',
  'click.', 'track.', 'ad.', 'ads.', 'adsrv', 'adserv'
];

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle top-level navigation requests
  if (request.mode !== 'navigate') return;

  const dest = new URL(request.url);

  // Always allow navigation within our own site
  if (dest.origin === SITE_ORIGIN) return;

  // Check if this looks like an ad redirect
  const destStr = dest.hostname + dest.pathname;
  const isAdDomain = BLOCKED_PATTERNS.some(pattern =>
    destStr.toLowerCase().includes(pattern)
  );

  // Block if it's a known ad domain OR any external navigation
  // (streaming page users shouldn't be navigating to external sites in same tab)
  event.respondWith(
    new Response(
      `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0a0a0a; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; }
</style>
</head>
<body>
<script>
  // Silently return to streaming page
  if (history.length > 1) {
    history.back();
  } else {
    history.back();
  }
</script>
</body>
</html>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store'
        }
      }
    )
  );
});
