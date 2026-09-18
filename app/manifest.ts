export default function manifest() {
    return {
        name: 'Zizex',
        short_name: 'Zizex',
        description: 'Watch your favorite movies and TV shows for free in HD',
        start_url: '/',
        display: 'standalone',
        background_color: '#050505',
        theme_color: '#dc2626',
        icons: [
            {
                src: '/icon.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable',
            },
            {
                src: '/apple-icon.png',
                sizes: '180x180',
                type: 'image/png',
            },
            {
                src: '/favicon.ico',
                sizes: '48x48 32x32 16x16',
                type: 'image/x-icon',
            },
        ],
    };
}
