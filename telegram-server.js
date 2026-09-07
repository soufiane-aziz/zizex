const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = process.env.TELEGRAM_SERVER_PORT || 5000;
const MAPPING_FILE = path.join(__dirname, 'telegram-mapping.json');
const CONFIG_FILE = path.join(__dirname, 'telegram.config.json');

// Default Config
let config = {
    botToken: "8823243113:AAG6dNaU7cTpHhwEsnZXUF3BPg7BDvVFLHI",
    channelId: "-1003786107337"
};

// Helper to dynamically load config
function getConfig() {
    let currentConfig = {
        botToken: "8823243113:AAG6dNaU7cTpHhwEsnZXUF3BPg7BDvVFLHI",
        channelId: "-1003786107337"
    };
    if (fs.existsSync(CONFIG_FILE)) {
        try {
            currentConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        } catch (e) {
            console.error("Error reading telegram.config.json:", e.message);
        }
    }
    return currentConfig;
}

// Load or initialize mapping
function getMappings() {
    if (fs.existsSync(MAPPING_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));
        } catch (e) {
            console.error("Error reading mapping file:", e.message);
        }
    }
    return {};
}

// Save mapping helper
function saveMappings(data) {
    fs.writeFileSync(MAPPING_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Helper to fetch file info from Telegram API
function getTelegramFileUrl(fileId, callback) {
    const config = getConfig();
    if (!config.botToken || config.botToken.includes("YOUR_TELEGRAM_BOT_TOKEN") || config.botToken.includes("VOTRE_BOT_TOKEN")) {
        return callback(new Error("Bot Token non configuré dans telegram.config.json"));
    }

    const options = {
        hostname: 'api.telegram.org',
        servername: 'api.telegram.org',
        path: `/bot${config.botToken}/getFile?file_id=${fileId}`,
        method: 'GET',
        family: 4,
        headers: { 'User-Agent': 'Mozilla/5.0' }
    };

    https.get(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
            try {
                const parsed = JSON.parse(body);
                if (parsed.ok && parsed.result && parsed.result.file_path) {
                    const downloadUrl = `https://api.telegram.org/file/bot${config.botToken}/${parsed.result.file_path}`;
                    callback(null, downloadUrl);
                } else {
                    callback(new Error(parsed.description || "Échec de récupération du fichier Telegram"));
                }
            } catch (err) {
                callback(err);
            }
        });
    }).on('error', (err) => callback(err));
}

