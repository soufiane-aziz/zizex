export default function manifest() {
    return {
        name: 'Filmoxa',
        short_name: 'Filmoxa',
        description: 'Watch your favorite movies and TV shows for free in HD',
        start_url: '/',
        display: 'standalone',
        background_color: '#050505',
        theme_color: '#dc2626',
        icons: [
            {
                src: '/favicon.ico?v=3',
                sizes: 'any',
                type: 'image/x-icon',
            },
            {
                src: '/icon-192.png?v=3',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any maskable',
            },
            {
                src: '/icon-512.png?v=3',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable',
            },
        ],
    };
}
