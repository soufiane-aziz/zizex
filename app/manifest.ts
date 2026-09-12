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
                src: '/logo.png?v=5',
                sizes: 'any',
                type: 'image/png',
                purpose: 'any maskable',
            },
        ],
    };
}
