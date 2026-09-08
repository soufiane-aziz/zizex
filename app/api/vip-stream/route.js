export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

import fs from 'fs';
import path from 'path';
import { TelegramClient } from 'teleproto';
import { StringSession } from 'teleproto/sessions';
import bigInt from 'big-integer';

let clientInstance = global._telegramClient || null;

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
        connectionRetries: 3,
        timeout: 10,
    });

    await client.connect();
    clientInstance = client;
    global._telegramClient = client;
    return client;
}

const messageCache = global._messageCache || new Map();
global._messageCache = messageCache;

async function getCachedMessage(client, channelId, msgId) {
    const key = `${channelId}:${msgId}`;
    if (messageCache.has(key)) {
        return messageCache.get(key);
    }
    let message = null;
    try {
        const [msg] = await client.getMessages(channelId, { ids: [Number(msgId)] });
        message = msg;
    } catch (e) {
        const entity = await client.getEntity(channelId);
        const [msg] = await client.getMessages(entity, { ids: [Number(msgId)] });
        message = msg;
    }

    if (message && message.media) {
        messageCache.set(key, message);
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

        // Support external persistent MTProto server proxy (e.g. VPS / Render / Railway) for instant load on Vercel
        const remoteServerUrl = process.env.MTPROTO_SERVER_URL;
        if (remoteServerUrl) {
            const targetUrl = `${remoteServerUrl.replace(/\/$/, '')}/stream?${searchParams.toString()}`;
            const reqHeaders = {};
            if (request.headers.get('range')) {
                reqHeaders['Range'] = request.headers.get('range');
            }
            const remoteRes = await fetch(targetUrl, {
                method: request.method,
                headers: reqHeaders,
            });
            return new Response(remoteRes.body, {
                status: remoteRes.status,
                headers: remoteRes.headers,
            });
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

        // Fast-start optimization: 256KB for initial metadata probe (start=0), 1MB for playback
        let start = 0;
        if (rangeHeader && fileSize > 0) {
            const parts = rangeHeader.replace(/bytes=/, '').split('-');
            start = parseInt(parts[0], 10) || 0;
        }

        const DEFAULT_CHUNK = 2 * 1024 * 1024; // 2MB chunk to guarantee full moov metadata (1.61MB)
        let end = fileSize > 0 ? fileSize - 1 : 0;

        if (rangeHeader && fileSize > 0) {
            const parts = rangeHeader.replace(/bytes=/, '').split('-');
            if (parts[1]) {
                end = parseInt(parts[1], 10);
                if (start === 0 && end < DEFAULT_CHUNK - 1) {
                    end = Math.min(DEFAULT_CHUNK - 1, fileSize - 1);
                }
            } else {
                end = Math.min(start + DEFAULT_CHUNK - 1, fileSize - 1);
            }
        } else if (fileSize > 0) {
            start = 0;
            end = Math.min(DEFAULT_CHUNK - 1, fileSize - 1);
        }

        if (fileSize > 0 && (end - start + 1 > DEFAULT_CHUNK)) {
            end = start + DEFAULT_CHUNK - 1;
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
                        requestSize: 512 * 1024,
                        offset: bigInt(start),
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
