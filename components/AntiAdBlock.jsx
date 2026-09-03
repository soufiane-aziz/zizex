'use client';

import { useEffect, useState } from 'react';

export default function AntiAdBlock() {
  const [adBlockDetected, setAdBlockDetected] = useState(false);

  useEffect(() => {
    let detected = false;
    let checksCompleted = 0;
    const TOTAL_CHECKS = 2; // Both checks must finish before we decide

    const finalize = () => {
      checksCompleted++;
      // Only show overlay once both checks have completed
      if (checksCompleted >= TOTAL_CHECKS && detected) {
        setAdBlockDetected(true);
      }
    };

    // ─── Method 1: Bait Element ───────────────────────────────────────────────
    // Extension-based adblockers (uBlock, AdBlock Plus) hide or remove
    // elements with these class names via cosmetic filter rules.
    const checkBaitElement = () => {
      const bait = document.createElement('div');
      bait.className = 'pub_300x250 pub_300x250m pub_728x90 adsbox doubleclick';
      bait.style.cssText =
        'width:1px;height:1px;position:absolute;top:-9999px;left:-9999px;' +
        'opacity:0;pointer-events:none;';
      document.body.appendChild(bait);

      setTimeout(() => {
        if (!bait.parentNode) {
          // Element was completely removed from DOM
          detected = true;
        } else {
          const style = window.getComputedStyle(bait);
          if (
            style.display === 'none' ||
            style.visibility === 'hidden' ||
            bait.offsetHeight === 0 ||
            bait.offsetWidth === 0
          ) {
            detected = true;
          }
          bait.parentNode.removeChild(bait);
        }
        finalize();
      }, 600);
    };

    // ─── Method 2: Ad Script Load Test ───────────────────────────────────────
    // DNS-level blockers (Pi-hole, NextDNS, Brave Shields, 1.1.1.1 families filter)
    // prevent the DNS lookup from resolving, so the script's onerror fires.
    // Extension-based blockers also intercept this request.
    // NOTE: Unlike an Image test, a <script> tag's onload fires when the
    //       server actually returns valid JS — so it does NOT false-positive.
    const checkAdScript = () => {
      const script = document.createElement('script');
      let settled = false;

      const done = (wasBlocked) => {
        if (settled) return;
        settled = true;
        if (script.parentNode) script.parentNode.removeChild(script);
        if (wasBlocked) detected = true;
        finalize();
      };

      // onload → script fetched successfully → no blocker
      script.onload = () => done(false);
      // onerror → DNS blocked, extension blocked, or request cancelled → blocker
      script.onerror = () => done(true);
      // Cache-bust so browser doesn't serve a cached 204/error
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?' + Date.now();
      script.async = true;

      // 6s safety timeout: if no response at all (extreme slow network),
      // assume no blocker to avoid false positives on slow connections.
      setTimeout(() => done(false), 6000);

      document.head.appendChild(script);
    };

    // Start both checks after 800ms so React hydration is stable
    const timer = setTimeout(() => {
      checkBaitElement();
      checkAdScript();
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (!adBlockDetected) return null;

  return (
    <div
      id="anti-adblock-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(0,0,0,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: '16px',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 50%, #0f0f0f 100%)',
          border: '1px solid rgba(229,9,20,0.4)',
          borderRadius: '20px',
          padding: '40px 32px',
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 0 80px rgba(229,9,20,0.15), 0 25px 60px rgba(0,0,0,0.8)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, #e50914, transparent)',
        }} />

        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'rgba(229,9,20,0.12)', border: '2px solid rgba(229,9,20,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', fontSize: '32px',
        }}>🚫</div>

        <h2 style={{ color: '#ffffff', fontSize: '22px', fontWeight: '800', marginBottom: '12px', letterSpacing: '-0.5px' }}>
          AdBlocker Detected
        </h2>

        <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.7', marginBottom: '28px' }}>
          It looks like you&apos;re using an ad blocker or DNS filter.<br />
          <span style={{ color: '#d1d5db' }}>ZizHub is 100% free</span> and ads help us keep it running.<br />
          Please disable your ad blocker to continue watching.
        </p>

        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px', padding: '16px 20px', marginBottom: '28px', textAlign: 'left',
        }}>
          <p style={{ color: '#6b7280', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
            How to fix
          </p>
          {[
            'Click the ad blocker icon in your browser toolbar',
            'Select "Disable on this site" or "Whitelist zizhub.com"',
            'Refresh the page',
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: i < 2 ? '8px' : 0 }}>
              <span style={{
                minWidth: '22px', height: '22px', borderRadius: '50%',
                background: 'rgba(229,9,20,0.15)', border: '1px solid rgba(229,9,20,0.3)',
                color: '#e50914', fontSize: '11px', fontWeight: '800',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{i + 1}</span>
              <span style={{ color: '#d1d5db', fontSize: '13px', lineHeight: '1.5' }}>{step}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => window.location.reload()}
          style={{
            width: '100%', padding: '14px 24px',
            background: 'linear-gradient(135deg, #e50914, #b00710)',
            border: 'none', borderRadius: '12px', color: '#ffffff',
            fontSize: '15px', fontWeight: '800', cursor: 'pointer',
            letterSpacing: '0.02em', boxShadow: '0 4px 20px rgba(229,9,20,0.35)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          ✓ &nbsp;I&apos;ve Disabled My AdBlocker — Refresh
        </button>

        <p style={{ color: '#4b5563', fontSize: '11px', marginTop: '16px' }}>
          Using Brave Browser? Go to <strong style={{ color: '#6b7280' }}>brave://settings/shields</strong> and disable shields for this site.
        </p>
      </div>
    </div>
  );
}
