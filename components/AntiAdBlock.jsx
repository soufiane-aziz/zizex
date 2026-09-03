'use client';

import { useEffect, useState } from 'react';

export default function AntiAdBlock() {
  const [adBlockDetected, setAdBlockDetected] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let detected = false;

    // Method 1: Bait element detection
    // Ad blockers hide/remove elements with ad-related class names
    const bait = document.createElement('div');
    bait.setAttribute('class', 'ad ads adsbox ad-banner ad-unit doubleclick pub_300x250 pub_300x250m pub_728x90 adsbox googlepublisherplugin');
    bait.setAttribute('id', 'bait-ad');
    bait.style.cssText = 'width:1px;height:1px;position:absolute;top:-9999px;left:-9999px;opacity:0;pointer-events:none;';
    document.body.appendChild(bait);

    // Method 2: Try loading a known ad URL
    const testImg = new Image();
    let imgBlocked = false;
    testImg.onerror = () => { imgBlocked = true; };
    testImg.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?' + Date.now();

    // Allow small delay for DOM & network operations
    const timer = setTimeout(() => {
      // Check if bait element was hidden or removed
      if (bait.parentNode) {
        const style = window.getComputedStyle(bait);
        const rect = bait.getBoundingClientRect();
        const isHidden =
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          style.opacity === '0' ||
          rect.height === 0 ||
          rect.width === 0;

        if (isHidden) detected = true;
        bait.parentNode.removeChild(bait);
      } else {
        // Element was completely removed by the adblocker
        detected = true;
      }

      // Method 3: Check if window.google_jobrunner or adsbygoogle is blocked
      if (typeof window.canRunAds !== 'undefined' && !window.canRunAds) {
        detected = true;
      }

      setAdBlockDetected(detected);
      setChecking(false);
    }, 300);

    return () => {
      clearTimeout(timer);
      if (bait.parentNode) bait.parentNode.removeChild(bait);
    };
  }, []);

  if (checking || !adBlockDetected) return null;

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
        {/* Glow accent */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #e50914, transparent)',
        }} />

        {/* Icon */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(229,9,20,0.12)',
          border: '2px solid rgba(229,9,20,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: '32px',
        }}>
          🚫
        </div>

        {/* Title */}
        <h2 style={{
          color: '#ffffff',
          fontSize: '22px',
          fontWeight: '800',
          marginBottom: '12px',
          letterSpacing: '-0.5px',
        }}>
          AdBlocker Detected
        </h2>

        {/* Subtitle */}
        <p style={{
          color: '#9ca3af',
          fontSize: '14px',
          lineHeight: '1.7',
          marginBottom: '28px',
        }}>
          It looks like you&apos;re using an ad blocker.<br />
          <span style={{ color: '#d1d5db' }}>ZizHub is 100% free</span> and ads help us keep it running.<br />
          Please disable your ad blocker to continue watching.
        </p>

        {/* Steps */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '28px',
          textAlign: 'left',
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
                minWidth: '22px',
                height: '22px',
                borderRadius: '50%',
                background: 'rgba(229,9,20,0.15)',
                border: '1px solid rgba(229,9,20,0.3)',
                color: '#e50914',
                fontSize: '11px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {i + 1}
              </span>
              <span style={{ color: '#d1d5db', fontSize: '13px', lineHeight: '1.5' }}>{step}</span>
            </div>
          ))}
        </div>

        {/* Refresh Button */}
        <button
          onClick={() => window.location.reload()}
          style={{
            width: '100%',
            padding: '14px 24px',
            background: 'linear-gradient(135deg, #e50914, #b00710)',
            border: 'none',
            borderRadius: '12px',
            color: '#ffffff',
            fontSize: '15px',
            fontWeight: '800',
            cursor: 'pointer',
            letterSpacing: '0.02em',
            boxShadow: '0 4px 20px rgba(229,9,20,0.35)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 6px 28px rgba(229,9,20,0.5)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(229,9,20,0.35)';
          }}
        >
          ✓ &nbsp;I&apos;ve Disabled My AdBlocker — Refresh
        </button>

        {/* Small note */}
        <p style={{ color: '#4b5563', fontSize: '11px', marginTop: '16px' }}>
          Using Brave Browser? Go to <strong style={{ color: '#6b7280' }}>brave://settings/shields</strong> and disable shields for this site.
        </p>
      </div>
    </div>
  );
}
