const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zshow.vercel.app';

export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/_next/'],
        },
        sitemap: [
            `${SITE_URL}/sitemap/0.xml`,
            `${SITE_URL}/sitemap/1.xml`,
        ],
    };
}
