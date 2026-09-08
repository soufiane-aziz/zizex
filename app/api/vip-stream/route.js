export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

import fs from 'fs';
import path from 'path';
import { TelegramClient } from 'teleproto';
import { StringSession } from 'teleproto/sessions';

let clientInstance = null;

async function getTelegramClient() {
    if (clientInstance && clientInstance.connected) {
        return clientInstance;
    }

    const configPath = path.join(process.cwd(), 'telegram.config.json');
    const sessionPath = path.join(process.cwd(), 'telegram-session.txt');

    if (!fs.existsSync(configPath) || !fs.existsSync(sessionPath)) {
        throw new Error('Telegram config or session file missing');
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const sessionStr = fs.readFileSync(sessionPath, 'utf8').trim();

    const client = new TelegramClient(new StringSession(sessionStr), Number(config.apiId), config.apiHash, {
        connectionRetries: 5,
    });

    await client.connect();
    clientInstance = client;
    return client;
}

const messageCache = new Map();

async function getCachedMessage(client, channelId, msgId) {
    const key = `${channelId}:${msgId}`;
    if (messageCache.has(key)) {
        return messageCache.get(key);
    }
    const entity = await client.getEntity(channelId);
    const [message] = await client.getMessages(entity, { ids: [Number(msgId)] });
    if (message && message.media) {
        messageCache.set(key, message);
        setTimeout(() => messageCache.delete(key), 3600 * 1000); // 1 hour cache
    }
    return message;
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const msgId = searchParams.get('msgId');

        if (!msgId) {
            return new Response('Missing msgId', { status: 400 });
        }

        const configPath = path.join(process.cwd(), 'telegram.config.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        const client = await getTelegramClient();
        const message = await getCachedMessage(client, config.channelId, msgId);

        if (!message || !message.media) {
            return new Response('Media not found', { status: 404 });
        }

        const fileSize = message.media.document ? message.media.document.size : 0;
        const rangeHeader = request.headers.get('range');

        const MAX_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB max per range response
        let start = 0;
        let end = fileSize > 0 ? fileSize - 1 : 0;

        if (rangeHeader && fileSize > 0) {
            const parts = rangeHeader.replace(/bytes=/, '').split('-');
            start = parseInt(parts[0], 10) || 0;
            if (parts[1]) {
                end = parseInt(parts[1], 10);
            } else {
                end = Math.min(start + MAX_CHUNK_SIZE - 1, fileSize - 1);
            }
        } else if (fileSize > 0) {
            start = 0;
            end = Math.min(MAX_CHUNK_SIZE - 1, fileSize - 1);
        }

        if (fileSize > 0 && (end - start + 1 > MAX_CHUNK_SIZE)) {
            end = start + MAX_CHUNK_SIZE - 1;
        }

        const chunkSize = end - start + 1;

        const headers = {
            'Content-Type': 'video/mp4',
            'Accept-Ranges': 'bytes',
            'Access-Control-Allow-Origin': '*',
            'Content-Length': String(chunkSize),
        };

        if (fileSize > 0) {
            headers['Content-Range'] = `bytes ${start}-${end}/${fileSize}`;
        }

        if (request.method === 'HEAD') {
            return new Response(null, { status: 206, headers });
        }

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    const iter = client.iterDownload(message, {
                        requestSize: 1024 * 1024, // 1MB chunks for fast streaming
                        offset: start,
                        limit: chunkSize > 0 ? chunkSize : undefined,
                    });

                    for await (const chunk of iter) {
                        controller.enqueue(chunk);
                    }
                    controller.close();
                } catch (err) {
                    controller.error(err);
                }
            }
        });

        return new Response(stream, { status: 206, headers });

    } catch (err) {
        return new Response('Stream error: ' + err.message, { status: 500 });
    }
}

export async function HEAD(request) {
    return GET(request);
}
