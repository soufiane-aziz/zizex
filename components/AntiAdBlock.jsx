'use client';

import { useEffect, useState } from 'react';

export default function AntiAdBlock() {
  const [adBlockDetected, setAdBlockDetected] = useState(false);

  useEffect(() => {
    let baitDetected = false;
    let scriptDetected = false;
    let checksCompleted = 0;

    const finalize = () => {
      checksCompleted++;
      // Require both checks to complete. Trigger overlay only if at least one test positively identified a blocker.
      if (checksCompleted >= 2) {
        if (baitDetected || scriptDetected) {
          setAdBlockDetected(true);
        }
      }
    };

    // ─── Method 1: Bait Element Inspection ──────────────────────────────────
    // Extension adblockers (uBlock, AdBlock Plus) hide elements matching ad class names using CSS rules (display: none !important).
    const checkBaitElement = () => {
      const bait = document.createElement('div');
      bait.className = 'pub_300x250 pub_300x250m pub_728x90 adsbox doubleclick';
      bait.style.cssText =
        'width:1px;height:1px;position:absolute;top:-9999px;left:-9999px;' +
        'opacity:0;pointer-events:none;';
      document.body.appendChild(bait);

      setTimeout(() => {
        if (!bait.parentNode) {
          baitDetected = true;
        } else {
          const style = window.getComputedStyle(bait);
          if (style.display === 'none' || style.visibility === 'hidden') {
            baitDetected = true;
          }
          if (bait.parentNode) {
            bait.parentNode.removeChild(bait);
          }
        }
        finalize();
      }, 500);
    };

    // ─── Method 2: Network Script Load Test ──────────────────────────────────
    // DNS blockers (Pi-hole, NextDNS, Brave Shields) and network filters block requests to Google Ad domains, triggering script.onerror.
    // Normal browsers receive a 200 OK JS response, triggering script.onload.
    const checkAdScript = () => {
      const script = document.createElement('script');
      let settled = false;

      const done = (wasBlocked) => {
        if (settled) return;
        settled = true;
        if (script.parentNode) script.parentNode.removeChild(script);
        if (wasBlocked) {
          scriptDetected = true;
        }
        finalize();
      };

      script.onload = () => done(false);
      script.onerror = () => done(true);
      // Valid Google AdSense URL that returns 200 OK on normal browsers
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.async = true;

      // 5s safety fallback: if network is extremely slow, treat as not blocked to prevent false positives
      setTimeout(() => done(false), 5000);

      document.head.appendChild(script);
    };

    // Delay start until 1000ms after page load so DOM & React hydration are fully settled
    const timer = setTimeout(() => {
      checkBaitElement();
      checkAdScript();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!adBlockDetected) return null;

  return (
    <div
      id="anti-adblock-overlay"
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn"
      style={{
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-zinc-900/95 via-black/95 to-zinc-950 border border-red-500/30 shadow-[0_0_60px_rgba(229,9,20,0.25)] text-center overflow-hidden">
        {/* Glowing Ambient Top Bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent shadow-[0_0_15px_#e50914]" />

        {/* Red Glow Light Effect */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-600/20 rounded-full blur-2xl pointer-events-none" />

        {/* Icon Badge */}
        <div className="relative mx-auto mb-5 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-b from-red-950/60 to-red-900/20 border border-red-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(229,9,20,0.3)]">
          <svg
            className="w-8 h-8 sm:w-10 sm:h-10 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-3">
          AdBlocker or DNS Detected
        </h2>

        {/* Simplified Message */}
        <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-6 font-medium">
          Please turn off your <span className="text-red-400 font-bold">AdBlocker</span> or <span className="text-red-400 font-bold">DNS Blocker</span> to continue using the site.
        </p>

        {/* Action Button */}
        <button
          onClick={() => window.location.reload()}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-extrabold text-sm sm:text-base tracking-wide shadow-[0_4px_25px_rgba(229,9,20,0.4)] transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          I Turned It Off — Refresh Page
        </button>
      </div>
    </div>
  );
}
