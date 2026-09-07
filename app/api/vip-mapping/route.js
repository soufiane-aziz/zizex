import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const mappingPath = path.join(process.cwd(), 'telegram-mapping.json');
        if (fs.existsSync(mappingPath)) {
            const data = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
            return NextResponse.json(data);
        }
        return NextResponse.json({});
    } catch (e) {
        return NextResponse.json({}, { status: 500 });
    }
}
