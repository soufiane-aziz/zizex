// @ts-nocheck
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://zizex-tv.vercel.app').replace(/\/$/, '');

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/*/tv/*/*/episode-*', // Keep episode watch links out of crawler indexing
          '/tv/*/*/episode-*',
        ],
      },
      {
        userAgent: [
          // Known anti-piracy crawlers & copyright scrapers (found on Lumen & DMCA notices)
          'MarkScan',
          'Markscan',
          'Marketly',
          'MediaStory',
          'OpSec',
          'RedPoints',
          'Red Points',
          'Digimarc',
          'Corsearch',
          'Link-Busters',
          'LinkBusters',
          'ToppleTrack',
          'AudioLock',
          'RemoveYourMedia',
          'FriendMTS',
          'Friend-MTS',
          'Group-IB',
          'IP-Echelon',
          'MarkMonitor',
          'MUSO',
          'Muso',
          'LeakID',
          'Leak-ID',
          'Webdrone',
          'Tracer',
          'AiPlex',
          'Brandit',
          'NetNames',
          'Attributor',
          'Entura',
          'Incopro',
          'DtecNet',
          'Rightscorp',
          'Rivendell',
          'Cyveillance',
          'CopyrightAgent',
          'AntiPiracy',
          // Generic aggressive scrapers & bots
          'Bytespider',
          'PetalBot',
          'AhrefsBot',
          'SemrushBot',
          'MJ12bot',
          'DotBot',
          'Scrapy',
          'Python',
          'python-requests',
          'aiohttp',
          'httpx',
          'curl',
          'Wget',
          'Go-http-client',
        ],
        disallow: ['/'],
      },
    ],
    // Expose all primary sitemaps and RSS feed to search engines
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/movies/sitemap.xml`,
      `${SITE_URL}/tv/sitemap.xml`,
      `${SITE_URL}/feed.xml`,
    ],
  };
}
