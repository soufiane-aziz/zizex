'use client';

import { useEffect, useRef } from 'react';

export const SMARTLINK_URL = "https://bashsecret.com/depqume5u1?key=188fd2d515fce57c2cb1b2b4b6526c75";

/**
 * Global Popunder Smartlink Trigger
 * Opens smartlink once per session/click on the first interaction with the player or page
 */
export function handleSmartlinkClick() {
  if (typeof window === 'undefined') return;
  const lastClick = sessionStorage.getItem('zizex_smartlink_opened');
  if (!lastClick) {
    sessionStorage.setItem('zizex_smartlink_opened', '1');
    window.open(SMARTLINK_URL, '_blank', 'noopener,noreferrer');
  }
}

export default function AdBanner({ type, className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    // Clean up container before inserting
    containerRef.current.innerHTML = '';

    if (type === 'banner728') {
      const iframe = document.createElement('iframe');
      iframe.width = '728';
      iframe.height = '90';
      iframe.frameBorder = '0';
      iframe.scrolling = 'no';
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      iframe.srcdoc = `<!DOCTYPE html><html><head><style>body{margin:0;padding:0;overflow:hidden;display:flex;justify-content:center;align-items:center;background:transparent;}</style></head><body><script type="text/javascript">atOptions={'key':'736e71cf55bdd4d085b23cd047548876','format':'iframe','height':90,'width':728,'params':{}};</script><script type="text/javascript" src="https://bashsecret.com/736e71cf55bdd4d085b23cd047548876/invoke.js"></script></body></html>`;
      containerRef.current.appendChild(iframe);
    } else if (type === 'banner300') {
      const iframe = document.createElement('iframe');
      iframe.width = '300';
      iframe.height = '250';
      iframe.frameBorder = '0';
      iframe.scrolling = 'no';
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      iframe.srcdoc = `<!DOCTYPE html><html><head><style>body{margin:0;padding:0;overflow:hidden;display:flex;justify-content:center;align-items:center;background:transparent;}</style></head><body><script type="text/javascript">atOptions={'key':'7c7d1d921ddf657aa4817b96af0506ab','format':'iframe','height':250,'width':300,'params':{}};</script><script type="text/javascript" src="https://bashsecret.com/7c7d1d921ddf657aa4817b96af0506ab/invoke.js"></script></body></html>`;
      containerRef.current.appendChild(iframe);
    } else if (type === 'banner320') {
      const iframe = document.createElement('iframe');
      iframe.width = '320';
      iframe.height = '50';
      iframe.frameBorder = '0';
      iframe.scrolling = 'no';
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      iframe.srcdoc = `<!DOCTYPE html><html><head><style>body{margin:0;padding:0;overflow:hidden;display:flex;justify-content:center;align-items:center;background:transparent;}</style></head><body><script type="text/javascript">atOptions={'key':'b534187bb8a51ec3f65575e9d6c64a51','format':'iframe','height':50,'width':320,'params':{}};</script><script type="text/javascript" src="https://bashsecret.com/b534187bb8a51ec3f65575e9d6c64a51/invoke.js"></script></body></html>`;
      containerRef.current.appendChild(iframe);
    } else if (type === 'native') {
      const iframe = document.createElement('iframe');
      iframe.width = '100%';
      iframe.height = '280';
      iframe.frameBorder = '0';
      iframe.scrolling = 'no';
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      iframe.srcdoc = `<!DOCTYPE html><html><head><style>body{margin:0;padding:0;background:transparent;color:#fff;font-family:sans-serif;}</style></head><body><script async="async" data-cfasync="false" src="https://bashsecret.com/eec90b7f5011ad152cec13e0574bc37a/invoke.js"></script><div id="container-eec90b7f5011ad152cec13e0574bc37a"></div></body></html>`;
      containerRef.current.appendChild(iframe);
    }
  }, [type]);

  return (
    <div
      ref={containerRef}
      className={`flex items-center justify-center my-4 overflow-hidden min-h-[50px] ${className}`}
    />
  );
}