// Server Creation
const server = http.createServer((req, res) => {
    // Enable CORS for localhost access from Next.js app
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    // 1. Status Check
    if (pathname === '/api/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', server: 'Telegram VIP Streamer', port: PORT }));
        return;
    }

    // 2. VIP Player (HTML5 Video Player embeddable via iframe)
    if (pathname === '/player') {
        const mediaId = query.id; // e.g. TMDB ID like "550" or "1396-1-1"
        const mappings = getMappings();
        const mediaData = mappings[mediaId];

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });

        if (!mediaData) {
            res.end(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>VIP Telegram Server</title>
                    <style>
                        body { background: #09090b; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                        .card { background: #18181b; padding: 2rem; border-radius: 12px; border: 1px solid #27272a; text-align: center; max-width: 480px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
                        h2 { color: #ef4444; margin-top: 0; }
                        code { background: #27272a; padding: 2px 6px; border-radius: 4px; color: #38bdf8; font-family: monospace; }
                        .badge { display: inline-block; background: #e11d48; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 8px; border-radius: 9999px; margin-bottom: 12px; letter-spacing: 1px; text-transform: uppercase; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <span class="badge">SERVEUR VIP TELEGRAM (LOCAL)</span>
                        <h2>Vidéo Non Trouvée</h2>
                        <p>Aucun fichier Telegram associé à l'ID : <code>${mediaId || 'Non spécifié'}</code></p>
                        <p style="font-size: 13px; color: #a1a1aa;">Pour ajouter cette vidéo, ouvrez <code>telegram-mapping.json</code> et ajoutez le <code>file_id</code> Telegram pour l'ID <strong>"${mediaId}"</strong>.</p>
                    </div>
                </body>
                </html>
            `);
            return;
        }

        // Generate Player HTML
        const videoSrc = mediaData.directUrl || `/stream?id=${mediaId}`;
        const title = mediaData.title || `VIP Stream ${mediaId}`;

        res.end(`
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${title} - VIP Player</title>
                <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
                <style>
                    html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; display: flex; align-items: center; justify-content: center; }
                    .plyr { width: 100%; height: 100%; max-height: 100vh; --plyr-color-main: #dc2626; }
                    .badge-vip { position: absolute; top: 12px; left: 12px; z-index: 10; background: rgba(220, 38, 38, 0.9); color: #fff; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 6px; backdrop-filter: blur(8px); pointer-events: none; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
                </style>
            </head>
            <body>
                <div class="badge-vip">SERVEUR VIP LOCAL (0 PUBS)</div>
                <video id="player" playsinline controls preload="metadata">
                    <source src="${videoSrc}" type="video/mp4" />
                    Votre navigateur ne prend pas en charge la lecture vidéo HTML5.
                </video>
                <script src="https://cdn.plyr.io/3.7.8/plyr.js"></script>
                <script>
                    const player = new Plyr('#player', {
                        autoplay: true,
                        controls: ['play-large', 'play', 'progress', 'current-time', 'duration', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
                        settings: ['quality', 'speed']
                    });
                </script>
            </body>
            </html>
        `);
        return;
    }

    // 3. Stream Proxy with Range HTTP support (for smooth seeking)
    if (pathname === '/stream') {
        const mediaId = query.id;
        const fileIdQuery = query.file_id;
        const mappings = getMappings();

        let fileId = fileIdQuery;
        let directUrl = null;

        if (mediaId && mappings[mediaId]) {
            fileId = mappings[mediaId].fileId;
            directUrl = mappings[mediaId].directUrl;
        }

        // If a direct MP4 URL or HTTP link is provided in mapping:
        if (directUrl) {
            proxyExternalStream(directUrl, req, res);
            return;
        }

        if (!fileId) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Missing fileId or unmapped mediaId');
            return;
        }

        // Fetch direct download link from Telegram API
        getTelegramFileUrl(fileId, (err, downloadUrl) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Telegram API Error: ' + err.message);
                return;
            }

            proxyExternalStream(downloadUrl, req, res);
        });
        return;
    }

    // 4. API Endpoint to manage mappings dynamically
    if (pathname === '/api/mapping') {
        if (req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(getMappings(), null, 2));
            return;
        }
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    const current = getMappings();
                    const updated = { ...current, ...data };
                    saveMappings(updated);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, mappings: updated }));
                } catch (e) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: e.message }));
                }
            });
            return;
        }
    }

    // 5. Helper endpoint to inspect recent Telegram updates and extract file_ids
    if (pathname === '/api/telegram-updates') {
        const config = getConfig();
        const options = {
            hostname: 'api.telegram.org',
            servername: 'api.telegram.org',
            path: `/bot${config.botToken}/getUpdates`,
            method: 'GET',
            family: 4,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        };
        https.get(options, (apiRes) => {
            let body = '';
            apiRes.on('data', chunk => body += chunk);
            apiRes.on('end', () => {
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                try {
                    const parsed = JSON.parse(body);
                    const filesFound = [];
                    if (parsed.ok && parsed.result) {
                        parsed.result.forEach(update => {
                            const msg = update.message || update.channel_post;
                            if (msg) {
                                if (msg.video) {
                                    filesFound.push({
                                        type: 'video',
                                        fileName: msg.video.file_name || 'video.mp4',
                                        duration: msg.video.duration,
                                        fileSizeMB: (msg.video.file_size / (1024 * 1024)).toFixed(2) + ' MB',
                                        fileId: msg.video.file_id
                                    });
                                } else if (msg.document) {
                                    filesFound.push({
                                        type: 'document',
                                        fileName: msg.document.file_name || 'document',
                                        fileSizeMB: (msg.document.file_size / (1024 * 1024)).toFixed(2) + ' MB',
                                        fileId: msg.document.file_id
                                    });
                                }
                            }
                        });
                    }
                    res.end(JSON.stringify({ success: true, count: filesFound.length, files: filesFound, raw: parsed }, null, 2));
                } catch (e) {
                    res.end(JSON.stringify({ error: e.message, body }));
                }
            });
        }).on('error', (err) => {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        });
        return;
    }

    // Fallback 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
});

// Helper function to proxy external streams with Range header support
function proxyExternalStream(targetUrl, req, res) {
    const parsedTarget = url.parse(targetUrl);
    const options = {
        hostname: parsedTarget.hostname,
        port: parsedTarget.port || 443,
        path: parsedTarget.path,
        method: 'GET',
        family: 4,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    };

    // Forward Range header if client requested it
    if (req.headers.range) {
        options.headers['Range'] = req.headers.range;
    }

    const proxyReq = https.request(options, (proxyRes) => {
        // Forward HTTP headers from Telegram/Source
        const responseHeaders = { ...proxyRes.headers };
        responseHeaders['Access-Control-Allow-Origin'] = '*';

        res.writeHead(proxyRes.statusCode, responseHeaders);
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
        console.error("Proxy Stream Error:", err.message);
        if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Stream Proxy Error');
        }
    });

    proxyReq.end();
}

let lastUpdateId = 0;

function startAutoPoller() {
    const poll = () => {
        const config = getConfig();
        if (!config.botToken || config.botToken.includes("YOUR_TELEGRAM_BOT_TOKEN") || config.botToken.includes("VOTRE_BOT_TOKEN")) {
            setTimeout(poll, 5000);
            return;
        }

        const options = {
            hostname: 'api.telegram.org',
            servername: 'api.telegram.org',
            path: `/bot${config.botToken}/getUpdates?offset=${lastUpdateId + 1}&timeout=3`,
            method: 'GET',
            family: 4,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        };

        const req = https.get(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    if (parsed.ok && parsed.result && parsed.result.length > 0) {
                        parsed.result.forEach(update => {
                            lastUpdateId = Math.max(lastUpdateId, update.update_id);
                            const msg = update.message || update.channel_post;
                            if (msg) {
                                const video = msg.video || (msg.document && msg.document.mime_type && msg.document.mime_type.startsWith('video/') ? msg.document : null);
                                if (video) {
                                    const fileName = video.file_name || msg.caption || `video_${video.file_id.substring(0, 8)}`;
                                    console.log(`\n📥 [AUTOMATIQUE] NOUVELLE VIDÉO CAPTURÉE !`);
                                    console.log(`🎬 Fichier : ${fileName}`);
                                    console.log(`🔑 File ID : ${video.file_id}`);

                                    // Save to mapping under 'latest' and under fileName
                                    const currentMappings = getMappings();
                                    currentMappings["latest"] = { title: fileName, fileId: video.file_id };
                                    currentMappings["550"] = { title: fileName, fileId: video.file_id };
                                    saveMappings(currentMappings);
                                    console.log(`✅ Fichier auto-mappé sur ID 'latest' et ID '550' dans telegram-mapping.json !\n`);
                                }
                            }
                        });
                    }
                } catch (e) {}
                setTimeout(poll, 3000);
            });
        });

        req.on('error', () => {
            setTimeout(poll, 5000);
        });
    };

    poll();
}

server.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 SERVEUR TELEGRAM VIP DÉMARRÉ SUR PORT ${PORT}`);
    console.log(`📍 Status API: http://localhost:${PORT}/api/status`);
    console.log(`🎬 Player URL: http://localhost:${PORT}/player?id=550`);
    console.log(`⚡ Auto-détecteur de vidéos Telegram ACTIF !`);
    console.log(`==================================================\n`);
    startAutoPoller();
});
