'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function InstallPWA({ locale = 'en' }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed / running as standalone app
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) return;

    // Check if already shown today
    const lastShown = localStorage.getItem('filmoxa_pwa_banner_last_shown');
    const today = new Date().toDateString();
    if (lastShown === today) {
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    if (isIosDevice) {
      // Show banner after short delay on iOS
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    }

    // Catch Chrome/Android beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Fallback: show banner after 2.5s anyway so user can see & install
    const fallbackTimer = setTimeout(() => {
      setShowBanner(true);
    }, 2500);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(fallbackTimer);
    };
  }, []);

  useEffect(() => {
    if (showBanner) {
      localStorage.setItem('filmoxa_pwa_banner_last_shown', new Date().toDateString());
    }
  }, [showBanner]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosInstructions(true);
    } else {
      // General instructions if event didn't trigger
      alert('To install Filmoxa:\n1. Open your browser menu (⋮)\n2. Tap "Add to Home Screen" or "Install App"');
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIosInstructions(false);
  };

  if (!showBanner) return null;

  const isAr = locale === 'ar';
  const isFr = locale === 'fr';

  const titleText = isAr ? 'تثبيت تطبيق Filmoxa' : isFr ? 'Installer l\'application Filmoxa' : 'Install Filmoxa App';
  const subText = isAr 
    ? 'بث سريع ووصول فوري من الشاشة الرئيسية' 
    : isFr 
    ? 'Streaming rapide et accès direct depuis votre écran d\'accueil' 
    : 'Fast streaming & instant access from your home screen';
  const btnText = isAr ? 'تثبيت الآن' : isFr ? 'Installer' : 'Install Now';

  return (
    <>
      {/* Floating Installation Banner */}
      <div className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-[9999] bg-black/95 border border-red-600/40 backdrop-blur-xl p-4 rounded-2xl shadow-[0_10px_30px_rgba(220,38,38,0.25)] flex items-center justify-between gap-3.5 animate-[fadeInUp_0.4s_ease-out] ${isAr ? 'rtl' : 'ltr'}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-md">
            <Image
              src="/logo.png?v=2"
              alt="Filmoxa Icon"
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <h4 className="text-white font-extrabold text-sm leading-tight truncate">{titleText}</h4>
            <p className="text-gray-400 text-xs mt-0.5 line-clamp-2 leading-snug">{subText}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md cursor-pointer whitespace-nowrap"
          >
            {btnText}
          </button>
          <button
            onClick={handleDismiss}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIosInstructions && (
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/10 p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl overflow-hidden border border-red-600/30">
              <Image src="/logo.png?v=2" alt="Filmoxa App" width={64} height={64} className="w-full h-full object-cover" />
            </div>
            <h3 className="text-white font-black text-lg mb-2">Install Filmoxa on iPhone</h3>
            <p className="text-gray-300 text-sm mb-5 leading-relaxed">
              1. Tap the <strong className="text-white">Share</strong> button <i className="fa-solid fa-share-nodes text-red-500"></i> at the bottom of Safari.<br/>
              2. Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong> <i className="fa-solid fa-square-plus text-red-500"></i>.
            </p>
            <button
              onClick={() => setShowIosInstructions(false)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
