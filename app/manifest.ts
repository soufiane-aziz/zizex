export default function manifest() {
    return {
        name: 'zShow',
        short_name: 'zShow',
        description: 'Watch your favorite movies and TV shows',
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
        ],
    };
}
