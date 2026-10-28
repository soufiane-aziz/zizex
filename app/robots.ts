// @ts-nocheck
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://zizex.vercel.app').replace(/\/$/, '');

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
      {
        userAgent: [
          // Known anti-piracy crawlers & copyright scrapers (found on Lumen)
          'MarkScan',
          'Markscan',
          'Marketly',
          'MediaStory',
          'OpSec',
          'RedPoints',
          'Digimarc',
          'Corsearch',
          'Link-Busters',
          'ToppleTrack',
          'AudioLock',
          'RemoveYourMedia',
          'FriendMTS',
          'Group-IB',
          'IP-Echelon',
          'MarkMonitor',
          // Generic aggressive scrapers
          'Bytespider',
          'PetalBot',
          'AhrefsBot',
          'SemrushBot',
          'MJ12bot',
          'DotBot',
          'Scrapy',
          'Python',
          'python-requests',
        ],
        disallow: ['/'],
      },
    ],
    // Only expose general sitemaps. Detailed movie/tv sitemaps remain accessible
    // for direct webmaster submission in GSC/Bing without being broadcast to scrapers.
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/feed.xml`,
    ],
  };
}
