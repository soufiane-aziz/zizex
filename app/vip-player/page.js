import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export default async function VipPlayerPage({ searchParams }) {
    const params = await searchParams;
    const mediaId = params?.id;
    const messageId = params?.msgId;
    const slugParam = params?.slug || '';
    const localeParam = params?.locale || 'fr';

    let mappings = {};
    try {
        const mappingPath = path.join(process.cwd(), 'telegram-mapping.json');
        if (fs.existsSync(mappingPath)) {
            mappings = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
        }
    } catch (e) {}

    const entry = mediaId && mappings[mediaId];
    const title = entry ? entry.title : `VIP Stream ${mediaId}`;
    const msgIdToUse = messageId || (entry ? entry.messageId : null);

    const prevS = params?.prevS;
    const prevE = params?.prevE;
    const nextS = params?.nextS;
    const nextE = params?.nextE;

    let nextEpUrl = '';
    let prevEpUrl = '';

    if (slugParam) {
        if (nextS && nextE) {
            nextEpUrl = `/${localeParam}/tv/${slugParam}?season=${nextS}&episode=${nextE}`;
        }
        if (prevS && prevE) {
            prevEpUrl = `/${localeParam}/tv/${slugParam}?season=${prevS}&episode=${prevE}`;
        }
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>${title} - ZizHub VIP Player</title>
        <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
        <style>
            * { box-sizing: border-box; touch-action: manipulation; }
            html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
            .player-container { relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #000; overflow: hidden; user-select: none; }
            .plyr { width: 100%; height: 100%; max-height: 100vh; --plyr-color-main: #dc2626; }
            .plyr video { transition: filter 0.1s ease, object-fit 0.2s ease; }

            .top-bar { position: absolute; top: 12px; left: 12px; right: 12px; z-index: 30; display: flex; align-items: center; justify-content: space-between; pointer-events: none; }
            .top-left { display: flex; align-items: center; gap: 8px; pointer-events: auto; }
            .top-right { display: flex; align-items: center; gap: 8px; pointer-events: auto; }
            .btn-vip-action { background: rgba(20, 20, 20, 0.85); color: #fff; border: 1px solid rgba(255,255,255,0.15); font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 20px; cursor: pointer; backdrop-filter: blur(10px); display: flex; align-items: center; gap: 6px; transition: all 0.2s ease; }
            .btn-vip-action.btn-icon-only { padding: 6px 10px; }
            .btn-vip-action:hover { background: rgba(220, 38, 38, 0.9); border-color: rgba(220, 38, 38, 1); transform: translateY(-1px); }
            .btn-vip-action:active { transform: scale(0.95); }

            .btn-lock { background: #dc2626; color: #fff; border: 1px solid #dc2626; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 20px; cursor: pointer; backdrop-filter: blur(10px); display: flex; align-items: center; gap: 6px; transition: opacity 0.3s ease, transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease; box-shadow: 0 4px 15px rgba(220, 38, 38, 0.5); }
            .btn-lock:hover { background: #b91c1c; border-color: #b91c1c; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(220, 38, 38, 0.7); }
            .btn-lock:active { transform: scale(0.95); }
            .btn-lock.locked { background: #dc2626; border-color: #dc2626; color: #fff; box-shadow: 0 0 20px rgba(220, 38, 38, 0.9); }

            .lock-blocker { position: absolute; inset: 0; z-index: 28; display: none; touch-action: none; cursor: default; }
            .lock-blocker.active { display: block; }

            .player-locked .center-controls-overlay { opacity: 0 !important; pointer-events: none !important; }
            .player-locked .top-left { opacity: 0 !important; pointer-events: none !important; }
            .player-locked #fitBtn { opacity: 0 !important; pointer-events: none !important; }
            .player-locked .plyr__controls { opacity: 0 !important; pointer-events: none !important; transition: none !important; }
            .player-locked .btn-lock { z-index: 70 !important; opacity: 1; pointer-events: auto !important; }
            .player-locked .btn-lock.fade-out { opacity: 0 !important; pointer-events: none !important; }

            .hud-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 40; background: rgba(0, 0, 0, 0.85); color: #fff; padding: 14px 22px; border-radius: 16px; backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.15); display: flex; flex-direction: column; align-items: center; gap: 8px; pointer-events: none; opacity: 0; transition: opacity 0.25s ease, transform 0.25s ease; box-shadow: 0 8px 30px rgba(0,0,0,0.6); }
            .hud-overlay.show { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
            .hud-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #fca5a5; display: flex; align-items: center; gap: 6px; }
            .hud-bar-container { width: 140px; height: 6px; background: rgba(255,255,255,0.2); border-radius: 3px; overflow: hidden; }
            .hud-bar-fill { height: 100%; width: 50%; background: #dc2626; border-radius: 3px; transition: width 0.1s linear; }

            .toast-notice { position: absolute; bottom: 80px; left: 50%; transform: translateX(-50%) translateY(20px); z-index: 50; background: #dc2626; color: #fff; font-size: 13px; font-weight: 700; padding: 10px 20px; border-radius: 30px; box-shadow: 0 6px 20px rgba(220, 38, 38, 0.5); opacity: 0; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); pointer-events: none; }
            .toast-notice.show { opacity: 1; transform: translateX(-50%) translateY(0); }

            .center-controls-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 25; display: flex; align-items: center; gap: 24px; transition: opacity 0.3s ease, transform 0.3s ease; }
            .center-controls-overlay.hidden-controls { opacity: 0; pointer-events: none; transform: translate(-50%, -50%) scale(0.95); }
            
            .center-btn { background: rgba(15, 15, 15, 0.8); border: 1.5px solid rgba(255, 255, 255, 0.2); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; backdrop-filter: blur(12px); box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6); transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
            .center-btn:hover { background: #dc2626; border-color: #dc2626; transform: scale(1.14); box-shadow: 0 0 25px rgba(220, 38, 38, 0.7); }
            .center-btn:active { transform: scale(0.92); }
            
            .center-btn-skip { width: 56px; height: 56px; flex-direction: column; gap: 0px; }
            .center-btn-skip .skip-num { font-size: 10px; font-weight: 800; letter-spacing: -0.3px; margin-top: -2px; }
            .center-btn-main { width: 72px; height: 72px; background: #dc2626; border-color: rgba(255, 255, 255, 0.4); box-shadow: 0 4px 20px rgba(220, 38, 38, 0.6); }
            .no-video { color: #aaa; font-family: system-ui; text-align: center; padding: 2rem; }

            @media (max-width: 640px) {
                .top-bar { top: 8px; left: 8px; right: 8px; }
                .btn-vip-action, .btn-lock { font-size: 11px; padding: 5px 10px; }
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
                    <button class="btn-vip-action" id="fitBtn" title="Display Mode">
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

            <div class="lock-blocker" id="lockBlocker"></div>

            <div class="center-controls-overlay" id="centerControlsOverlay">
                <button class="center-btn center-btn-skip" id="centerRewindBtn" title="Rewind 10s">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 17l-5-5 5-5"/><path d="M18 17l-5-5 5-5"/></svg>
                    <span class="skip-num">10s</span>
                </button>
                <button class="center-btn center-btn-main" id="centerPlayPauseBtn" title="Play/Pause">
                    <svg id="centerPlayIcon" width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    <svg id="centerPauseIcon" width="30" height="30" viewBox="0 0 24 24" fill="currentColor" style="display:none;"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                </button>
                <button class="center-btn center-btn-skip" id="centerForwardBtn" title="Forward 10s">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 17l5-5-5-5"/><path d="M6 17l5-5-5-5"/></svg>
                    <span class="skip-num">10s</span>
                </button>
            </div>

            <div class="hud-overlay" id="hudOverlay">
                <div class="hud-title" id="hudTitle">VOLUME</div>
                <div class="hud-bar-container">
                    <div class="hud-bar-fill" id="hudBarFill"></div>
                </div>
                <div style="font-size: 12px; font-weight: 800;" id="hudValueText">100%</div>
            </div>

            <div class="toast-notice" id="toastNotice">Link copied to clipboard!</div>
            ${msgIdToUse
                ? `<video id="player" playsinline controls preload="metadata" x-webkit-airplay="allow"><source src="/api/vip-stream?id=${mediaId || ''}&msgId=${msgIdToUse}" type="video/mp4" /></video>
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
                       const centerOverlay = document.getElementById('centerControlsOverlay');
                       const centerRewindBtn = document.getElementById('centerRewindBtn');
                       const centerPlayPauseBtn = document.getElementById('centerPlayPauseBtn');
                       const centerPlayIcon = document.getElementById('centerPlayIcon');
                       const centerPauseIcon = document.getElementById('centerPauseIcon');
                       const centerForwardBtn = document.getElementById('centerForwardBtn');
                       const fitBtn = document.getElementById('fitBtn');
                       const fitLabel = document.getElementById('fitLabel');
                       const lockBtn = document.getElementById('lockBtn');
                       const lockIconLocked = document.getElementById('lockIconLocked');
                       const lockIconUnlocked = document.getElementById('lockIconUnlocked');
                       const lockLabel = document.getElementById('lockLabel');
                       const lockBlocker = document.getElementById('lockBlocker');

                       function isFSActive() {
                           return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
                       }
                       function enterFS() {
                           if (container.requestFullscreen) container.requestFullscreen().catch(()=>{});
                           else if (container.webkitRequestFullscreen) container.webkitRequestFullscreen();
                       }
                       function exitFS() {
                           if (document.exitFullscreen) document.exitFullscreen().catch(()=>{});
                           else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
                       }
                       if (player.fullscreen) {
                           player.fullscreen.enter = enterFS;
                           player.fullscreen.exit = exitFS;
                           player.fullscreen.toggle = function() { isFSActive() ? exitFS() : enterFS(); };
                       }
                       function syncFSState() {
                           const active = isFSActive();
                           if (player.elements && player.elements.container) {
                               player.elements.container.classList.toggle('plyr--fullscreen-active', active);
                           }
                       }
                       document.addEventListener('fullscreenchange', syncFSState);
                       document.addEventListener('webkitfullscreenchange', syncFSState);

                       function syncPlayPauseState() {
                           if (player.playing) {
                               centerPlayIcon.style.display = 'none';
                               centerPauseIcon.style.display = 'block';
                           } else {
                               centerPlayIcon.style.display = 'block';
                               centerPauseIcon.style.display = 'none';
                               centerOverlay.classList.remove('hidden-controls');
                           }
                       }
                       player.on('play', syncPlayPauseState);
                       player.on('pause', syncPlayPauseState);

                       centerPlayPauseBtn.onclick = (e) => { e.stopPropagation(); player.togglePlay(); };
                       centerRewindBtn.onclick = (e) => { e.stopPropagation(); player.rewind(10); };
                       centerForwardBtn.onclick = (e) => { e.stopPropagation(); player.forward(10); };

                       let isLocked = false;
                       let lockBtnTimer;
                       function showLockBtn() {
                           if (!isLocked) return;
                           lockBtn.classList.remove('fade-out');
                           clearTimeout(lockBtnTimer);
                           lockBtnTimer = setTimeout(() => { if (isLocked) lockBtn.classList.add('fade-out'); }, 2000);
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
                               centerOverlay.classList.remove('hidden-controls');
                           }
                       }
                       lockBtn.onclick = (e) => { e.stopPropagation(); setLocked(!isLocked); };
                       lockBlocker.addEventListener('pointerdown', (e) => { showLockBtn(); });

                       const fitModes = [{ label: 'Contain', fit: 'contain' }, { label: 'Stretch', fit: 'fill' }, { label: 'Zoom', fit: 'cover' }];
                       let currentFitIndex = 0;
                       fitBtn.onclick = () => {
                           currentFitIndex = (currentFitIndex + 1) % fitModes.length;
                           const mode = fitModes[currentFitIndex];
                           videoEl.style.objectFit = mode.fit;
                           fitLabel.textContent = mode.label;
                       };
                   </script>`
                : `<div class="no-video">Movie or episode not found in mapping.</div>`
            }
        </div>
    </body>
    </html>
    `;

    return (
        <div 
            style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', background: '#000' }}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
    );
}
