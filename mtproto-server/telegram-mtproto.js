/**
 * telegram-mtproto.js
 * Serveur VIP Telegram utilisant MTProto (teleproto/GramJS)
 * Capable de streamer des fichiers jusqu'à 4 Go sans publicité.
 *
 * ÉTAPES POUR DÉMARRER :
 * 1. Allez sur https://my.telegram.org/apps et créez une application
 * 2. Récupérez api_id et api_hash
 * 3. Mettez-les dans telegram.config.json : { "apiId": 123456, "apiHash": "abc...", "botToken": "...", "channelId": "..." }
 * 4. Lancez : node telegram-mtproto.js
 * 5. Entrez votre numéro de téléphone et le code de vérification (1 seule fois)
 * 6. La session est sauvegardée et le serveur démarre automatiquement ensuite
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { TelegramClient } = require('teleproto');
const { StringSession } = require('teleproto/sessions');
const bigInt = require('big-integer');

const PORT = process.env.PORT || process.env.MTPROTO_PORT || 5001;
const CONFIG_FILE = path.join(__dirname, 'telegram.config.json');
const MAPPING_FILE = path.join(__dirname, 'telegram-mapping.json');
const SESSION_FILE = path.join(__dirname, 'telegram-session.txt');

// --- Helpers ---
function getConfig() {
    try {
        return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    } catch (e) {
        return {};
    }
}

function getMappings() {
    try {
        return JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));
    } catch (e) {
        return {};
    }
}

function getSavedSession() {
    if (fs.existsSync(SESSION_FILE)) {
        return fs.readFileSync(SESSION_FILE, 'utf8').trim();
    }
    return '';
}

function saveSession(sessionStr) {
    fs.writeFileSync(SESSION_FILE, sessionStr, 'utf8');
}

// --- CORS & Caching ---
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

function setCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
}

// --- Main ---
async function main() {
    const config = getConfig();

    if (!config.apiId || !config.apiHash) {
        console.error('\n❌ ERREUR: apiId et apiHash manquants dans telegram.config.json');
        console.error('👉 Allez sur https://my.telegram.org/apps pour les créer');
        console.error('👉 Ajoutez-les dans telegram.config.json :\n');
        console.error(JSON.stringify({
            apiId: 123456,
            apiHash: "votre_api_hash_ici",
            botToken: config.botToken || "votre_bot_token",
            channelId: config.channelId || "votre_channel_id"
        }, null, 2));
        process.exit(1);
    }

    const savedSession = getSavedSession();
    const stringSession = new StringSession(savedSession);

    const client = new TelegramClient(stringSession, Number(config.apiId), config.apiHash, {
        connectionRetries: 5,
    });

    console.log('\n==================================================');
    console.log('🚀 SERVEUR VIP TELEGRAM MTPROTO');
    console.log('==================================================');

    if (!savedSession) {
        console.log('\n🔐 Première connexion - Authentification requise');
        const readline = require('readline').createInterface({ input: process.stdin, output: process.stdout });
        const ask = (q) => new Promise(r => readline.question(q, r));

        await client.start({
            phoneNumber: async () => await ask('📱 Entrez votre numéro Telegram (ex: +212612345678): '),
            password: async () => await ask('🔑 Mot de passe 2FA (laissez vide si aucun): '),
            phoneCode: async () => await ask('📨 Code de vérification reçu par Telegram: '),
            onError: (err) => console.error('Erreur:', err),
        });

        const sessionStr = client.session.save();
        saveSession(sessionStr);
        readline.close();
        console.log('\n✅ Session sauvegardée ! Plus besoin de vous reconnecter.');
    } else {
        await client.connect();
        console.log('\n✅ Connecté via session sauvegardée !');
    }

    // --- HTTP Server for streaming ---
    const server = http.createServer(async (req, res) => {
        setCors(res);

        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }

        const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
        const pathname = parsedUrl.pathname;
        const mediaId = parsedUrl.searchParams.get('id');
        const messageId = parsedUrl.searchParams.get('msgId');

        // Status
        if (pathname === '/api/status') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'ok', server: 'Telegram MTProto VIP Streamer', port: PORT }));
            return;
        }

        // Player page
        if (pathname === '/player') {
            const mappings = getMappings();
            const entry = mediaId && mappings[mediaId];
            const title = entry ? entry.title : `VIP Stream ${mediaId}`;
            const msgIdToUse = messageId || (entry ? entry.messageId : null);

            const slugParam = parsedUrl.searchParams.get('slug') || '';
            const localeParam = parsedUrl.searchParams.get('locale') || 'fr';
            const prevS = parsedUrl.searchParams.get('prevS');
            const prevE = parsedUrl.searchParams.get('prevE');
            const nextS = parsedUrl.searchParams.get('nextS');
            const nextE = parsedUrl.searchParams.get('nextE');

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                    <title>${title} - Filmoxa VIP Player</title>
                    <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
                    <style>
                        * { box-sizing: border-box; touch-action: manipulation; }
                        html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
                        .player-container { relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #000; overflow: hidden; user-select: none; }
                        .plyr { width: 100%; height: 100%; max-height: 100vh; --plyr-color-main: #dc2626; }
                        .plyr video { transition: filter 0.1s ease, object-fit 0.2s ease; }

                        /* Header Bar */
                        .top-bar { position: absolute; top: 12px; left: 12px; right: 12px; z-index: 30; display: flex; align-items: center; justify-content: space-between; pointer-events: none; }
                        .top-left { display: flex; align-items: center; gap: 8px; pointer-events: auto; }
                        .top-right { display: flex; align-items: center; gap: 8px; pointer-events: auto; }
                        .btn-vip-action { background: rgba(20, 20, 20, 0.85); color: #fff; border: 1px solid rgba(255,255,255,0.15); font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 20px; cursor: pointer; backdrop-filter: blur(10px); display: flex; align-items: center; gap: 6px; transition: all 0.2s ease; }
                        .btn-vip-action.btn-icon-only { padding: 6px 10px; }
                        .btn-vip-action:hover { background: rgba(220, 38, 38, 0.9); border-color: rgba(220, 38, 38, 1); transform: translateY(-1px); }
                        .btn-vip-action:active { transform: scale(0.95); }

                        /* Lock Screen */
                        .btn-lock { background: #dc2626; color: #fff; border: 1px solid #dc2626; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 20px; cursor: pointer; backdrop-filter: blur(10px); display: flex; align-items: center; gap: 6px; transition: opacity 0.3s ease, transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease; box-shadow: 0 4px 15px rgba(220, 38, 38, 0.5); }
                        .btn-lock:hover { background: #b91c1c; border-color: #b91c1c; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(220, 38, 38, 0.7); }
                        .btn-lock:active { transform: scale(0.95); }
                        .btn-lock.locked { background: #dc2626; border-color: #dc2626; color: #fff; box-shadow: 0 0 20px rgba(220, 38, 38, 0.9); }

                        /* Lock overlay – intercepts all touches when locked */
                        .lock-blocker { position: absolute; inset: 0; z-index: 28; display: none; touch-action: none; cursor: default; }
                        .lock-blocker.active { display: block; }

                        /* When screen is locked: hide center controls, share/fit buttons, and Plyr bottom bar */
                        .player-locked .center-controls-overlay { opacity: 0 !important; pointer-events: none !important; }
                        .player-locked .top-left { opacity: 0 !important; pointer-events: none !important; }
                        .player-locked #fitBtn { opacity: 0 !important; pointer-events: none !important; }
                        .player-locked .plyr__controls { opacity: 0 !important; pointer-events: none !important; transition: none !important; }
                        .player-locked .btn-lock { z-index: 70 !important; opacity: 1; pointer-events: auto !important; }
                        .player-locked .btn-lock.fade-out { opacity: 0 !important; pointer-events: none !important; }

                        /* HUD Gesture Feedback Overlays */
                        .hud-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 40; background: rgba(0, 0, 0, 0.85); color: #fff; padding: 14px 22px; border-radius: 16px; backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.15); display: flex; flex-direction: column; align-items: center; gap: 8px; pointer-events: none; opacity: 0; transition: opacity 0.25s ease, transform 0.25s ease; box-shadow: 0 8px 30px rgba(0,0,0,0.6); }
                        .hud-overlay.show { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
                        .hud-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #fca5a5; display: flex; align-items: center; gap: 6px; }
                        .hud-bar-container { width: 140px; height: 6px; background: rgba(255,255,255,0.2); border-radius: 3px; overflow: hidden; }
                        .hud-bar-fill { height: 100%; width: 50%; background: #dc2626; border-radius: 3px; transition: width 0.1s linear; }

                        /* Toast */
                        .toast-notice { position: absolute; bottom: 80px; left: 50%; transform: translateX(-50%) translateY(20px); z-index: 50; background: #dc2626; color: #fff; font-size: 13px; font-weight: 700; padding: 10px 20px; border-radius: 30px; box-shadow: 0 6px 20px rgba(220, 38, 38, 0.5); opacity: 0; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); pointer-events: none; }
                        .toast-notice.show { opacity: 1; transform: translateX(-50%) translateY(0); }

                        /* Center Media Controls Overlay */
                        .center-controls-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 35; display: flex; align-items: center; justify-content: center; gap: 28px; pointer-events: auto; opacity: 1; transition: opacity 0.3s ease, transform 0.3s ease; }
                        .center-controls-overlay.hidden-controls { opacity: 0; pointer-events: none; transform: translate(-50%, -50%) scale(0.95); }
                        
                        .center-btn { background: rgba(15, 15, 15, 0.8); border: 1.5px solid rgba(255, 255, 255, 0.2); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; backdrop-filter: blur(12px); box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6); transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                        .center-btn:hover { background: #dc2626; border-color: #dc2626; transform: scale(1.14); box-shadow: 0 0 25px rgba(220, 38, 38, 0.7); }
                        .center-btn:active { transform: scale(0.92); }
                        
                        .center-btn-skip { width: 56px; height: 56px; flex-direction: column; gap: 0px; }
                        .center-btn-skip .skip-num { font-size: 10px; font-weight: 800; letter-spacing: -0.3px; margin-top: -2px; }
                        .center-btn-main { width: 72px; height: 72px; background: #dc2626; border-color: rgba(255, 255, 255, 0.4); box-shadow: 0 4px 20px rgba(220, 38, 38, 0.6); }
                        .no-video { color: #aaa; font-family: system-ui; text-align: center; padding: 2rem; }
                        .no-video code { background: #222; padding: 2px 6px; border-radius: 4px; color: #38bdf8; }

                        /* Responsive Mobile Adjustments */
                        @media (max-width: 640px) {
                            .top-bar { top: 8px; left: 8px; right: 8px; }
                            .top-left, .top-right { gap: 6px; }
                            .btn-vip-action, .btn-lock { padding: 4px 10px; font-size: 11px; gap: 4px; border-radius: 16px; }
                            .btn-vip-action svg, .btn-lock svg { width: 12px; height: 12px; }

                            .center-controls-overlay { gap: 16px; }
                            .center-btn-skip { width: 44px; height: 44px; }
                            .center-btn-skip svg { width: 18px; height: 18px; }
                            .center-btn-skip .skip-num { font-size: 9px; }
                            .center-btn-main { width: 56px; height: 56px; }
                            .center-btn-main svg { width: 26px; height: 26px; }

                            .hud-overlay { padding: 10px 16px; border-radius: 12px; gap: 6px; }
                            .hud-title { font-size: 11px; letter-spacing: 0.5px; }
                            .hud-bar-container { width: 100px; height: 5px; }

                            .toast-notice { bottom: 65px; font-size: 11px; padding: 7px 14px; }

                            .plyr { --plyr-control-spacing: 6px; font-size: 12px; }
                        }

                        @media (max-width: 400px) {
                            .btn-vip-action span, .btn-lock span { font-size: 10px; }
                            .btn-vip-action, .btn-lock { padding: 3px 8px; }
                            .center-controls-overlay { gap: 12px; }
                            .center-btn-skip { width: 40px; height: 40px; }
                            .center-btn-main { width: 50px; height: 50px; }
                        }
                    </style>
                </head>
                <body>
                    <div class="player-container" id="playerContainer">
                        <div class="top-bar">
                            <div class="top-left"></div>
                            <div class="top-right">
                                <button class="btn-vip-action" id="fitBtn" title="Display Mode (Contain / Stretch / Zoom)">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                                    <span id="fitLabel">Contain</span>
                                </button>
                                <button class="btn-lock" id="lockBtn" title="Lock screen">
                                    <svg id="lockIconLocked" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:none"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                    <svg id="lockIconUnlocked" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
                                    <span id="lockLabel">Lock</span>
                                </button>
                            </div>
                        </div>

                        <!-- Lock Blocker Overlay -->
                        <div class="lock-blocker" id="lockBlocker"></div>
                        <div id="smartlinkOverlay" style="position: absolute; inset: 0; z-index: 26; cursor: pointer;"></div>

                        <!-- Center Media Controls (Back 10s | Play/Pause | Skip 10s) -->
                        <div class="center-controls-overlay" id="centerControlsOverlay">
                            <button class="center-btn center-btn-skip" id="centerRewindBtn" title="Rewind 10s (←)">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M11 17l-5-5 5-5"/>
                                    <path d="M18 17l-5-5 5-5"/>
                                </svg>
                                <span class="skip-num">-10s</span>
                            </button>

                            <button class="center-btn center-btn-main" id="centerPlayPauseBtn" title="Play / Pause (Space)">
                                <svg id="centerPlayIcon" width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="6 3 20 12 6 21 6 3"/>
                                </svg>
                                <svg id="centerPauseIcon" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style="display: none;">
                                    <rect x="6" y="4" width="4" height="16" rx="1.5"/>
                                    <rect x="14" y="4" width="4" height="16" rx="1.5"/>
                                </svg>
                            </button>

                            <button class="center-btn center-btn-skip" id="centerForwardBtn" title="Forward 10s (→)">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M13 17l5-5-5-5"/>
                                    <path d="M6 17l5-5-5-5"/>
                                </svg>
                                <span class="skip-num">+10s</span>
                            </button>
                        </div>

                        <!-- Gesture HUD -->
                        <div class="hud-overlay" id="hudOverlay">
                            <div class="hud-title" id="hudTitle">BRIGHTNESS</div>
                            <div class="hud-bar-container">
                                <div class="hud-bar-fill" id="hudBarFill"></div>
                            </div>
                            <div style="font-size: 12px; font-weight: 800;" id="hudValueText">100%</div>
                        </div>

                        <!-- Toast Notice -->
                        <div class="toast-notice" id="toastNotice">Link copied to clipboard!</div>
                        ${msgIdToUse
                            ? `<video id="player" playsinline controls autoplay preload="auto" x-webkit-airplay="allow"><source src="/stream?id=${mediaId || ''}&msgId=${msgIdToUse}" type="video/mp4" /></video>
                               <script src="https://cdn.plyr.io/3.7.8/plyr.js"></script>
                               <script>
                                   const player = new Plyr('#player', {
                                       autoplay: true,
                                       controls: ['play-large','play','progress','current-time','duration','captions','settings','pip','airplay','fullscreen'],
                                       settings: ['quality','speed'],
                                       seekTime: 10
                                   });
                                   const videoEl = document.querySelector('video');
                                   const container = document.getElementById('playerContainer');
                                   const hudOverlay = document.getElementById('hudOverlay');
                                   const hudTitle = document.getElementById('hudTitle');
                                   const hudBarFill = document.getElementById('hudBarFill');
                                   const hudValueText = document.getElementById('hudValueText');
                                   const toastNotice = document.getElementById('toastNotice');

                                   function isFSActive() {
                                       return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
                                   }

                                   function enterFS() {
                                       if (container.requestFullscreen) {
                                           container.requestFullscreen().catch(() => {});
                                       } else if (container.webkitRequestFullscreen) {
                                           container.webkitRequestFullscreen();
                                       }
                                   }

                                   function exitFS() {
                                       if (document.exitFullscreen) {
                                           document.exitFullscreen().catch(() => {});
                                       } else if (document.webkitExitFullscreen) {
                                           document.webkitExitFullscreen();
                                       } else if (document.mozCancelFullScreen) {
                                           document.mozCancelFullScreen();
                                       }
                                   }

                                   if (player.fullscreen) {
                                       player.fullscreen.enter = enterFS;
                                       player.fullscreen.exit = exitFS;
                                       player.fullscreen.toggle = function() {
                                           if (isFSActive()) {
                                               exitFS();
                                           } else {
                                               enterFS();
                                           }
                                       };
                                   }

                                   function syncFSState() {
                                       const active = isFSActive();
                                       if (player.elements && player.elements.container) {
                                           player.elements.container.classList.toggle('plyr--fullscreen-active', active);
                                       }
                                   }

                                   document.addEventListener('fullscreenchange', syncFSState);
                                   document.addEventListener('webkitfullscreenchange', syncFSState);
                                   document.addEventListener('mozfullscreenchange', syncFSState);
                                   document.addEventListener('MSFullscreenChange', syncFSState);

                                   (function patchFullscreen() {
                                        const _req = Element.prototype.requestFullscreen;
                                        const _reqWk = Element.prototype.webkitRequestFullscreen;
                                        function patchedReq(opts) {
                                            const target = (this && this.closest && this.closest('.plyr')) ? container : (this || container);
                                            return _req ? _req.call(target, opts) : Promise.resolve();
                                        }
                                        function patchedReqWk() {
                                            const target = (this && this.closest && this.closest('.plyr')) ? container : (this || container);
                                            if (_reqWk) _reqWk.call(target);
                                        }
                                        if (_req) Element.prototype.requestFullscreen = patchedReq;
                                        if (_reqWk) Element.prototype.webkitRequestFullscreen = patchedReqWk;
                                    })();

                                    // Center controls elements
                                    const centerOverlay = document.getElementById('centerControlsOverlay');
                                    const centerRewindBtn = document.getElementById('centerRewindBtn');
                                    const centerPlayPauseBtn = document.getElementById('centerPlayPauseBtn');
                                    const centerPlayIcon = document.getElementById('centerPlayIcon');
                                    const centerPauseIcon = document.getElementById('centerPauseIcon');
                                    const centerForwardBtn = document.getElementById('centerForwardBtn');

                                    // Sync Play/Pause icons
                                    function syncPlayPauseState() {
                                        if (player.playing) {
                                            centerPlayIcon.style.display = 'none';
                                            centerPauseIcon.style.display = 'block';
                                        } else {
                                            centerPlayIcon.style.display = 'block';
                                            centerPauseIcon.style.display = 'none';
                                            showCenterControls();
                                        }
                                    }

                                    player.on('play', syncPlayPauseState);
                                    player.on('pause', syncPlayPauseState);

                                    centerPlayPauseBtn.onclick = (e) => {
                                        e.stopPropagation();
                                        player.togglePlay();
                                    };
                                    centerRewindBtn.onclick = (e) => {
                                        e.stopPropagation();
                                        player.rewind(10);
                                    };
                                    centerForwardBtn.onclick = (e) => {
                                        e.stopPropagation();
                                        player.forward(10);
                                    };

                                    // Auto-hide Center Controls during playback
                                    let centerHideTimer;
                                    function showCenterControls() {
                                        if (isLocked) return;
                                        centerOverlay.classList.remove('hidden-controls');
                                        clearTimeout(centerHideTimer);
                                        if (player.playing) {
                                            centerHideTimer = setTimeout(() => {
                                                centerOverlay.classList.add('hidden-controls');
                                            }, 2500);
                                        }
                                    }

                                    container.addEventListener('mousemove', showCenterControls);
                                    container.addEventListener('touchstart', showCenterControls);

                                    // --- Display Fit Modes (Contain / Stretch / Cover / 16:9) ---
                                    const fitModes = [
                                        { label: 'Contain', fit: 'contain' },
                                        { label: 'Stretch', fit: 'fill' },
                                        { label: 'Zoom', fit: 'cover' }
                                    ];
                                    let currentFitIndex = 0;
                                    const fitBtn = document.getElementById('fitBtn');
                                    const fitLabel = document.getElementById('fitLabel');

                                    fitBtn.onclick = () => {
                                        currentFitIndex = (currentFitIndex + 1) % fitModes.length;
                                        const mode = fitModes[currentFitIndex];
                                        videoEl.style.objectFit = mode.fit;
                                        fitLabel.textContent = mode.label;
                                        showToast('Screen Mode: ' + mode.label);
                                    };



                                    // --- Lock Screen Button ---
                                    const lockBtn = document.getElementById('lockBtn');
                                    const lockBlocker = document.getElementById('lockBlocker');
                                    const lockIconLocked = document.getElementById('lockIconLocked');
                                    const lockIconUnlocked = document.getElementById('lockIconUnlocked');
                                    const lockLabel = document.getElementById('lockLabel');
                                    let isLocked = false;
                                    let lockBtnTimer = null;

                                    function showLockBtn() {
                                        if (!isLocked) return;
                                        lockBtn.classList.remove('fade-out');
                                        clearTimeout(lockBtnTimer);
                                        lockBtnTimer = setTimeout(() => {
                                            if (isLocked) {
                                                lockBtn.classList.add('fade-out');
                                            }
                                        }, 2000);
                                    }

                                    function setLocked(locked) {
                                        isLocked = locked;
                                        container.classList.toggle('player-locked', locked);
                                        lockBlocker.classList.toggle('active', locked);
                                        lockBtn.classList.toggle('locked', locked);
                                        clearTimeout(lockBtnTimer);

                                        if (locked) {
                                            lockIconLocked.style.display = 'block';
                                            lockIconUnlocked.style.display = 'none';
                                            lockLabel.textContent = 'Unlock';
                                            centerOverlay.classList.add('hidden-controls');
                                            showLockBtn();
                                        } else {
                                            lockBtn.classList.remove('fade-out');
                                            lockIconLocked.style.display = 'none';
                                            lockIconUnlocked.style.display = 'block';
                                            lockLabel.textContent = 'Lock';
                                            showCenterControls();
                                        }
                                    }

                                    let hasClickedSmartlink = false;
                                    const smartlinkOverlay = document.getElementById('smartlinkOverlay');
                                    if (smartlinkOverlay) {
                                        smartlinkOverlay.onclick = (e) => {
                                            e.stopPropagation();
                                            if (!hasClickedSmartlink) {
                                                hasClickedSmartlink = true;
                                                window.open('https://bashsecret.com/b8t3p6w5?key=2d00a052eeae5f75fb5df01132aae507', '_blank');
                                                smartlinkOverlay.style.display = 'none';
                                                if (!player.playing) {
                                                    player.play();
                                                }
                                            }
                                        };
                                    }

                                    let lastLockAdTime = 0;
                                    lockBtn.onclick = (e) => {
                                        e.stopPropagation();
                                        const now = Date.now();
                                        const FIVE_MINUTES = 5 * 60 * 1000;
                                        if (!isLocked && (now - lastLockAdTime >= FIVE_MINUTES)) {
                                            lastLockAdTime = now;
                                            window.open('https://bashsecret.com/b8t3p6w5?key=2d00a052eeae5f75fb5df01132aae507', '_blank');
                                            return;
                                        }
                                        setLocked(!isLocked);
                                    };

                                    // Show unlock button for 2s on screen tap when locked
                                    lockBlocker.addEventListener('pointerdown', (e) => {
                                        onDragStart(e.clientX, e.clientY);
                                        showLockBtn();
                                    });

                                    // --- Toast Helper ---
                                    let toastTimer;
                                    function showToast(msg) {
                                        toastNotice.textContent = msg;
                                        toastNotice.classList.add('show');
                                        clearTimeout(toastTimer);
                                        toastTimer = setTimeout(() => {
                                            toastNotice.classList.remove('show');
                                        }, 2200);
                                    }

                                    // --- Touch / Drag Swipe Gestures for Volume (Right) & Brightness (Left) ---
                                    let currentBrightness = 100; // 20% to 200%
                                    let currentVolume = 100; // 0% to 100%
                                    let isDragging = false;
                                    let startY = 0;
                                    let startVal = 0;
                                    let dragSide = 'left'; // 'left' = brightness, 'right' = volume
                                    let hudTimer;

                                    function updateHUD(type, val) {
                                        if (type === 'brightness') {
                                            hudTitle.innerHTML = 'BRIGHTNESS';
                                            hudBarFill.style.width = Math.min(100, Math.max(0, (val / 200) * 100)) + '%';
                                            hudValueText.textContent = Math.round(val) + '%';
                                        } else {
                                            hudTitle.innerHTML = 'VOLUME';
                                            hudBarFill.style.width = Math.min(100, Math.max(0, val)) + '%';
                                            hudValueText.textContent = Math.round(val) + '%';
                                        }
                                        hudOverlay.classList.add('show');
                                        clearTimeout(hudTimer);
                                        hudTimer = setTimeout(() => {
                                            hudOverlay.classList.remove('show');
                                        }, 1200);
                                    }

                                    function onDragStart(clientX, clientY) {
                                        const rect = container.getBoundingClientRect();
                                        dragSide = (clientX - rect.left) < (rect.width / 2) ? 'left' : 'right';
                                        startY = clientY;
                                        startVal = dragSide === 'left' ? currentBrightness : currentVolume;
                                        isDragging = true;
                                    }

                                    function onDragMove(clientY) {
                                        if (!isDragging) return;
                                        const deltaY = startY - clientY; // drag up = positive
                                        const sensitivity = 0.5;

                                        if (dragSide === 'left') { // Brightness
                                            currentBrightness = Math.min(200, Math.max(20, startVal + deltaY * sensitivity));
                                            videoEl.style.filter = 'brightness(' + (currentBrightness / 100) + ')';
                                            updateHUD('brightness', currentBrightness);
                                        } else { // Volume
                                            currentVolume = Math.min(100, Math.max(0, startVal + deltaY * sensitivity));
                                            player.volume = currentVolume / 100;
                                            updateHUD('volume', currentVolume);
                                        }
                                    }

                                    function onDragEnd() {
                                        isDragging = false;
                                    }

                                    // Pointer Events
                                    container.addEventListener('pointerdown', (e) => {
                                        if (e.target.closest('.top-bar') || e.target.closest('.plyr__controls')) return;
                                        onDragStart(e.clientX, e.clientY);
                                    });
                                    window.addEventListener('pointermove', (e) => {
                                        if (isDragging) onDragMove(e.clientY);
                                    });
                                    window.addEventListener('pointerup', onDragEnd);

                                    // Keyboard shortcuts
                                    window.addEventListener('keydown', (e) => {
                                        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                                        if (e.key === 'ArrowLeft') {
                                            player.rewind(10);
                                        } else if (e.key === 'ArrowRight') {
                                            player.forward(10);
                                        } else if (e.key === 'ArrowUp') {
                                            e.preventDefault();
                                            currentVolume = Math.min(100, currentVolume + 10);
                                            player.volume = currentVolume / 100;
                                            updateHUD('volume', currentVolume);
                                        } else if (e.key === 'ArrowDown') {
                                            e.preventDefault();
                                            currentVolume = Math.max(0, currentVolume - 10);
                                            player.volume = currentVolume / 100;
                                            updateHUD('volume', currentVolume);
                                        }
                                    });
                                </script>`
                            : `<div class="no-video"><h2 style="color:#ef4444">Video Not Mapped</h2><p>Add <code>"messageId"</code> in <code>telegram-mapping.json</code> for ID <strong>${mediaId || '?'}</strong>.</p></div>`
                        }
                    </div>
                </body>
                </html>
            `);
            return;
        }

        // Stream endpoint - stream from Telegram using MTProto
        if (pathname === '/stream') {
            const mappings = getMappings();
            const entry = mediaId && mappings[mediaId];
            const msgIdToUse = messageId
                ? parseInt(messageId)
                : (entry && entry.messageId ? parseInt(entry.messageId) : null);
            const channelId = config.channelId;

            if (!msgIdToUse || !channelId) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Missing messageId or channelId');
                return;
            }

            try {
                if (!client.connected) {
                    try { await client.connect(); } catch (connErr) { console.error('Reconnecting error:', connErr.message); }
                }
                const message = await getCachedMessage(client, channelId, msgIdToUse);

                if (!message || !message.media) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Message not found or no media');
                    return;
                }

                // Get file size for range support
                const fileSize = message.media.document
                    ? message.media.document.size
                    : (message.media.photo ? 0 : 0);

                const rangeHeader = req.headers.range;
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

                const responseHeaders = {
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunkSize,
                    'Content-Type': 'video/mp4',
                    'Access-Control-Allow-Origin': '*',
                };
                if (fileSize > 0) {
                    responseHeaders['Content-Range'] = `bytes ${start}-${end}/${fileSize}`;
                }

                res.writeHead(206, responseHeaders);

                if (req.method === 'HEAD') {
                    res.end();
                    return;
                }

                // Stream the file in 512KB chunks using GramJS / teleproto iterDownload
                const iter = client.iterDownload(message, {
                    requestSize: 512 * 1024,
                    offset: bigInt(start),
                    limit: (end - start + 1 > 0) ? (end - start + 1) : undefined,
                });

                for await (const chunk of iter) {
                    if (!res.writableEnded) {
                        res.write(chunk);
                    } else {
                        break;
                    }
                }

                if (!res.writableEnded) {
                    res.end();
                }

            } catch (err) {
                console.error('Stream error:', err.message);
                if (!res.headersSent) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Stream Error: ' + err.message);
                }
            }
            return;
        }

        // Mapping API
        if (pathname === '/api/mapping') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(getMappings(), null, 2));
            return;
        }

        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    });

    server.listen(PORT, () => {
        console.log(`\n==================================================`);
        console.log(`🚀 SERVEUR MTProto VIP DÉMARRÉ SUR PORT ${PORT}`);
        console.log(`📍 Status : http://localhost:${PORT}/api/status`);
        console.log(`🎬 Player : http://localhost:${PORT}/player?id=550`);
        console.log(`==================================================\n`);
        console.log('👉 Maintenant ajoutez "messageId" dans telegram-mapping.json !');
        console.log('   Exemple: "550": { "title": "Film", "messageId": 2 }\n');
    });
}

main().catch(err => {
    console.error('\n❌ Erreur fatale:', err.message);
    process.exit(1);
});
