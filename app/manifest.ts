export default function manifest() {
    return {
        name: 'ZizHub',
        short_name: 'ZizHub',
        description: 'Watch your favorite movies and TV shows for free in HD',
        start_url: '/',
        display: 'standalone',
        background_color: '#050505',
        theme_color: '#dc2626',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any maskable',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable',
            },
        ],
    };
}
