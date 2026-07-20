import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get('path');
    const secret = searchParams.get('secret');

    // Verify secret token to prevent unauthorized cache purging calls
    const expectedSecret = process.env.REVALIDATE_SECRET;
    if (expectedSecret && secret !== expectedSecret) {
        return NextResponse.json({ message: 'Invalid token secret' }, { status: 401 });
    }

    if (!path) {
        return NextResponse.json({ message: 'Missing path parameter' }, { status: 400 });
    }

    try {
        // Purges Next.js Edge CDN cache on-demand for the specific path segment
        revalidatePath(path);
        return NextResponse.json({ revalidated: true, now: Date.now() });
    } catch (err) {
        return NextResponse.json({ message: 'Error revalidating path context', error: err.message }, { status: 500 });
    }
}
