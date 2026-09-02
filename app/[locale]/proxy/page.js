'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function PlayerContent() {
    const searchParams = useSearchParams();
    const url = searchParams.get('url');

    if (!url) return null;

    return (
        <iframe
            src={url}
            style={{
                position: 'fixed',
                top: 0, left: 0,
                width: '100%', height: '100%',
                border: 'none', margin: 0, padding: 0,
                background: '#000'
            }}
            allowFullScreen
            scrolling="no"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture; accelerometer; gyroscope"
        />
    );
}

export default function ProxyPage() {
    return (
        <html>
            <body style={{ margin: 0, padding: 0, background: '#000', overflow: 'hidden' }}>
                <Suspense fallback={<div style={{ width: '100vw', height: '100vh', background: '#000' }} />}>
                    <PlayerContent />
                </Suspense>
            </body>
        </html>
    );
}
